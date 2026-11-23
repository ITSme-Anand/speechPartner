import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { formatClock, useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import type { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "Narrate">;

const TOPIC_IDEAS = [
  "My weekend plans",
  "A movie I recently watched",
  "Ordering coffee",
  "A trip I want to take",
  "My morning routine",
  "A book I'm reading",
  "Directions to my favorite place",
  "A recipe I know by heart",
  "An interesting conversation I had",
  "My plans for next year",
];

const MAX_DURATION_SECONDS = 300; // 5 minutes

export function NarrateScreen({ navigation }: Props) {
  const [topic, setTopic] = useState("");
  const [topicLocked, setTopicLocked] = useState(false);
  const recorder = useVoiceRecorder({
    maxDurationSeconds: MAX_DURATION_SECONDS,
  });

  function pickRandomTopic() {
    const idea = TOPIC_IDEAS[Math.floor(Math.random() * TOPIC_IDEAS.length)];
    setTopic(idea ?? "");
  }

  function changeTopic() {
    setTopicLocked(false);
    recorder.reset();
  }

  async function handleRecordPress() {
    if (recorder.isRecording) {
      recorder.pause();
    } else if (recorder.isPaused) {
      recorder.resume();
    } else {
      await recorder.start();
    }
  }

  async function handleStop() {
    await recorder.stop();
  }

  function handleSubmit() {
    if (!recorder.finalUri || !topic.trim()) return;
    navigation.navigate("Processing", {
      kind: "narration",
      title: topic.trim(),
      audioUri: recorder.finalUri,
    });
  }

  if (!topicLocked) {
    return (
      <ScreenContainer>
        <View style={styles.topicWrap}>
          <Text style={styles.eyebrow}>What do you want to talk about?</Text>
          <Text style={styles.title}>Pick a topic</Text>

          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="Type your own topic..."
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            multiline
          />

          <Pressable style={styles.randomButton} onPress={pickRandomTopic}>
            <Feather name="shuffle" size={16} color={colors.purpleDeep} />
            <Text style={styles.randomLabel}>Give me a random topic</Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          <PrimaryButton
            label="Start with this topic"
            onPress={() => setTopicLocked(true)}
            disabled={!topic.trim()}
            icon={<Feather name="arrow-right" size={18} color={colors.white} />}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer background={colors.inkDeep}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityLabel="Cancel"
        >
          <Feather name="x" size={20} color="#B3A6BC" />
        </Pressable>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={styles.headerEyebrow} numberOfLines={1}>
            {topic}
          </Text>
          <Text style={styles.headerTitle}>Narrate</Text>
        </View>
        <Pressable onPress={changeTopic} accessibilityLabel="Change topic">
          <Feather name="edit-2" size={18} color="#B3A6BC" />
        </Pressable>
      </View>

      <View style={styles.center}>
        <View style={styles.listeningPill}>
          <Feather
            name={recorder.isRecording ? "mic" : "mic-off"}
            size={14}
            color={colors.white}
          />
          <Text style={styles.listeningLabel}>
            {recorder.isRecording
              ? "Speak naturally. I'm listening."
              : recorder.isPaused
                ? "Paused"
                : recorder.isStopped
                  ? "Recording ready to submit"
                  : "Tap the mic to start"}
          </Text>
        </View>

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
            onPress={handleStop}
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
  topicWrap: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.textTertiary,
  },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  input: {
    minHeight: 90,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    textAlignVertical: "top",
  },
  randomButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.accentTint,
  },
  randomLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.purpleDeep,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  headerEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: "#9C8FA6",
    maxWidth: 200,
  },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.white,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    paddingHorizontal: 30,
  },
  listeningPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  listeningLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: "#D9D0DE",
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
