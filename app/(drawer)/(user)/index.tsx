import React from "react";
import { Redirect } from "expo-router";

export default function UserIndex() {
  return <Redirect href="/(drawer)/(user)/(tabs-user)" />;
}
