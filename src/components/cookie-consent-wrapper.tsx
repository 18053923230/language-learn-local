"use client";

import { CookieConsent } from "./cookie-consent";

export function CookieConsentWrapper() {
  return (
    <CookieConsent
      onAccept={(preferences) => {
        console.log("Cookie preferences accepted:", preferences);
        // Here you can initialize analytics based on preferences
        if (preferences.analytics) {
          // Initialize Google Analytics
          console.log("Analytics enabled");
        }
      }}
      onDecline={() => {
        console.log("Non-essential cookies declined");
      }}
    />
  );
}
