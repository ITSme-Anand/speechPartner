import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import type { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "DrillConcept">;

function formatCategory(category: string): string {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DrillConceptScreen({ route, navigation }: Props) {
  const drill = route.params;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepRow}>
          <Text style={styles.stepLabel}>Stage 1 of 3</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {formatCategory(drill.focus_error_class)}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{drill.content.concept_title}</Text>
        <Text style={styles.explanation}>
          {drill.content.concept_explanation}
        </Text>

        {drill.content.examples.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>From your speech</Text>
            {drill.content.examples.map((example, i) => (
              <View key={i} style={styles.exampleCard}>
                <Text style={styles.original}>
                  "{example.original_sentence}"
                </Text>
                <Text style={styles.reason}>{example.reason_for_error}</Text>
                <View style={styles.correctedRow}>
                  <Feather
                    name="corner-down-right"
                    size={14}
                    color={colors.sageDeep}
                  />
                  <Text style={styles.corrected}>
                    {example.corrected_sentence}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue to Questions"
          onPress={() => navigation.navigate("DrillMCQ", drill)}
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
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.textTertiary,
  },
  badge: {
    backgroundColor: colors.tabTrack,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.purpleDeep,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  explanation: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  exampleCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 8,
  },
  original: {
    fontFamily: fonts.displayItalic,
    fontStyle: "italic",
    fontSize: 15,
    color: colors.ink,
  },
  reason: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  correctedRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  corrected: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.sageDeep,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
});
