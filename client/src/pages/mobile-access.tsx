import { QRCodeAccess } from "@/components/ui/qr-code-access";

export default function MobileAccess() {
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Mobile Access
        </h1>
        <QRCodeAccess />
      </div>
    </div>
  );
}
