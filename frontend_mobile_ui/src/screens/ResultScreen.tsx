import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import type { RootStackParamList } from "@/navigation/types";
import { downloadAndShareFeedbackPdf } from "@/services/narrationService";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

function formatCategory(category: string): string {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ResultScreen({ route, navigation }: Props) {
  const result = route.params;
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadAndShareFeedbackPdf(result.narration_id);
    } catch {
      Alert.alert("Couldn't download PDF", "Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>{result.title}</Text>
        <Text style={styles.title}>Your feedback</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{result.summary}</Text>
        </View>

        {result.feedback.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>
              {result.feedback.length} thing
              {result.feedback.length === 1 ? "" : "s"} to look at
            </Text>
            {result.feedback.map((item, i) => (
              <View key={i} style={styles.feedbackCard}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {formatCategory(item.error_class)}
                  </Text>
                </View>
                <Text style={styles.original}>"{item.original_sentence}"</Text>
                <Text style={styles.explanation}>{item.explanation}</Text>
                <View style={styles.correctedRow}>
                  <Feather
                    name="corner-down-right"
                    size={14}
                    color={colors.sageDeep}
                  />
                  <Text style={styles.corrected}>
                    {item.corrected_sentence}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Start Drill Session"
          onPress={() =>
            navigation.navigate("DrillGuide", {
              narrationId: result.narration_id,
            })
          }
          icon={<Feather name="target" size={18} color={colors.white} />}
        />
        <View style={styles.footerRow}>
          <PrimaryButton
            label="Download PDF"
            onPress={handleDownload}
            loading={downloading}
            variant="dark"
            style={{ flex: 1 }}
          />
        </View>
        <Text
          style={styles.narrateAgain}
          onPress={() => navigation.navigate("Home")}
        >
          Back to Home
        </Text>
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
  summaryCard: {
    backgroundColor: colors.accentTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  summaryText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  feedbackCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
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
  original: {
    fontFamily: fonts.displayItalic,
    fontStyle: "italic",
    fontSize: 15,
    color: colors.ink,
  },
  explanation: {
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
    gap: spacing.sm,
  },
  footerRow: { flexDirection: "row", gap: spacing.sm },
  narrateAgain: {
    textAlign: "center",
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.purpleDeep,
    marginTop: spacing.xs,
  },
});
