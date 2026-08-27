import ProfileDetailsPage from "@/components/contractor/profile_details_page";

export default function ContractorBusinessCredentials() {
  return (
    <ProfileDetailsPage
      title="Business Credentials"
      description="Documents and verification for your business"
      items={[
        { label: "Business registration", value: "View or update registration details", icon: "briefcase", action: true },
        { label: "Business address", value: "Manage your registered address", icon: "map-pin", action: true },
        { label: "Verification documents", value: "Upload and review documents", icon: "file-text", action: true },
      ]}
    />
  );
}
