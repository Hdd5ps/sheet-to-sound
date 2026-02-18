/**
 * Settings Page
 * 
 * User account settings:
 * - Profile information
 * - Email preferences
 * - Storage usage
 * - Account management
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Database, Bell, Shield } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  function handleSaveProfile() {
    // In production: Update user profile via API
    console.log('Save profile:', { name, email });
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account and preferences
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <Input
                  label="Display Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled
                  helperText="Email cannot be changed"
                />
                
                <Button variant="primary" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Storage & Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Storage Used</span>
                    <span className="text-sm text-gray-600">-- MB / 100 MB</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Upload scores and generate audio files. Your current plan includes 100 MB of storage.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Email me when conversions complete
                  </span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Product updates and feature announcements
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
          
          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Data Privacy</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Your uploaded scores and generated audio files are private and only accessible by you.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Account Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                    <br />
                    <Button variant="danger" size="sm">
                      Delete Account
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    ⚠️ Deleting your account will permanently remove all your scores and conversions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
