import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import type { ProcessingParams, RootStackParamList } from "@/navigation/types";
import { startDrill, submitNarration } from "@/services/narrationService";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "Processing">;

const STEP_LABELS: Record<ProcessingParams["kind"], string[]> = {
  narration: [
    "Transcribing your voice",
    "Finding grammar patterns",
    "Preparing your feedback",
  ],
  "drill-scenario": [
    "Transcribing your voice",
    "Scoring your improvement",
    "Preparing your summary",
  ],
  "start-drill": [
    "Reviewing your error profile",
    "Building your personalized drill",
  ],
};

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;

    // No `response` means the request never got a reply at all — surface
    // *that* distinctly instead of a generic message, since it's a totally
    // different problem (network/server reachability) from a validation
    // error the backend actually returned.
    if (err.code === "ECONNABORTED") {
      return `Timed out waiting for the server (${err.config?.baseURL ?? ""}). The backend may be slow or unreachable.`;
    }
    if (!err.response) {
      return `Could not reach the server at ${err.config?.baseURL ?? "(no base URL configured)"}. Check that the backend is running and EXPO_PUBLIC_API_BASE_URL is correct. [${err.code ?? err.message}]`;
    }
    return `Server error ${err.response.status}: ${JSON.stringify(err.response.data).slice(0, 200)}`;
  }
  return `Unexpected error: ${err instanceof Error ? err.message : String(err)}`;
}

export function ProcessingScreen({ route, navigation }: Props) {
  const params = route.params;
  const steps = STEP_LABELS[params.kind];
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, 700);

    runAction(params)
      .then((goNext) => {
        if (!cancelled) goNext();
      })
      .catch((err) => {
        if (cancelled) return;
        Alert.alert("Couldn't finish processing", extractErrorMessage(err), [
          { text: "OK", onPress: () => navigation.navigate("Home") },
        ]);
      });

    return () => {
      cancelled = true;
      clearInterval(stepTimer);
    };
    // Runs once on mount for this specific params value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAction(p: ProcessingParams): Promise<() => void> {
    switch (p.kind) {
      case "narration": {
        const result = await submitNarration({
          audioUri: p.audioUri,
          title: p.title,
        });
        return () => navigation.replace("Result", result);
      }
      case "drill-scenario": {
        await submitNarration({
          audioUri: p.audioUri,
          title: p.title,
          isDrill: true,
          drillId: p.drillId,
        });
        return () =>
          navigation.replace("DrillSummary", {
            drillId: p.drillId,
            focusErrorClass: p.focusErrorClass,
          });
      }
      case "start-drill": {
        const drill = await startDrill(p.narrationId);
        return () => navigation.replace("DrillConcept", drill);
      }
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Feather name="loader" size={44} color={colors.purpleDeep} />
          </View>
        </View>

        <Text style={styles.title}>Just a moment&hellip;</Text>

        <View style={styles.checklist}>
          {steps.map((step, i) => (
            <View key={step} style={styles.checklistRow}>
              <View
                style={[
                  styles.dot,
                  i <= stepIndex ? styles.dotDone : styles.dotPending,
                ]}
              >
                {i <= stepIndex && (
                  <Feather name="check" size={13} color={colors.white} />
                )}
              </View>
              <Text
                style={[
                  styles.stepText,
                  i > stepIndex && styles.stepTextPending,
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footnote}>
          This can take up to a minute while the AI reads through your speech.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    paddingHorizontal: 30,
  },
  iconOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
    color: colors.ink,
    textAlign: "center",
  },
  checklist: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  checklistRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: { backgroundColor: colors.sage },
  dotPending: { backgroundColor: colors.purple, opacity: 0.4 },
  stepText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  stepTextPending: { color: colors.textSecondary },
  footnote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: "center",
  },
});
