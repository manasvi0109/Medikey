import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, QrCode, Shield, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "react-qr-code";
import { useAuth } from "@/hooks/useAuth";
import { getEmergencyAccessQR } from "@/lib/api";
import { EmergencyQRCode } from "@/lib/types";

export default function Emergency() {
  const { user } = useAuth();
  const [showQrCode, setShowQrCode] = useState(false);

  const { data: qrCode, isLoading: qrLoading } = useQuery<EmergencyQRCode>({
    queryKey: ["/api/emergency/qr-code"],
    queryFn: getEmergencyAccessQR,
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/users/profile"],
  });

  const isLoading = qrLoading || profileLoading;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Emergency Access</h1>
          <p className="mt-1 text-sm text-gray-600">
            Critical health information for emergency situations
          </p>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-red-800">Important Information</h3>
          <p className="mt-1 text-sm text-red-700">
            This page provides access to your critical medical information for emergency situations. 
            Share the QR code only with emergency healthcare providers.
          </p>
        </div>
      </div>

      {/* Emergency QR Code Card */}
      <Card className="mb-6 bg-white rounded-lg shadow overflow-hidden">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="text-lg font-medium text-red-800 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-red-600" />
            Emergency Access QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-48 w-48 rounded-md" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                <QRCodeSVG 
                  value={qrCode?.url || `https://medikey.app/emergency/${user?.id || "user"}`} 
                  size={200}
                  level="H"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Scan this code to access critical medical information in case of emergency.
                </p>
                <div className="flex items-center justify-center bg-red-50 p-3 rounded-md">
                  <Clock className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-xs text-red-600">
                    This QR code expires in 24 hours for security.
                  </p>
                </div>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => setShowQrCode(true)}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  View Full Screen
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Information Card */}
      <Card className="mb-6 bg-white rounded-lg shadow overflow-hidden">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="text-lg font-medium text-red-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Critical Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Personal Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 block">Full Name</span>
                    <span className="text-base font-medium">{userProfile?.fullName}</span>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 block">Date of Birth</span>
                    <span className="text-base">{userProfile?.dateOfBirth || "Not specified"}</span>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 block">Gender</span>
                    <span className="text-base">{userProfile?.gender || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Blood Type</span>
                    <span className="text-lg font-semibold text-red-600">{userProfile?.bloodType || "Not specified"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Medical Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 block">Allergies</span>
                    <span className="text-base">{userProfile?.allergies || "None recorded"}</span>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 block">Chronic Conditions</span>
                    <span className="text-base">{userProfile?.chronicConditions || "None recorded"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Emergency Contact</span>
                    {userProfile?.emergencyContactName ? (
                      <div>
                        <span className="text-base">{userProfile.emergencyContactName}</span>
                        <br />
                        <span className="text-base">{userProfile.emergencyContactPhone}</span>
                      </div>
                    ) : (
                      <span className="text-base">Not specified</span>
                    )}
                  </div>
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
          <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                value={qrCode?.url || `https://medikey.app/emergency/${user?.id || "user"}`} 
                size={300}
                level="H"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Scan this code to access critical medical information in case of emergency.
              </p>
              <div className="flex items-center justify-center bg-red-50 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-xs text-red-600">
                  Only share with emergency healthcare providers.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
