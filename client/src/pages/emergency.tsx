"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, QrCode, Shield, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import QRCodeSVG from "react-qr-code"; // ✅ fixed import
import { useAuth } from "@/hooks/useAuth";
import { getEmergencyAccessQR } from "@/lib/api";
import { EmergencyQRCode } from "@/lib/types";

export default function Emergency() {
  const { user } = useAuth();
  const [showQrCode, setShowQrCode] = useState(false);

  const { data: qrCode, isLoading: qrLoading } = useQuery<EmergencyQRCode>({
    queryKey: ["emergency-qr-code"],
    queryFn: getEmergencyAccessQR,
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/users/profile");
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return res.json();
    }
  });

  const isLoading = qrLoading || profileLoading;

  const qrValue =
    qrCode?.url || `${typeof window !== "undefined" ? window.location.origin : ""}/emergency/${user?.id || "user"}`;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Emergency Access
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Critical health information for emergency situations
          </p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start dark:bg-red-100">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-red-800">Important Information</h3>
          <p className="mt-1 text-sm text-red-700">
            Share the QR code only with emergency healthcare providers.
          </p>
        </div>
      </div>

      {/* QR Code Card */}
      <Card className="mb-6">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-800 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-red-600" />
            Emergency QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-48 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                {qrValue ? <QRCodeSVG value={qrValue} size={200} /> : <p>Generating QR Code...</p>}
              </div>
              <p className="text-sm mt-4 text-gray-600 text-center">
                Scan this QR code to access medical data in emergencies.
              </p>
              <div className="flex items-center justify-center bg-red-50 p-3 rounded-md mt-2">
                <Clock className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-xs text-red-600">QR code expires in 24 hours.</p>
              </div>
              <Button className="mt-4" variant="outline" onClick={() => setShowQrCode(true)}>
                <QrCode className="mr-2 h-4 w-4" />
                View Full Screen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal + Medical Info */}
      <Card className="mb-6">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Critical Medical Info
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm text-gray-500 uppercase mb-2">Personal Information</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-1">
                  <p><strong>Full Name:</strong> {userProfile?.fullName || "Not available"}</p>
                  <p><strong>Date of Birth:</strong> {userProfile?.dateOfBirth || "Not specified"}</p>
                  <p><strong>Gender:</strong> {userProfile?.gender || "Not specified"}</p>
                  <p><strong>Blood Type:</strong> <span className="text-red-600 font-semibold">{userProfile?.bloodType || "Not specified"}</span></p>
                </div>
              </div>

              {/* Medical Info */}
              <div>
                <h3 className="text-sm text-gray-500 uppercase mb-2">Medical Information</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-1">
                  <p><strong>Allergies:</strong> {userProfile?.allergies || "None"}</p>
                  <p><strong>Chronic Conditions:</strong> {userProfile?.chronicConditions || "None"}</p>
                  <p><strong>Emergency Contact:</strong><br />
                    {userProfile?.emergencyContactName
                      ? `${userProfile.emergencyContactName} (${userProfile.emergencyContactPhone})`
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Emergency Access QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center p-4">
            {qrValue ? <QRCodeSVG value={qrValue} size={300} /> : <p>Generating QR Code...</p>}
            <p className="text-sm mt-4 text-gray-600 text-center">
              Only share with emergency healthcare providers.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
