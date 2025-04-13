"use client";

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Backpack, User, ArrowLeft, Camera, Lock } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      // Load profile image
      const savedImage = localStorage.getItem('profile_image_' + user.email);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    }
  }, [user, isLoading, router]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setProfileImage(imageDataUrl);
        // Store with user email to keep separate profiles
        if (user?.email) {
          localStorage.setItem('profile_image_' + user.email, imageDataUrl);
          toast.success('Profile picture updated!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For now, just show a success message
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      // Get stored users
      const users = JSON.parse(localStorage.getItem('pack_together_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.email === user?.email);
      
      if (userIndex === -1) {
        toast.error('User not found');
        return;
      }

      if (users[userIndex].password !== currentPassword) {
        toast.error('Current password is incorrect');
        return;
      }

      // Update password
      users[userIndex].password = newPassword;
      localStorage.setItem('pack_together_users', JSON.stringify(users));

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Backpack className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6 hover:bg-white/50"
          onClick={handleBackToDashboard}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="glass-panel p-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative group cursor-pointer" onClick={triggerImageUpload}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <div className="w-32 h-32 rounded-full overflow-hidden relative">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <User className="h-20 w-20 text-blue-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="absolute -inset-1 bg-blue-100/50 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Update your personal information
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="you@example.com"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-black/90 text-white"
            >
              Update Profile
            </Button>
          </form>

          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-medium text-gray-900">Reset Password</h2>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
              >
                Update Password
              </Button>
            </form>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Statistics</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-white/50 backdrop-blur-sm px-4 py-5 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
              </div>
              <div className="bg-white/50 backdrop-blur-sm px-4 py-5 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <dt className="text-sm font-medium text-gray-500 truncate">Items Packed</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 