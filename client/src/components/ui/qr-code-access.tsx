"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export function QRCodeAccess() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // You can change this route depending on where you want the QR to lead
    const mobileAccessURL = `${window.location.origin}/dashboard`;
    setUrl(mobileAccessURL);
  }, []);

  if (!url) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCode value={url} size={180} bgColor="#ffffff" fgColor="#000000" />
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center max-w-sm">
        Scan this QR code using your mobile phone to instantly access your MediKey dashboard.
      </p>
    </div>
  );
}
