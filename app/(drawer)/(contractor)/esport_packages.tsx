import React, { useEffect, useState } from "react";
import EsportPackageForm from "@/components/contractor/esport_package_form";
import {
  HallFormValues,
  emptyHallValues,
  loadSavedHall,
} from "@/components/contractor/hall_form";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useTheme } from "@/context/theme_context";

export default function EsportPackages() {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<HallFormValues | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    let mounted = true;
    loadSavedHall().then((saved) => {
      if (!mounted) return;
      setInitialData(saved ?? emptyHallValues());
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <OwnActivaterIndicator color={colors.backgroundColor} />;

  return <EsportPackageForm initialData={initialData ?? emptyHallValues()} />;
}
