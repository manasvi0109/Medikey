import React from "react";

interface LogoProps {
  className?: string;
}

export function MediKeyLogo({ className = "" }: LogoProps) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M23 9H9V23H23V9Z"
        fill="white"
        fillOpacity="0.3"
      />
      <path
        d="M15 16V9H9V23H15V16Z"
        fill="white"
      />
      <path
        d="M17 16V23H23V9H17V16Z"
        fill="white"
        fillOpacity="0.8"
      />
      <path
        d="M13 14H11V18H13V14Z"
        fill="currentColor"
      />
      <path
        d="M21 14H19V18H21V14Z"
        fill="currentColor"
      />
      <path
        d="M17 12L15 14V18L17 20L19 18V14L17 12Z"
        fill="white"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}