import ProfileDetailsPage from "@/components/contractor/profile_details_page";

export default function ContractorPaymentMethods() {
  return (
    <ProfileDetailsPage
      title="Payment Methods"
      description="Payout methods for your venues"
      items={[
        { label: "Bank account", value: "Add an account for payouts", icon: "credit-card", action: true },
        { label: "Payout schedule", value: "Review when payments are sent", icon: "calendar", action: true },
        { label: "Payment history", value: "View completed payouts", icon: "clock", action: true },
      ]}
    />
  );
}
