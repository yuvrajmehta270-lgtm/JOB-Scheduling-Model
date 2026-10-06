import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { User, Bell, Sliders, Shield } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences' | 'security'>('profile');

  return (
    <PageContainer
      title="System Settings"
      subtitle="Manage personal profile preferences, notification alerts, and application options"
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-level-1 overflow-hidden grid grid-cols-1 md:grid-cols-4">
        {/* Left Settings Sidebar Tabs */}
        <div className="p-4 border-b md:border-b-0 md:border-r border-slate-200/80 bg-slate-50/50 space-y-1.5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 mr-2.5" />
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4 mr-2.5" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'preferences'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 mr-2.5" />
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 mr-2.5" />
            Security & Auth
          </button>
        </div>

        {/* Right Settings Form Area */}
        <div className="md:col-span-3 p-6 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-slate-900">Personal Profile</h3>
              <Input label="Display Name" defaultValue="System Administrator" />
              <Input label="Email Address" type="email" defaultValue="admin@jobflow.com" disabled />
              <Input label="Department" defaultValue="Operations Governance" />
              <Button onClick={() => alert('Profile settings saved.')}>Save Profile</Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-slate-900">Notification Alerts</h3>
              <label className="flex items-center space-x-3 cursor-pointer text-sm text-slate-700">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                <span>Notify me when a new job is assigned to me</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer text-sm text-slate-700">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                <span>Send schedule conflict alerts before saving</span>
              </label>
              <Button onClick={() => alert('Notification preferences saved.')}>Save Preferences</Button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-slate-900">Workspace Preferences</h3>
              <Input label="Default Calendar View" defaultValue="Month View" />
              <Input label="Timezone Standard" defaultValue="Local Browser Timezone (UTC)" disabled />
              <Button onClick={() => alert('Workspace preferences saved.')}>Save Settings</Button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-slate-900">Security Settings</h3>
              <p className="text-xs text-slate-500">Authentication is governed by Firebase Authentication SDK.</p>
              <Button variant="outline" onClick={() => alert('Password reset link will be sent via Firebase Auth.')}>
                Send Password Reset Email
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
