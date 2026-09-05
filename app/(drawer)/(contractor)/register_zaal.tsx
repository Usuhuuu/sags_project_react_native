import { useEffect, useState } from "react";
import HallForm, {
  HallFormValues,
  emptyHallValues,
  loadSavedHall,
} from "@/components/contractor/hall_form";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import axiosInstance from "@/hooks/axiosInstance";

export default function ManageZaal() {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<HallFormValues | null>(null);

  async function fetchOwnHall() {
    try {
      const response = await axiosInstance.get("/auth/contractor");
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    let mounted = true;
    fetchOwnHall();

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
