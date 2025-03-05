"use client";

import React, { useState } from "react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import supabase from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const AdminPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Course form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://placehold.co/600x400");
  const [instructor, setInstructor] = useState("");
  const [courseId, setCourseId] = useState("");
  
  // Admin user form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState(false);
  
  // Admin auth check
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  
  React.useEffect(() => {
    const checkIsAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          return;
        }
        
        // Check if user has admin role in user_roles table
        // You'll need to create this table in Supabase first
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single

        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          return;
        }
        
        setIsAdmin(data?.role === 'admin');
      } catch (err) {
        console.error("Error:", err);
        setIsAdmin(false);
      } finally {
        setAdminCheckLoading(false);
      }
    };
    
    checkIsAdmin();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      // Validate form
      if (!title || !description || !instructor || !courseId) {
        setError("All fields are required except image URL");
        return;
      }
      
      // Add course to courses table
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            id: courseId,
            title,
            description,
            image_url: imageUrl,
            instructor
          }
        ])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Reset form
      setSuccess(true);
      setTitle("");
      setDescription("");
      setImageUrl("https://placehold.co/600x400");
      setInstructor("");
      setCourseId("");
      
    } catch (err: any) {
      console.error("Error adding course:", err);
      setError(err.message || "Failed to add course");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");
    setAdminSuccess(false);
    
    try {
      // Validate email
      if (!adminEmail || !adminEmail.includes('@')) {
        setAdminError("Please enter a valid email address");
        return;
      }
      
      // Check if the user exists in auth system
      const { data: userResponse, error: userError } = await supabase
        .rpc('get_user_by_email', { email_input: adminEmail });
        
      if (userError) throw userError;
      
      if (!userResponse || !userResponse.id) {
        setAdminError("No user found with this email. They must register first.");
        return;
      }
      
      // Check if user is already an admin
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userResponse.id)
        .eq('role', 'admin')
        .single();
        
      if (existingRole) {
        setAdminError("This user is already an admin");
        return;
      }
      
      // Add admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: userResponse.id,
            role: 'admin'
          }
        ]);
        
      if (insertError) throw insertError;
      
      // Success
      setAdminSuccess(true);
      setAdminEmail("");
      
    } catch (err: any) {
      console.error("Error adding admin:", err);
      setAdminError(err.message || "Failed to add admin");
    } finally {
      setAdminLoading(false);
    }
  };
  
  // Loading state while checking admin status
  if (adminCheckLoading) {
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
  
  // Not admin, show access denied
  if (!isAdmin) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Access Denied</CardTitle>
              <CardDescription className="text-center">
                You don't have permission to access this area
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => router.push('/')}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Course</CardTitle>
            <CardDescription>
              Create a new course to add to the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 p-4 mb-6 rounded-md flex items-start">
                <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
                <span className="text-red-600">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 p-4 mb-6 rounded-md flex items-start">
                <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
                <span className="text-green-600">Course added successfully!</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseId">Course ID</Label>
                  <Input 
                    id="courseId"
                    placeholder="e.g. DS1, FSWD1"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="title">Course Title</Label>
                  <Input 
                    id="title"
                    placeholder="Course title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Course description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input 
                  id="imageUrl"
                  placeholder="https://placehold.co/600x400"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input 
                  id="instructor"
                  placeholder="Instructor name"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Course...</> : 
                  'Add Course'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Manage Administrators</CardTitle>
            <CardDescription>
              Add another user as an administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adminError && (
              <div className="bg-red-50 p-4 mb-6 rounded-md flex items-start">
                <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
                <span className="text-red-600">{adminError}</span>
              </div>
            )}
            
            {adminSuccess && (
              <div className="bg-green-50 p-4 mb-6 rounded-md flex items-start">
                <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
                <span className="text-green-600">Admin privileges granted successfully!</span>
              </div>
            )}
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <Label htmlFor="adminEmail">User Email</Label>
                <Input 
                  id="adminEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  The user must already have an account in the system.
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={adminLoading}
                className="w-full"
              >
                {adminLoading ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 
                  'Add as Administrator'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* You can add other admin functionality here */}
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;