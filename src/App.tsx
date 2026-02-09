import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/pages/Dashboard";
import { NewProperty } from "@/pages/NewProperty";
import { PropertyDetail } from "@/pages/PropertyDetail";
import { GenerateListing } from "@/pages/GenerateListing";
import { SocialMedia } from "@/pages/SocialMedia";
import { EmailCampaign } from "@/pages/EmailCampaign";
import { BrandVoice } from "@/pages/BrandVoice";
import { Settings } from "@/pages/Settings";
import { useSettingsStore } from "@/stores/settingsStore";

function ApiKeyCheck() {
  const { isLoaded, apiKey, loadSettings } = useSettingsStore();

  useEffect(() => {
    if (!isLoaded) {
      loadSettings();
    }
  }, [isLoaded, loadSettings]);

  useEffect(() => {
    if (isLoaded && !apiKey) {
      toast("Add your Anthropic API key in Settings to start generating listings.", {
        icon: "\u{1F511}",
        duration: 6000,
        id: "api-key-missing",
      });
    }
  }, [isLoaded, apiKey]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <ApiKeyCheck />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/property/new" element={<NewProperty />} />
            <Route path="/property/:id" element={<PropertyDetail />}>
              <Route path="listing" element={<GenerateListing />} />
              <Route path="social" element={<SocialMedia />} />
              <Route path="email" element={<EmailCampaign />} />
            </Route>
            <Route path="/brand-voice" element={<BrandVoice />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}
