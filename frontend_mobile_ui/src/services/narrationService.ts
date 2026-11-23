import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { api } from "@/lib/api";
import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";
import type {
  DrillResponse,
  DrillSummaryResponse,
  NarrationListItem,
  NarrationSubmitResponse,
} from "@/types";

/**
 * Calls into the real FastAPI backend (see backend/app/routers/narrations.py
 * and drills.py). Mirrors frontend/src/lib/api.ts's functions, adapted for
 * React Native's uri-based FormData and on-device PDF handling.
 */

export async function submitNarration(params: {
  audioUri: string;
  title: string;
  isDrill?: boolean;
  drillId?: string;
}): Promise<NarrationSubmitResponse> {
  const form = new FormData();
  form.append("title", params.title);
  form.append("is_drill", String(params.isDrill ?? false));
  if (params.drillId) form.append("drill_id", params.drillId);
  // React Native's FormData accepts this file-shaped object even though it
  // doesn't match the DOM File type; cast narrowly instead of using `any`.
  form.append("audio", {
    uri: params.audioUri,
    name: "recording.m4a",
    type: "audio/m4a",
  } as unknown as Blob);

  // Do NOT set a Content-Type header here: React Native's networking layer
  // must generate it itself for a FormData body, since it has to include a
  // boundary string. A manually-set "multipart/form-data" header without
  // one produces a body FastAPI's multipart parser can't read at all.
  const { data } = await api.post<NarrationSubmitResponse>(
    "/narrations/",
    form,
  );
  return data;
}

export async function getNarrations(): Promise<NarrationListItem[]> {
  const { data } = await api.get<NarrationListItem[]>("/narrations/");
  return data;
}

/** Downloads the feedback PDF and opens the native share sheet — there is
 * no browser download-link equivalent on-device. */
export async function downloadAndShareFeedbackPdf(
  narrationId: string,
): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const file = await File.downloadFileAsync(
    `${env.apiBaseUrl}/narrations/${narrationId}/feedback/pdf`,
    new Directory(Paths.cache),
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      idempotent: true,
    },
  );

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri);
  }
}

// ── Drills ──

export async function startDrill(narrationId: string): Promise<DrillResponse> {
  const { data } = await api.post<DrillResponse>("/drills", {
    narration_id: narrationId,
  });
  return data;
}

export async function submitMCQAnswer(
  stepId: string,
  selectedOptionId: string,
): Promise<void> {
  await api.patch(`/drill-steps/${stepId}`, {
    user_response: { selected_option_id: selectedOptionId },
  });
}

export async function getDrillSummary(
  drillId: string,
): Promise<DrillSummaryResponse> {
  const { data } = await api.get<DrillSummaryResponse>(
    `/drills/${drillId}/summary`,
  );
  return data;
}
