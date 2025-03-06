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
  
  // Admin user form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState(false);
  
  // Add these state variables with your other states
  const [revokeEmail, setRevokeEmail] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError, setRevokeError] = useState("");
  const [revokeSuccess, setRevokeSuccess] = useState(false);
  
  // Admin auth check
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  const initializeDatabase = async () => {
    try {
      console.log("Initializing database tables...");
      
      // Create courses table if it doesn't exist
      const { error: coursesError } = await supabase.rpc('create_tables_if_not_exist');
      
      if (coursesError) {
        console.error("Error initializing database:", coursesError);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Error in database initialization:", err);
      return false;
    }
  };
  
  React.useEffect(() => {
    const setup = async () => {
      // Initialize database tables first
      await initializeDatabase();
      
      // Then proceed with admin check
      const checkIsAdmin = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            setIsAdmin(false);
            return;
          }
          
          // Check if user has admin role in user_roles table
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle(); // Use maybeSingle instead of single
          console.log("Admin check result:", data);
          if (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
            return;
          }
          
          setIsAdmin(data && data.role === 'admin');
        } catch (err) {
          console.error("Error:", err);
          setIsAdmin(false);
        } finally {
          setAdminCheckLoading(false);
        }
      };
      
      checkIsAdmin();
    };
    
    setup();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      // Validate form
      if (!title || !description || !instructor) {
        setError("Title, description and instructor are required");
        return;
      }
      
      // Add course to courses table
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
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
      
    } catch (err: any) {
      console.error("Error adding course:", err);
      setError(err.message || "Failed to add course");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Replace your handleAddAdmin function with this
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");
    setAdminSuccess(false);
    
    try {
      // Validate email
      if (!adminEmail || !adminEmail.includes('@')) {
        setAdminError("Please enter a valid email address");
        setAdminLoading(false);
        return;
      }
      
      // Get user ID by email using the RPC function
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_email', { email_input: adminEmail });
      
      if (userError) {
        console.error("Error finding user:", userError);
        setAdminError("Error finding user. Please check the email address.");
        return;
      }
      
      if (!userData || !userData[0] || !userData[0].id) {
        setAdminError("No user found with this email. They must register first.");
        return;
      }
      
      const userId = userData[0].id;
      
      // Check if user is already an admin
      const { data: existingRole, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (roleError) {
        console.error("Error checking existing role:", roleError);
        setAdminError("Error checking if user is already an admin.");
        return;
      }
      
      if (existingRole) {
        setAdminError("This user is already an admin");
        return;
      }
      
      // Add admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: 'admin'
        }]);
        
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
  
  // Update your checkUserIsAdmin function with better logging
  const checkUserIsAdmin = async (userId: string | any) => {
    console.log(`Checking admin status for user ID: "${userId}" (type: ${typeof userId})`);

    try {
      // Manually construct the SQL for logging purposes
      const query = `SELECT role FROM user_roles WHERE user_id = '${userId}'`;
      console.log(`Query: ${query}`);
      
      // Run the actual query
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
    
      console.log("Admin role query result:", data);
      
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      // If we have data with role='admin', the user is an admin
      return data !== null && data.role === 'admin';
    } catch (err) {
      console.error("Error checking admin status:", err);
      return false;
    }
  };

  // Then update your handleRevokeAdmin function to use this
  const handleRevokeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevokeLoading(true);
    setRevokeError("");
    setRevokeSuccess(false);
    
    try {
      // Log current user first to check permissions
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log("Current user:", currentUser?.id);
      
      // Validate email
      if (!revokeEmail || !revokeEmail.includes('@')) {
        setRevokeError("Please enter a valid email address");
        setRevokeLoading(false);
        return;
      }
      
      console.log("Looking up user with email:", revokeEmail);
      
      // Get user ID by email using the RPC function
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_email', { email_input: revokeEmail });
      
      console.log("User data returned:", userData);

      if (userError) {
        console.error("Error finding user:", userError);
        setRevokeError("Error finding user: " + userError.message);
        return;
      }
      
      if (!userData || userData.length === 0) {
        setRevokeError("No user found with this email.");
        return;
      }
      
      const userId = userData[0].id;
      const isUserAdmin = await checkUserIsAdmin(userId);
      console.log(`Is user admin? ${isUserAdmin}`);

      if (!isUserAdmin) {
        // Create a React element for the error message with an "Add as Admin" button
        const addAsAdminHandler = () => {
          // Set the admin email and clear the revoke email
          setAdminEmail(revokeEmail);
          setRevokeEmail("");
          setRevokeError("");

          // Submit the admin form programmatically
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
          handleAddAdmin(fakeEvent);
        };
        
        setRevokeError("This user is not an admin. Would you like to add them as admin instead?");
        
        // Use setTimeout to make sure the DOM element is rendered
        setTimeout(() => {
          const errorDiv = document.querySelector('[id="revokeErrorMessage"]');
          if (errorDiv) {
            // Clear any existing buttons first
            const existingButtons = errorDiv.querySelectorAll('button');
            existingButtons.forEach(btn => btn.remove());
            
            // Add the new button
            const addButton = document.createElement('button');
            addButton.textContent = "Add as Admin";
            addButton.className = "ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600";
            addButton.onclick = addAsAdminHandler;
            errorDiv.appendChild(addButton);
          }
        }, 100);
        
        return;
      }
      
      // Check if trying to revoke own admin status
      if (userId === currentUser?.id) {
        setRevokeError("You cannot revoke your own admin privileges");
        return;
      }

      // Get the role ID to delete
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (roleError) {
        console.error("Error getting role ID:", roleError);
        setRevokeError("Error finding admin role to delete");
        return;
      }
      
      // Delete admin role using the role ID
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleData.id);
        
      if (deleteError) {
        console.error("Error deleting role:", deleteError);
        throw deleteError;
      }
      
      // Success
      setRevokeSuccess(true);
      setRevokeEmail("");
      
    } catch (err: any) {
      console.error("Error revoking admin:", err);
      setRevokeError(err.message || "Failed to revoke admin");
    } finally {
      setRevokeLoading(false);
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
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Revoke Admin Privileges</h3>
              
              {revokeError && (
                <div className="bg-red-50 p-4 mb-6 rounded-md flex items-start" id="revokeErrorMessage">
                  <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
                  <span className="text-red-600">{revokeError}</span>
                </div>
              )}
              
              {revokeSuccess && (
                <div className="bg-green-50 p-4 mb-6 rounded-md flex items-start">
                  <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
                  <span className="text-green-600">Admin privileges revoked successfully!</span>
                </div>
              )}
              
              <form onSubmit={handleRevokeAdmin} className="space-y-4">
                <div>
                  <Label htmlFor="revokeEmail">Admin Email</Label>
                  <Input 
                    id="revokeEmail"
                    type="email"
                    placeholder="admin@example.com"
                    value={revokeEmail}
                    onChange={(e) => setRevokeEmail(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the email of the admin whose privileges you want to revoke.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={revokeLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {revokeLoading ? 
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 
                    'Revoke Admin Privileges'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
        
        {/* You can add other admin functionality here */}
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;