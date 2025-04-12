import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "@shared/schema";
import { AlertTriangle, Edit, QrCode } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "react-qr-code";

interface EmergencyInfoCardProps {
  userProfile?: User;
}

export default function EmergencyInfoCard({ userProfile }: EmergencyInfoCardProps) {
  const [showQrCode, setShowQrCode] = useState(false);

  return (
    <Card className="mb-6 bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Emergency Information</h2>
          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">
            Always Accessible
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {userProfile?.bloodType || "Not specified"}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Allergies</h3>
            <p className="mt-1 text-sm text-gray-900">
              {userProfile?.allergies || "None recorded"}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Chronic Conditions</h3>
            <p className="mt-1 text-sm text-gray-900">
              {userProfile?.chronicConditions || "None recorded"}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Emergency Contact</h3>
            <p className="mt-1 text-sm text-gray-900">
              {userProfile?.emergencyContactName ? (
                <>
                  {userProfile.emergencyContactName}
                  <br />
                  {userProfile.emergencyContactPhone}
                </>
              ) : (
                "Not specified"
              )}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" className="mr-3">
            <Edit className="mr-2 h-4 w-4 text-gray-500" />
            Update Emergency Info
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowQrCode(true)}
          >
            <QrCode className="mr-2 h-4 w-4 text-white" />
            Show Emergency QR Code
          </Button>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Emergency Access QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                value={`https://medivault.app/emergency/${userProfile?.id || "user"}`} 
                size={200}
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
    </Card>
  );
}
