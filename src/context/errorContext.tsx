import * as Sentry from "@sentry/react-native";
import React, { useEffect, ReactNode } from "react";
import { Text, View } from "react-native";

Sentry.init({
  dsn: "https://c2284e34e20ae8c69ed3d05f8971fbb2@o4508263161856000.ingest.us.sentry.io/4508263165132800",
  tracesSampleRate: 1.0,
});

interface CustomErrorBoundaryProps {
  error?: Error;
  children: ReactNode;
}

export function CustomErrorBoundary({
  error,
  children,
}: CustomErrorBoundaryProps) {
  useEffect(() => {
    if (error) {
      Sentry.captureException(error);
    }
  }, [error]);

  if (error) {
    // Show an error message if an error is caught in the boundary
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", fontSize: 18 }}>
          Something went wrong!
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}
