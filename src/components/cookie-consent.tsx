"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Settings, Check, Info } from "lucide-react";

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
  onDecline: () => void;
}

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem("cookie-consent", JSON.stringify(allAccepted));
    setShowConsent(false);
    onAccept(allAccepted);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    setShowConsent(false);
    setShowSettings(false);
    onAccept(preferences);
  };

  const handleDecline = () => {
    const declined: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem("cookie-consent", JSON.stringify(declined));
    setShowConsent(false);
    onDecline();
  };

  const handlePreferenceChange = (
    type: keyof CookiePreferences,
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-white/95 backdrop-blur-md">
        {!showSettings ? (
          <>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      We Value Your Privacy
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      We use cookies to enhance your experience and analyze site
                      usage.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConsent(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-6">
                FluentReact uses cookies to provide essential functionality and
                improve your experience. Your video files are processed locally
                and never leave your device.
                <a
                  href="/privacy"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Learn more about our privacy practices.
                </a>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Accept All Cookies
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Decline Non-Essential
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Cookie Preferences
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        Essential Cookies
                      </Label>
                      <p className="text-xs text-gray-600">
                        Required for the website to function properly
                      </p>
                    </div>
                  </div>
                  <Switch checked={preferences.essential} disabled />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Info className="w-5 h-5 text-blue-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        Analytics Cookies
                      </Label>
                      <p className="text-xs text-gray-600">
                        Help us understand how visitors use our website
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("analytics", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Info className="w-5 h-5 text-purple-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        Marketing Cookies
                      </Label>
                      <p className="text-xs text-gray-600">
                        Used to deliver personalized content and ads
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("marketing", checked)
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  onClick={handleAcceptSelected}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Preferences
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
