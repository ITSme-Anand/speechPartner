import type { DrillResponse, NarrationSubmitResponse } from "@/types";

export type ProcessingParams =
  | { kind: "narration"; title: string; audioUri: string }
  | {
      kind: "drill-scenario";
      title: string;
      audioUri: string;
      drillId: string;
      focusErrorClass: string;
    }
  | { kind: "start-drill"; narrationId: string };

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Home: undefined;
  Narrate: undefined;
  Processing: ProcessingParams;
  Result: NarrationSubmitResponse;
  DrillGuide: { narrationId: string };
  DrillConcept: DrillResponse;
  DrillMCQ: DrillResponse;
  DrillScenario: DrillResponse;
  DrillSummary: { drillId: string; focusErrorClass: string };
  Settings: undefined;
};
