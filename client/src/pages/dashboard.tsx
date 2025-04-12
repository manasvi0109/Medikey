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
import { Shield, Calendar, Heart, FileText, Users, Bot } from "lucide-react";
import { Link } from "wouter";

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
      
      {/* Quick Access Feature Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Link href="/emergency">
          <a className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow hover:bg-primary-50">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Emergency Access</h3>
            <p className="text-xs text-gray-500 mt-1">Critical health info</p>
          </a>
        </Link>

        <Link href="/records">
          <a className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow hover:bg-primary-50">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Medical Records</h3>
            <p className="text-xs text-gray-500 mt-1">View & manage records</p>
          </a>
        </Link>

        <Link href="/appointments">
          <a className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow hover:bg-primary-50">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Appointments</h3>
            <p className="text-xs text-gray-500 mt-1">Schedule & track visits</p>
          </a>
        </Link>

        <Link href="/analytics">
          <a className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow hover:bg-primary-50">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
              <Heart className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Health Analytics</h3>
            <p className="text-xs text-gray-500 mt-1">Track your metrics</p>
          </a>
        </Link>

        <Link href="/family">
          <a className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow hover:bg-primary-50">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Family Vault</h3>
            <p className="text-xs text-gray-500 mt-1">Manage dependents</p>
          </a>
        </Link>

        <Link href="/assistant">
          <a className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow hover:bg-primary-50">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
              <Bot className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500 mt-1">Get health answers</p>
          </a>
        </Link>
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
      
      {/* Quick Access Feature Navigation Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col items-center">
              <Skeleton className="h-12 w-12 rounded-full mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Info Card Skeleton */}
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
