"use client";

import { useState } from "react";
import { 
  mockCategories, 
  mockVolunteers, 
  mockWards 
} from "@/lib/mockData";
import { 
  User, 
  MapPin, 
  Clock, 
  Bell, 
  Save, 
  Check, 
  Building,
  Info,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [profileName, setProfileName] = useState("Ravi Kumar");
  const [profileEmail, setProfileEmail] = useState("ravi.kumar@mlaoffice.in");
  const [phone, setPhone] = useState("+919880001001");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      
      {/* Save Trigger Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-200">MLA Dashboard Configurations</h2>
          <p className="text-[10px] text-zinc-500">Configure profile, SLA guidelines, and metadata rules.</p>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-4 text-xs h-9 shadow-lg"
        >
          {saving ? (
            "Saving changes..."
          ) : saved ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
              Saved Settings
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save Configurations
            </>
          )}
        </Button>
      </div>

      {/* Grid of settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Administrative Profile */}
        <div className="md:col-span-2 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <User className="h-4 w-4 text-zinc-400" />
            Administrative Account Settings
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider" htmlFor="username">
                Display Name
              </label>
              <input
                id="username"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider" htmlFor="phone-set">
                Contact Number
              </label>
              <input
                id="phone-set"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider" htmlFor="email-set">
                Email Address
              </label>
              <input
                id="email-set"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* 2. Constituency Info */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Building className="h-4 w-4 text-zinc-400" />
              Constituency Profile
            </h3>
            
            <div className="space-y-3 text-xs text-zinc-400">
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase block">Assigned Territory</span>
                <span className="text-zinc-200 font-medium">Rajarajeshwari Nagar (AC-157)</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase block">Representative Name</span>
                <span className="text-zinc-200 font-medium">N. Munirathna (MLA)</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase block">Registered Wards</span>
                <span className="text-zinc-200 font-medium">{mockWards.length} Active Wards</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-start rounded-lg border border-zinc-900 bg-zinc-950/50 p-3 text-[10px] text-zinc-500">
            <Info className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
            <span>To modify geographical boundaries or assign new representative credentials, contact the system administrator.</span>
          </div>
        </div>

        {/* 3. SLA Deadlines and Policies */}
        <div className="md:col-span-3 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-zinc-400" />
            Standard SLA Guidelines
          </h3>
          <p className="text-[10px] text-zinc-500">
            Grievances filed under these categories require resolution response within the specified hours before escalation checks trigger.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {mockCategories.map((cat) => (
              <div key={cat.id} className="rounded-lg border border-zinc-900 bg-zinc-950/20 p-3 flex flex-col justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-200">{cat.name}</span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">Resolve within:</span>
                  <span className="text-xs font-mono font-bold text-amber-500">{cat.defaultSlaHours} hrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </form>
  );
}
