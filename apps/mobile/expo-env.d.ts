/// <reference types="expo/types" />

/** Expo inlines EXPO_PUBLIC_* variables at bundle time; mobile does not need Node globals. */
declare const process: {
  env: Record<string, string | undefined>;
};
