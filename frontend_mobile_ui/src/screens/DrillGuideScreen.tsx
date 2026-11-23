import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import type { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "DrillGuide">;

const STAGES: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
}[] = [
  {
    icon: "book-open",
    title: "Learn",
    body: "We'll teach you the grammar concept behind your most frequent mistake, with examples from your own speech.",
  },
  {
    icon: "check-square",
    title: "Practice",
    body: "A few quick multiple-choice questions to check your understanding.",
  },
  {
    icon: "mic",
    title: "Speak",
    body: "Respond to a short scenario out loud so we can see if it sticks.",
  },
];

export function DrillGuideScreen({ route, navigation }: Props) {
  const { narrationId } = route.params;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>Drill session</Text>
        <Text style={styles.title}>Let's practice it</Text>
        <Text style={styles.subtitle}>
          Three short stages, about 2-3 minutes total.
        </Text>

        {STAGES.map((stage, i) => (
          <View key={stage.title} style={styles.stageCard}>
            <View style={styles.stageIcon}>
              <Feather name={stage.icon} size={20} color={colors.purpleDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stageEyebrow}>Stage {i + 1}</Text>
              <Text style={styles.stageTitle}>{stage.title}</Text>
              <Text style={styles.stageBody}>{stage.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Start Drills"
          onPress={() =>
            navigation.navigate("Processing", {
              kind: "start-drill",
              narrationId,
            })
          }
          icon={<Feather name="arrow-right" size={18} color={colors.white} />}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.textTertiary,
  },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  stageCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  stageIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  stageEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.textTertiary,
  },
  stageTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
    marginTop: 2,
  },
  stageBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
});
