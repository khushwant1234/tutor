"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, CheckCircle2, Camera, AlertCircle } from "lucide-react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import supabase from "@/utils/supabase/client";

interface UserProfile {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    provider?: string;
  };
  app_metadata?: {
    provider?: string;
  };
}

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get user data
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          throw error || new Error("User not found");
        }

        setUser(user as UserProfile);
        
        // Check if user is OAuth (Google, etc.) or password-based
        const provider = user.app_metadata?.provider || 
                         user.user_metadata?.provider || 
                         "email";
        
        setIsOAuthUser(provider !== "email");

        // Set initial form values
        setDisplayName(user.user_metadata?.displayName || 
                       user.user_metadata?.full_name || 
                       "");

        setAvatarUrl(user.user_metadata?.image_url || user.user_metadata?.avatar_url || "");
        
      } catch (err) {
        console.error("Error loading profile:", err);
        router.push("/Login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNameSuccess(false);
    setNameError("");
    
    try {
      if (!displayName.trim()) {
        throw new Error("Display name cannot be empty");
      }
      
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      });
      
      if (error) throw error;
      
      setNameSuccess(true);
    } catch (err) {
      console.error("Error updating name:", err);
      setNameError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setPasswordSuccess(false);
    setPasswordError("");
    
    try {
      if (isOAuthUser) {
        throw new Error("Password update not available for social login accounts");
      }
      
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError("Please select an image file");
      return;
    }
    
    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setAvatarError("Image size should be less than 1MB");
      return;
    }
    
    // Preview the image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setAvatarError("");
  };

  const handleAvatarUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) return;
    
    setIsSaving(true);
    setAvatarSuccess(false);
    setAvatarError("");
    
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }
      
      // Convert data URL to blob
      const res = await fetch(imagePreview);
      const blob = await res.blob();
      
      // Create a folder for each user based on their ID
      const userFolder = user.id;
      const fileExt = blob.type.split('/')[1];
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userFolder}/${fileName}`;

      console.log("Attempting to upload to:", filePath);

      // Upload with more debug info
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, blob, {
          upsert: true,
          contentType: blob.type
        });
      
      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", uploadData);
      console.log("Public URL:", uploadData.path);
      console.log("BUHAH:", filePath);
      interface UploadImageResponse {
        publicUrl: string | null;
      }

      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      console.log(data);
      console.log("Public URL:", publicUrl);
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { image_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setAvatarSuccess(true);
    } catch (err) {
      console.error("Error updating avatar:", err);
      setAvatarError(err instanceof Error ? err.message : "Failed to update avatar");
    } finally {
      setIsSaving(false);
    }
  };

  // Add this function to handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/Login');
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-16 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
        
        <div className="flex justify-center mb-8">
          <div className="relative">
            {avatarUrl ? (
              <Image 
                src={avatarUrl} 
                alt="Profile" 
                width={120} 
                height={120} 
                className="rounded-full object-cover"
              />
            ) : imagePreview ? (
              <Image 
                src={imagePreview} 
                alt="Preview" 
                width={120} 
                height={120} 
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-[120px] h-[120px] bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-3xl font-semibold text-gray-500">
                  {displayName ? displayName[0].toUpperCase() : "U"}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="profile" className="max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security" disabled={isOAuthUser}>
              Security
              {isOAuthUser && <span className="ml-2 text-xs">(Google Account)</span>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display Name Form */}
                <form onSubmit={handleUpdateName} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                    />
                  </div>
                  
                  {nameError && (
                    <div className="bg-red-50 p-3 rounded-md flex items-start">
                      <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
                      <span className="text-red-600 text-sm">{nameError}</span>
                    </div>
                  )}
                  
                  {nameSuccess && (
                    <div className="bg-green-50 p-3 rounded-md flex items-start">
                      <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
                      <span className="text-green-600 text-sm">Display name updated successfully!</span>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="mt-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Saving...
                      </>
                    ) : 'Update Name'}
                  </Button>
                </form>
                
                <div className="border-t border-gray-200 pt-6">
                  {/* Avatar Upload Form */}
                  <form onSubmit={handleAvatarUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Profile Picture</Label>

                      <div className="flex gap-4 items-start">
                        {imagePreview && (
                          <div className="w-20 h-20 relative rounded-md overflow-hidden">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div>
                          <Label
                            htmlFor="avatar-upload"
                            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Choose Image
                          </Label>
                          <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG or GIF, Max 1MB
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {avatarError && (
                      <div className="bg-red-50 p-3 rounded-md flex items-start">
                        <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
                        <span className="text-red-600 text-sm">{avatarError}</span>
                      </div>
                    )}
                    
                    {avatarSuccess && (
                      <div className="bg-green-50 p-3 rounded-md flex items-start">
                        <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
                        <span className="text-green-600 text-sm">Profile picture updated successfully!</span>
                      </div>
                    )}
                    
                    <Button
                      type="submit"
                      disabled={!imagePreview || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Uploading...
                        </>
                      ) : 'Upload Picture'}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Update your password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change Form */}
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  {passwordError && (
                    <div className="bg-red-50 p-3 rounded-md flex items-start">
                      <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
                      <span className="text-red-600 text-sm">{passwordError}</span>
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="bg-green-50 p-3 rounded-md flex items-start">
                      <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
                      <span className="text-green-600 text-sm">Password updated successfully!</span>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Updating...
                      </>
                    ) : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="container mx-auto py-6 px-4 text-center">
        <Button 
          variant="outline" 
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            'Sign Out'
          )}
        </Button>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;