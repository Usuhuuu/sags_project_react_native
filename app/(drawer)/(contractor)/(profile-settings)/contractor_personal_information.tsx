import ProfileDetailsPage from "@/components/contractor/profile_details_page";

export default function ContractorPersonalInformation() {
  return (
    <ProfileDetailsPage
      title="Personal Information"
      description="Your account contact details"
      items={[
        { label: "Full name", value: "Manage your display name", icon: "user", action: true },
        { label: "Email address", value: "Manage your email address", icon: "mail", action: true },
        { label: "Phone number", value: "Add or update your phone number", icon: "phone", action: true },
      ]}
    />
  );
}
