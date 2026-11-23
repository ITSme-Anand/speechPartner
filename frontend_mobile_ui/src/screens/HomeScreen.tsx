import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import type { RootStackParamList } from "@/navigation/types";
import {
  downloadAndShareFeedbackPdf,
  getNarrations,
} from "@/services/narrationService";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { NarrationListItem } from "@/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { userEmail } = useAuth();
  const [narrations, setNarrations] = useState<NarrationListItem[] | null>(
    null,
  );
  const [loadError, setLoadError] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const displayName = userEmail ? userEmail.split("@")[0] || "there" : "there";

  const load = useCallback(() => {
    setLoadError(false);
    getNarrations()
      .then(setNarrations)
      .catch(() => setLoadError(true));
  }, []);

  // Refresh every time Home comes back into focus (e.g. after a new narration).
  useEffect(() => {
    return navigation.addListener("focus", load);
  }, [navigation, load]);

  async function handleDownload(id: string) {
    setDownloadingId(id);
    try {
      await downloadAndShareFeedbackPdf(id);
    } catch {
      Alert.alert("Couldn't download PDF", "Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.title}>Hey, {capitalize(displayName)}.</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            style={styles.avatar}
            accessibilityLabel="Open settings"
          >
            <Feather name="user" size={20} color={colors.white} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Past sessions</Text>

        {narrations === null && !loadError && (
          <ActivityIndicator
            color={colors.purpleDeep}
            style={{ marginTop: spacing.lg }}
          />
        )}
        {loadError && (
          <Text style={styles.errorText}>
            Couldn&apos;t load your sessions. Pull to refresh soon.
          </Text>
        )}
        {narrations?.length === 0 && (
          <Text style={styles.emptyText}>
            No sessions yet — start your first narration below.
          </Text>
        )}

        {narrations?.map((item) => (
          <View key={item.id} style={styles.sessionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionTitle}>{item.title}</Text>
              <Text style={styles.sessionDate}>
                {formatDate(item.created_at)}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDownload(item.id)}
              disabled={downloadingId === item.id}
              style={styles.downloadButton}
              accessibilityLabel={`Download PDF for ${item.title}`}
            >
              {downloadingId === item.id ? (
                <ActivityIndicator size="small" color={colors.purpleDeep} />
              ) : (
                <Feather name="download" size={16} color={colors.purpleDeep} />
              )}
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View style={styles.ctaWrap}>
        <PrimaryButton
          label="Start New Narration"
          onPress={() => navigation.navigate("Narrate")}
          icon={<Feather name="mic" size={18} color={colors.white} />}
        />
      </View>
    </ScreenContainer>
  );
}

function capitalize(s: string) {
  return s.length ? s[0]!.toUpperCase() + s.slice(1) : s;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.textTertiary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  errorText: {
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  sessionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  sessionDate: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  downloadButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
});
