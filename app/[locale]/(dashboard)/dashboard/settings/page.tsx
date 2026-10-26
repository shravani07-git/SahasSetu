"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Shield,
  Bell,
  Globe,
  Lock,
  Eye,
  Download,
  Trash2,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Key,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी (Hindi)" },
  { value: "mr", label: "मराठी (Marathi)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "te", label: "తెలుగు (Telugu)" },
  { value: "bn", label: "বাংলা (Bengali)" },
  { value: "gu", label: "ગુજરાતી (Gujarati)" },
  { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    // Profile
    name: "",
    email: "",
    phone: "",

    // Privacy
    anonymousMode: false,
    hideIdentity: true,
    encryptEverything: true,
    autoDeleteDrafts: false,
    autoDeleteDays: "30",

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    caseUpdates: true,
    counselingReminders: true,
    workshopAlerts: false,

    // Appearance
    language: "en",
    darkMode: false,
    compactView: false,

    // Security
    twoFactorEnabled: true,
    loginAlerts: true,
    sessionTimeout: "30",
  });

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settings.name,
          phone: settings.phone,
        }),
      });
      if (!res.ok) {
        console.error("Failed to save settings");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Globe },
    { id: "data", label: "Data & Export", icon: Download },
    { id: "account", label: "Account", icon: Settings },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar name={settings.name} size="xl" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {settings.name}
                </h3>
                <p className="text-sm text-gray-500">{settings.email}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Change Photo
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="flex gap-3 py-3">
                <Info className="w-5 h-5 text-info shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your profile information is encrypted and only visible to you unless you choose to share it.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Identity Protection</CardTitle>
                <CardDescription>Control how your identity is shared</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={settings.anonymousMode}
                  onChange={(checked) => setSettings({ ...settings, anonymousMode: checked })}
                  label="Anonymous Mode"
                  description="All your activities will be anonymous by default"
                />
                <Toggle
                  checked={settings.hideIdentity}
                  onChange={(checked) => setSettings({ ...settings, hideIdentity: checked })}
                  label="Hide Identity from Counselors"
                  description="Counselors won't see your personal details unless you reveal them"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Security</CardTitle>
                <CardDescription>Encryption and data retention settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={settings.encryptEverything}
                  onChange={(checked) => setSettings({ ...settings, encryptEverything: checked })}
                  label="Sensitive Data Encryption"
                  description="Encrypt all reports, evidence, and messages (Recommended)"
                />
                <Toggle
                  checked={settings.autoDeleteDrafts}
                  onChange={(checked) => setSettings({ ...settings, autoDeleteDrafts: checked })}
                  label="Auto-Delete Drafts"
                  description="Automatically delete draft reports after a period"
                />
                {settings.autoDeleteDrafts && (
                  <Select
                    label="Delete After"
                    options={[
                      { value: "7", label: "7 days" },
                      { value: "14", label: "14 days" },
                      { value: "30", label: "30 days" },
                      { value: "90", label: "90 days" },
                    ]}
                    value={settings.autoDeleteDays}
                    onChange={(e) => setSettings({ ...settings, autoDeleteDays: e.target.value })}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security Settings</CardTitle>
                <CardDescription>Protect your account access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={settings.twoFactorEnabled}
                  onChange={(checked) => setSettings({ ...settings, twoFactorEnabled: checked })}
                  label="Two-Factor Authentication"
                  description="Add an extra layer of security with OTP"
                />
                <Toggle
                  checked={settings.loginAlerts}
                  onChange={(checked) => setSettings({ ...settings, loginAlerts: checked })}
                  label="Login Alerts"
                  description="Get notified of new logins to your account"
                />
                <Select
                  label="Session Timeout"
                  options={[
                    { value: "15", label: "15 minutes" },
                    { value: "30", label: "30 minutes" },
                    { value: "60", label: "1 hour" },
                    { value: "120", label: "2 hours" },
                  ]}
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                />
                <Button variant="outline" leftIcon={<Key className="w-4 h-4" />}>
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Channels</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={settings.emailNotifications}
                  onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  label="Email Notifications"
                  description="Receive updates via email"
                />
                <Toggle
                  checked={settings.smsNotifications}
                  onChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                  label="SMS Notifications"
                  description="Receive updates via SMS"
                />
                <Toggle
                  checked={settings.pushNotifications}
                  onChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                  label="Push Notifications"
                  description="Receive browser notifications"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Types</CardTitle>
                <CardDescription>Select what you want to be notified about</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={settings.caseUpdates}
                  onChange={(checked) => setSettings({ ...settings, caseUpdates: checked })}
                  label="Case Updates"
                  description="Updates on your reported cases"
                />
                <Toggle
                  checked={settings.counselingReminders}
                  onChange={(checked) => setSettings({ ...settings, counselingReminders: checked })}
                  label="Counseling Reminders"
                  description="Reminders for scheduled sessions"
                />
                <Toggle
                  checked={settings.workshopAlerts}
                  onChange={(checked) => setSettings({ ...settings, workshopAlerts: checked })}
                  label="Workshop Alerts"
                  description="Notifications about new workshops and programs"
                />
              </CardContent>
            </Card>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Language</CardTitle>
                <CardDescription>Choose your preferred language</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  options={languages}
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Theme</CardTitle>
                <CardDescription>Customize the appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setSettings({ ...settings, darkMode: false })}
                    className={cn(
                      "flex-1 p-4 rounded-xl border-2 transition-all",
                      !settings.darkMode
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-sm font-medium">Light</p>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, darkMode: true })}
                    className={cn(
                      "flex-1 p-4 rounded-xl border-2 transition-all",
                      settings.darkMode
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm font-medium">Dark</p>
                  </button>
                </div>
                <Toggle
                  checked={settings.compactView}
                  onChange={(checked) => setSettings({ ...settings, compactView: checked })}
                  label="Compact View"
                  description="Use less spacing for a denser layout"
                />
              </CardContent>
            </Card>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Your Data</CardTitle>
                <CardDescription>Download a copy of all your data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Download all your reports, evidence metadata, and account information in a secure, encrypted format.
                </p>
                <Button
                  variant="outline"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => setShowExportModal(true)}
                >
                  Request Data Export
                </Button>
              </CardContent>
            </Card>

            <Card className="border-error/30">
              <CardHeader>
                <CardTitle className="text-base text-error">Delete Your Data</CardTitle>
                <CardDescription>Permanently remove all your data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  This will permanently delete all your reports, evidence, and account information. This action cannot be undone.
                </p>
                <Button
                  variant="danger"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete All Data
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Account Verified
                    </span>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Member since
                  </span>
                  <span className="text-sm font-medium">January 2026</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Sessions</CardTitle>
                <CardDescription>Devices currently logged into your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">This Device</p>
                      <p className="text-xs text-gray-500">Chrome on Linux • Active now</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Current</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-error/30">
              <CardHeader>
                <CardTitle className="text-base text-error">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between" leftIcon={<LogOut className="w-4 h-4" />}>
                  Sign out from all devices
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  className="w-full justify-between"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary-600" />
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account, privacy, and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      activeSection === section.id
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    )}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">{renderSection()}</div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8">
        <Button size="lg" className="shadow-lg" onClick={handleSaveSettings} disabled={saving}>
          {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete All Data"
        description="This action cannot be undone"
      >
        <div className="space-y-4">
          <Card className="bg-error/10 border-error/30">
            <CardContent className="flex gap-3 py-4">
              <AlertTriangle className="w-5 h-5 text-error shrink-0" />
              <div>
                <p className="font-medium text-error mb-1">Warning</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  This will permanently delete all your reports, evidence, counseling history, and account information. You will lose access to everything.
                </p>
              </div>
            </CardContent>
          </Card>

          <Input
            label="Type DELETE to confirm"
            placeholder="DELETE"
          />

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1">
              Delete Everything
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Your Data"
        description="Download a copy of your information"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {["Reports & Incidents", "Evidence Metadata", "Counseling History", "Account Information"].map((item) => (
              <label key={item} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="flex gap-3 py-3">
              <Shield className="w-5 h-5 text-info shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your export will be password-protected and encrypted.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" leftIcon={<Download className="w-4 h-4" />}>
              Generate Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
