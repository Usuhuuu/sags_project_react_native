import ProfileDetailsPage from "@/components/contractor/profile_details_page";

export default function ContractorSecurity() {
  return (
    <ProfileDetailsPage
      title="Security"
      description="Keep your contractor account protected"
      items={[
        { label: "Password", value: "Change your password", icon: "lock", action: true },
        { label: "Two-factor authentication", value: "Add an extra layer of protection", icon: "shield", action: true },
        { label: "Active sessions", value: "Review devices signed into your account", icon: "smartphone", action: true },
      ]}
    />
  );
}
