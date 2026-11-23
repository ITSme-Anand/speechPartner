import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import type { RootStackParamList } from "./types";

import { useAuth } from "@/context/AuthContext";
import { AuthScreen } from "@/screens/AuthScreen";
import { DrillConceptScreen } from "@/screens/DrillConceptScreen";
import { DrillGuideScreen } from "@/screens/DrillGuideScreen";
import { DrillMCQScreen } from "@/screens/DrillMCQScreen";
import { DrillScenarioScreen } from "@/screens/DrillScenarioScreen";
import { DrillSummaryScreen } from "@/screens/DrillSummaryScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { NarrateScreen } from "@/screens/NarrateScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { ProcessingScreen } from "@/screens/ProcessingScreen";
import { ResultScreen } from "@/screens/ResultScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Two independent stacks (signed-out vs signed-in) instead of one stack with
 * conditional screens: this stops a signed-out user from being deep-linked
 * or navigated back into an authenticated screen, which is a common source
 * of accidental data exposure in apps that gate on render logic alone.
 */
export function RootNavigator() {
  const { isReady, isSignedIn, hasAcceptedConsent } = useAuth();

  if (!isReady) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isSignedIn ? (
          <>
            {!hasAcceptedConsent && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Narrate" component={NarrateScreen} />
            <Stack.Screen name="Processing" component={ProcessingScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="DrillGuide" component={DrillGuideScreen} />
            <Stack.Screen name="DrillConcept" component={DrillConceptScreen} />
            <Stack.Screen name="DrillMCQ" component={DrillMCQScreen} />
            <Stack.Screen
              name="DrillScenario"
              component={DrillScenarioScreen}
            />
            <Stack.Screen name="DrillSummary" component={DrillSummaryScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
