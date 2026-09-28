export async function getClientSettings() {
  return {
    riskProfile: "Moderate" as const,
    communicationMode: "Email" as const,
    kycVerified: false,
    fatcaCompleted: false,
    bankAccounts: [] as never[],
    nominees: [] as never[],
  };
}