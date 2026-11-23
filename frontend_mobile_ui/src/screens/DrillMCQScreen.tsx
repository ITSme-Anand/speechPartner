import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import type { RootStackParamList } from "@/navigation/types";
import { submitMCQAnswer } from "@/services/narrationService";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "DrillMCQ">;

export function DrillMCQScreen({ route, navigation }: Props) {
  const drill = route.params;
  const questions = drill.content.questions;
  const mcqStep = drill.steps.find((s) => s.step_type === "mcq");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const question = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  async function handleCheckAnswer() {
    if (!selectedOptionId) return;
    setSubmitted(true);
    if (mcqStep) {
      // Fire-and-forget: MCQ answers don't feed the EMA score, so a failed
      // write here shouldn't block the user from moving on.
      submitMCQAnswer(mcqStep.id, selectedOptionId).catch(() => {});
    }
  }

  function handleNext() {
    if (isLast) {
      navigation.navigate("DrillScenario", drill);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelectedOptionId(null);
    setSubmitted(false);
  }

  if (!question) return null;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepLabel}>
          Stage 2 of 3 — Question {currentIdx + 1} of {questions.length}
        </Text>
        <Text style={styles.question}>{question.question}</Text>

        <View style={{ gap: spacing.sm }}>
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.id === question.correct_option_id;
            const showResult = submitted;

            return (
              <Pressable
                key={option.id}
                onPress={() => !submitted && setSelectedOptionId(option.id)}
                disabled={submitted}
                style={[
                  styles.optionCard,
                  isSelected && !showResult && styles.optionCardSelected,
                  showResult && isCorrect && styles.optionCardCorrect,
                  showResult &&
                    isSelected &&
                    !isCorrect &&
                    styles.optionCardIncorrect,
                ]}
              >
                <View style={styles.optionRow}>
                  <Text style={styles.optionStatement}>{option.statement}</Text>
                  {showResult && isCorrect && (
                    <Feather
                      name="check-circle"
                      size={18}
                      color={colors.sageDeep}
                    />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <Feather name="x-circle" size={18} color={colors.rose} />
                  )}
                </View>
                {showResult && (isSelected || isCorrect) && (
                  <Text style={styles.optionReason}>{option.reason}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!submitted ? (
          <PrimaryButton
            label="Check Answer"
            onPress={handleCheckAnswer}
            disabled={!selectedOptionId}
          />
        ) : (
          <PrimaryButton
            label={isLast ? "Continue to Scenario" : "Next Question"}
            onPress={handleNext}
            icon={<Feather name="arrow-right" size={18} color={colors.white} />}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  stepLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.textTertiary,
  },
  question: {
    fontFamily: fonts.display,
    fontSize: 21,
    lineHeight: 28,
    color: colors.ink,
  },
  optionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  optionCardSelected: { borderColor: colors.purple },
  optionCardCorrect: {
    borderColor: colors.sage,
    backgroundColor: colors.successTint,
  },
  optionCardIncorrect: {
    borderColor: colors.rose,
    backgroundColor: "#FBEEF3",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  optionStatement: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  optionReason: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
});
