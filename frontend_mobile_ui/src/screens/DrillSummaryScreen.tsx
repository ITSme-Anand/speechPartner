import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import type { RootStackParamList } from "@/navigation/types";
import { getDrillSummary } from "@/services/narrationService";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { DrillSummaryResponse } from "@/types";

type Props = NativeStackScreenProps<RootStackParamList, "DrillSummary">;

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 15;

function formatCategory(category: string): string {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DrillSummaryScreen({ route, navigation }: Props) {
  const { drillId, focusErrorClass } = route.params;
  const [summary, setSummary] = useState<DrillSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let pollCount = 0;

    function poll() {
      getDrillSummary(drillId)
        .then((data) => {
          if (cancelled) return;
          pollCount += 1;
          if (data.status === "processing" && pollCount < MAX_POLLS) {
            setTimeout(poll, POLL_INTERVAL_MS);
            return;
          }
          setSummary(data);
          setLoading(false);
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [drillId]);

  const focusClass = summary?.focus_error_class ?? focusErrorClass;
  const opportunityCount = summary?.focus_opportunity_count ?? 0;
  const errorCount = summary?.focus_error_count ?? 0;
  const hasOpportunities = opportunityCount > 0;
  const accuracy = hasOpportunities
    ? Math.round((1 - errorCount / opportunityCount) * 100)
    : null;

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator color={colors.purpleDeep} />
          <Text style={styles.loadingText}>Scoring your drill session…</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>Drill complete</Text>
        <Text style={styles.title}>{formatCategory(focusClass)}</Text>

        {accuracy !== null ? (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{errorCount}</Text>
              <Text style={styles.statLabel}>
                Error{errorCount === 1 ? "" : "s"}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{opportunityCount}</Text>
              <Text style={styles.statLabel}>Opportunities</Text>
            </View>
          </View>
        ) : (
          <View style={styles.summaryCard}>
            <Feather name="check-circle" size={22} color={colors.sageDeep} />
            <Text style={styles.summaryText}>
              No {formatCategory(focusClass).toLowerCase()} errors found in your
              scenario response. Nice work!
            </Text>
          </View>
        )}

        {summary?.feedback && summary.feedback.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>What to work on</Text>
            {summary.feedback.map((item, i) => (
              <View key={item.id ?? i} style={styles.feedbackCard}>
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
          label="Back to Home"
          onPress={() => navigation.navigate("Home")}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
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
  statsRow: { flexDirection: "row", gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.purpleDeep,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.textTertiary,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.successTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  summaryText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14.5,
    lineHeight: 20,
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
  },
});
