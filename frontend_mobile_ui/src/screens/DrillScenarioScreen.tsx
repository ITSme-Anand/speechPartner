import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { formatClock, useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import type { RootStackParamList } from "@/navigation/types";
import { colors, fonts, spacing } from "@/theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "DrillScenario">;

const MAX_DURATION_SECONDS = 120; // 2 minutes

export function DrillScenarioScreen({ route, navigation }: Props) {
  const drill = route.params;
  const recorder = useVoiceRecorder({
    maxDurationSeconds: MAX_DURATION_SECONDS,
  });

  async function handleRecordPress() {
    if (recorder.isRecording) {
      recorder.pause();
    } else if (recorder.isPaused) {
      recorder.resume();
    } else {
      await recorder.start();
    }
  }

  function handleSubmit() {
    if (!recorder.finalUri) return;
    navigation.navigate("Processing", {
      kind: "drill-scenario",
      title: `Drill Scenario: ${drill.content.concept_title}`,
      audioUri: recorder.finalUri,
      drillId: drill.drill_id,
      focusErrorClass: drill.focus_error_class,
    });
  }

  return (
    <ScreenContainer background={colors.inkDeep}>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>Stage 3 of 3</Text>
        <Text style={styles.headerTitle}>Speak it out</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.prompt}>{drill.content.scenario_prompt}</Text>

        <Pressable
          style={styles.micRing}
          onPress={handleRecordPress}
          disabled={recorder.isStopped}
          accessibilityLabel={
            recorder.isRecording ? "Pause recording" : "Start recording"
          }
        >
          <View style={styles.micCircle}>
            <Feather
              name={recorder.isRecording ? "pause" : "mic"}
              size={46}
              color={colors.purpleDeep}
            />
          </View>
        </Pressable>

        {recorder.error && (
          <Text style={styles.errorText}>{recorder.error}</Text>
        )}

        <Text style={styles.clock}>
          {formatClock(recorder.elapsedSeconds)} /{" "}
          {formatClock(MAX_DURATION_SECONDS)}
        </Text>
      </View>

      <View style={styles.footer}>
        {!recorder.isStopped ? (
          <Pressable
            style={[
              styles.finishButton,
              !(recorder.isRecording || recorder.isPaused) &&
                styles.finishButtonDisabled,
            ]}
            onPress={() => recorder.stop()}
            disabled={!(recorder.isRecording || recorder.isPaused)}
          >
            <Feather name="check" size={18} color={colors.ink} />
            <Text style={styles.finishLabel}>Finish recording</Text>
          </Pressable>
        ) : (
          <View style={{ width: "100%", gap: spacing.sm }}>
            <PrimaryButton label="Submit Recording" onPress={handleSubmit} />
            <Pressable onPress={() => recorder.reset()}>
              <Text style={styles.recordAgainLabel}>Record again</Text>
            </Pressable>
          </View>
        )}
        <Text style={styles.footnote}>Your voice stays private and secure</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: spacing.lg,
    gap: 2,
  },
  headerEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#9C8FA6",
  },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.white,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    paddingHorizontal: 30,
  },
  prompt: {
    fontFamily: fonts.displayItalic,
    fontStyle: "italic",
    fontSize: 20,
    lineHeight: 28,
    color: colors.white,
    textAlign: "center",
  },
  micRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: "rgba(198,159,213,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.rose,
    textAlign: "center",
  },
  clock: { fontFamily: fonts.body, fontSize: 13, color: "#9C8FA6" },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    alignItems: "center",
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    height: 60,
    borderRadius: 999,
    backgroundColor: colors.mimosa,
  },
  finishButtonDisabled: { opacity: 0.5 },
  finishLabel: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  recordAgainLabel: {
    textAlign: "center",
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: "#D9D0DE",
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.textTertiary,
  },
});
