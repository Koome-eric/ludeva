"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Wallet, Bell } from "lucide-react";
import io from "socket.io-client";

// Interfaces
interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Payment {
  accountName: string;
  bankName: string;
  accountNumber: string;
}

interface Notifications {
  newInvestment: boolean;
  payoutCompleted: boolean;
  systemAlerts: boolean;
}

// Socket.IO client
let socket: any;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [notifications, setNotifications] = useState<Notifications | null>(null);

  // ---------------- Fetch Settings ----------------
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();

        setProfile(data.profile ?? { id: "", name: "", email: "", phone: "" });
        setPayment(
          data.payment ?? { accountName: "", bankName: "", accountNumber: "" }
        );
        setNotifications(
          data.notifications ?? {
            newInvestment: true,
            payoutCompleted: true,
            systemAlerts: false,
          }
        );
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();

    // ---------------- Real-time subscription ----------------
    if (!socket) socket = io();
    socket.on("settings:update", (data: any) => {
      if (data.profile) setProfile(data.profile);
      if (data.payment) setPayment(data.payment);
      if (data.notifications) setNotifications(data.notifications);
    });

    return () => {
      socket.off("settings:update");
    };
  }, []);

  // ---------------- Handlers ----------------
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!payment) return;
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const toggleNotification = (key: keyof Notifications) => {
    if (!notifications) return;
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSave = async (type: "Profile" | "Payments" | "Notifications") => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, profile, payment, notifications }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`${type} saved successfully!`);
        // Optimistically update frontend if backend emits event, otherwise update manually
        if (type === "Profile") setProfile(data.profile);
        if (type === "Payments") setPayment(data.payment);
        if (type === "Notifications") setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to save ${type}`);
    }
  };

  if (loading || !profile || !payment || !notifications) {
    return <p className="p-6 text-center">Loading settings...</p>;
  }

  // ---------------- Render ----------------
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground max-w-md">
        Manage your profile, payment details, and notification preferences.
      </p>

      <Tabs defaultValue="Profile" className="space-y-4">
        <TabsList className="rounded-xl bg-muted p-1">
          <TabsTrigger value="Profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="Payments" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Payments
          </TabsTrigger>
          <TabsTrigger value="Notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="Profile">
          <Card className="rounded-2xl shadow-md border border-gray-100">
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" /> Profile Information
              </h2>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
              />
              <Input
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
              />
              <Input
                label="Phone"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="Enter your phone number"
              />
              <div className="col-span-full flex justify-end">
                <Button
                  onClick={() => handleSave("Profile")}
                  className="rounded-xl"
                >
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="Payments">
          <Card className="rounded-2xl shadow-md border border-gray-100">
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" /> Payment Details
              </h2>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Account Name"
                name="accountName"
                value={payment.accountName}
                onChange={handlePaymentChange}
                placeholder="Enter account name"
              />
              <Input
                label="Bank Name"
                name="bankName"
                value={payment.bankName}
                onChange={handlePaymentChange}
                placeholder="Enter bank name"
              />
              <Input
                label="Account Number"
                name="accountNumber"
                value={payment.accountNumber}
                onChange={handlePaymentChange}
                placeholder="Enter account number"
              />
              <div className="col-span-full flex justify-end">
                <Button
                  onClick={() => handleSave("Payments")}
                  className="rounded-xl"
                >
                  Save Payment Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="Notifications">
          <Card className="rounded-2xl shadow-md border border-gray-100">
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" /> Notification Preferences
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(notifications).map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                >
                  <span>
                    {key === "newInvestment"
                      ? "New Investment Alerts"
                      : key === "payoutCompleted"
                      ? "Payout Completed Alerts"
                      : "System Alerts"}
                  </span>
                  <Switch
                    checked={notifications[key as keyof Notifications]}
                    onCheckedChange={() =>
                      toggleNotification(key as keyof Notifications)
                    }
                  />
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => handleSave("Notifications")}
                  className="rounded-xl"
                >
                  Save Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}