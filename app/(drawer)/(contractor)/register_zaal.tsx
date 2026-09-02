import React, { useEffect, useState } from "react";
import HallForm, {
  HallFormValues,
  emptyHallValues,
  loadSavedHall,
} from "@/components/contractor/hall_form";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";

export default function ManageZaal() {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<HallFormValues | null>(null);

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

  if (loading) return <OwnActivaterIndicator />;

  const hasHall = !!initialData && initialData.hall_name.trim().length > 0;

  return (
    <HallForm
      mode={hasHall ? "edit" : "create"}
      initialData={initialData ?? undefined}
    />
  );
}