import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderPhase = "idle" | "recording" | "paused" | "stopped";

interface UseVoiceRecorderOptions {
  /** Auto-stop once this many seconds have elapsed. */
  maxDurationSeconds?: number;
}

/**
 * Record/pause/resume/stop with a live elapsed-time readout, shared by the
 * Narrate and Drill-Scenario screens (both need identical recording UX,
 * just different max durations and submit targets).
 */
export function useVoiceRecorder({
  maxDurationSeconds = 300,
}: UseVoiceRecorderOptions = {}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 250);
  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [finalUri, setFinalUri] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  const elapsedSeconds = Math.floor(state.durationMillis / 1000);

  const stop = useCallback(async () => {
    if (!hasStartedRef.current) return null;
    hasStartedRef.current = false;
    try {
      await recorder.stop();
      setPhase("stopped");
      setFinalUri(recorder.uri);
      return recorder.uri;
    } catch {
      setError("Could not save the recording. Please try again.");
      return null;
    }
  }, [recorder]);

  // Auto-stop at the cap.
  useEffect(() => {
    if (phase === "recording" && elapsedSeconds >= maxDurationSeconds) {
      stop().catch(() => {});
    }
  }, [phase, elapsedSeconds, maxDurationSeconds, stop]);

  // Release the microphone if the screen unmounts mid-recording.
  useEffect(() => {
    return () => {
      if (hasStartedRef.current) {
        hasStartedRef.current = false;
        recorder.stop().catch(() => {});
      }
    };
  }, [recorder]);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);
    setFinalUri(null);

    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError(
        "Microphone access is required to record. Enable it in Settings.",
      );
      return false;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      hasStartedRef.current = true;
      setPhase("recording");
      return true;
    } catch {
      setError("Could not start the microphone. Please try again.");
      return false;
    }
  }, [recorder]);

  const pause = useCallback(() => {
    if (!hasStartedRef.current) return;
    recorder.pause();
    setPhase("paused");
  }, [recorder]);

  const resume = useCallback(() => {
    if (!hasStartedRef.current) return;
    recorder.record();
    setPhase("recording");
  }, [recorder]);

  const reset = useCallback(() => {
    setPhase("idle");
    setFinalUri(null);
    setError(null);
  }, []);

  return {
    phase,
    isRecording: phase === "recording",
    isPaused: phase === "paused",
    isStopped: phase === "stopped",
    elapsedSeconds,
    finalUri,
    error,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
