import EmergencyInfoCard from "@/components/dashboard/EmergencyInfoCard";
import MedicalSummaryCard from "@/components/dashboard/MedicalSummaryCard";
import AppointmentsCard from "@/components/dashboard/AppointmentsCard";
import HealthAnalyticsSection from "@/components/dashboard/HealthAnalyticsSection";
import RecentMedicalRecordsSection from "@/components/dashboard/RecentMedicalRecordsSection";
import FamilyVaultSection from "@/components/dashboard/FamilyVaultSection";
import AIAssistantCard from "@/components/dashboard/AIAssistantCard";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: userProfile, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users/profile"],
  });

  if (userLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Health Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {userProfile?.fullName || user?.username}. Here's your health overview.
        </p>
      </div>

      {/* Emergency Information Card */}
      <EmergencyInfoCard userProfile={userProfile} />

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Medical Summary Card */}
        <MedicalSummaryCard className="lg:col-span-2" />
        {/* Upcoming Appointments Card */}
        <AppointmentsCard />
      </div>

      {/* Health Analytics Section */}
      <HealthAnalyticsSection />

      {/* Recent Medical Records Section */}
      <RecentMedicalRecordsSection />

      {/* Family Vault Section */}
      <FamilyVaultSection />

      {/* AI Assistant Card */}
      <AIAssistantCard />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      <Skeleton className="h-48 w-full mb-6" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>

      <Skeleton className="h-64 w-full mb-6" />
      <Skeleton className="h-80 w-full mb-6" />
      <Skeleton className="h-64 w-full mb-6" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
