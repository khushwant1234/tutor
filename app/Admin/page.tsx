"use client";

import React, { useState, useEffect } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { X } from "lucide-react";
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
  const [previewUrl, setPreviewUrl] = useState("");
  const [otherInfo, setOtherInfo] = useState("");
  
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
            instructor,
            preview_url: previewUrl,
            other_info: otherInfo
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
      setPreviewUrl("");
      setOtherInfo("");
      
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
  
  // Add this to AdminPage component
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [scheduleType, setScheduleType] = useState<"one-time" | "recurring">("one-time");
  const [classTitle, setClassTitle] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [classDate, setClassDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60); // in minutes
  const [meetingLink, setMeetingLink] = useState("");

  // For recurring classes
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // For multi-class days
  const [timeSlots, setTimeSlots] = useState<{day: number, time: string}[]>([]);

  // Function to add a new time slot
  const addTimeSlot = (day: number, time: string) => {
    setTimeSlots([...timeSlots, {day, time}]);
  };

  // Function to schedule a one-time class
  const scheduleOneTimeClass = async () => {
    try {
      setClassSchedulingError("");
      setClassSchedulingSuccess(false);
      
      // Validate inputs
      if (!selectedCourseId) {
        setClassSchedulingError("Please select a course");
        return;
      }
      
      if (!classTitle) {
        setClassSchedulingError("Please enter a class title");
        return;
      }
      
      if (!classDate || !startTime) {
        setClassSchedulingError("Please select a date and time");
        return;
      }
      
      // Check if tables exist and create them if needed
      try {
        const { error: tableError } = await supabase
          .from('course_classes')
          .select('id')
          .limit(1);
          
        if (tableError && tableError.message.includes("does not exist")) {
          await createScheduleTables();
        }
      } catch (err) {
        console.error("Error checking/creating tables:", err);
      }
      
      const startDateTime = new Date(`${classDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
      
      // Create course class
      const { data: classData, error: classError } = await supabase
        .from('course_classes')
        .insert([{
          course_id: selectedCourseId,
          title: classTitle,
          description: classDescription,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          meeting_link: meetingLink,
          recurring: false
        }])
        .select();
        
      if (classError) {
        console.error("Error creating class:", classError);
        throw classError;
      }
      
      if (!classData || classData.length === 0) {
        throw new Error("No data returned when creating class");
      }
      
      // Create class instance
      const { error: instanceError } = await supabase
        .from('class_instances')
        .insert([{
          class_id: classData[0].id,
          title: classTitle,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          meeting_link: meetingLink
        }]);
        
      if (instanceError) {
        console.error("Error creating class instance:", instanceError);
        throw instanceError;
      }
      
      // Reset form
      setClassTitle("");
      setClassDescription("");
      setMeetingLink("");
      setClassDate("");
      setStartTime("");
      setSelectedCourseId("");
      setClassSchedulingSuccess(true);
      
    } catch (err) {
      console.error("Error scheduling class:", err);
      setClassSchedulingError(err instanceof Error ? err.message : "Failed to schedule class");
    }
  };

  // Function to create a recurring schedule
  const createRecurringSchedule = async () => {
    try {
      setClassSchedulingError("");
      setClassSchedulingSuccess(false);
      
      // Validate inputs
      if (!selectedCourseId) {
        setClassSchedulingError("Please select a course");
        return;
      }
      
      if (!classTitle) {
        setClassSchedulingError("Please enter a class title");
        return;
      }
      
      if (recurringDays.length === 0) {
        setClassSchedulingError("Please select at least one day of the week");
        return;
      }
      
      if (!startDate || !endDate) {
        setClassSchedulingError("Please select start and end dates");
        return;
      }
      
      if (timeSlots.length === 0) {
        setClassSchedulingError("Please add at least one class time");
        return;
      }
      
      // Check if the course_schedules table exists
      const { error: tableError } = await supabase
        .from('course_schedules')
        .select('id')
        .limit(1);
        
      if (tableError && tableError.message.includes("does not exist")) {
        console.error("Table course_schedules does not exist:", tableError);
        await createScheduleTables();
      }
      
      // First create the schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('course_schedules')
        .insert([{
          course_id: selectedCourseId,
          name: `${classTitle} Schedule`,
          days_of_week: recurringDays,
          start_date: startDate,
          end_date: endDate,
          class_duration: duration // This is the field with the issue - ensure it's class_duration without spaces
        }])
        .select();
        
      if (scheduleError) {
        console.error("Error creating schedule:", scheduleError);
        throw scheduleError;
      }
      
      if (!scheduleData || scheduleData.length === 0) {
        throw new Error("No schedule data returned");
      }
      
      const scheduleId = scheduleData[0].id;
      
      // Then add all time slots
      for (const slot of timeSlots) {
        const { error: slotError } = await supabase
          .from('schedule_time_slots')
          .insert([{
            schedule_id: scheduleId,
            day_of_week: slot.day,
            start_time: slot.time
          }]);
          
        if (slotError) {
          console.error("Error adding time slot:", slotError);
          if (slotError.message.includes("does not exist")) {
            await createScheduleTables();
            throw new Error("Schedule tables were just created. Please try again.");
          }
          throw slotError;
        }
      }
      
      // For this demo, instead of using an RPC, let's manually create class instances
      await createClassInstancesManually(
        scheduleId, 
        selectedCourseId, 
        classTitle, 
        classDescription, 
        meetingLink,
        recurringDays,
        new Date(startDate),
        new Date(endDate),
        duration,
        timeSlots
      );
      
      // Reset form
      setClassTitle("");
      setClassDescription("");
      setMeetingLink("");
      setSelectedCourseId("");
      setRecurringDays([]);
      setTimeSlots([]);
      setStartDate("");
      setEndDate("");
      setDuration(60);
      setClassSchedulingSuccess(true);
      
    } catch (err) {
      console.error("Error creating recurring schedule:", err);
      setClassSchedulingError(err instanceof Error ? err.message : "Failed to create schedule");
    }
  };

  // Fetch courses in useEffect
  useEffect(() => {
    // Add this to your existing useEffect or create a new one
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, title');
          
        if (error) throw error;
        setCourses(data || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    
    fetchCourses();
  }, []);

  // Add these state variables for the tab content
  const [selectedDay, setSelectedDay] = useState<number | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [classSchedulingError, setClassSchedulingError] = useState("");
  const [classSchedulingSuccess, setClassSchedulingSuccess] = useState(false);

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

              <div>
                <Label htmlFor="previewUrl">YouTube Preview (Optional)</Label>
                <Input 
                  id="previewUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add a YouTube video URL to preview your course
                </p>
              </div>

              <div>
                <Label htmlFor="otherInfo">Additional Information (Optional)</Label>
                <Textarea 
                  id="otherInfo"
                  placeholder="Additional information about the course like prerequisites, requirements, etc."
                  rows={3}
                  value={otherInfo}
                  onChange={(e) => setOtherInfo(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional details like prerequisites, technical requirements, etc.
                </p>
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
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Schedule Classes</CardTitle>
            <CardDescription>
              Create class schedules for your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classSchedulingError && (
              <div className="bg-red-50 p-4 mb-6 rounded-md flex items-start">
                <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
                <span className="text-red-600">{classSchedulingError}</span>
              </div>
            )}
            
            {classSchedulingSuccess && (
              <div className="bg-green-50 p-4 mb-6 rounded-md flex items-start">
                <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 mt-0.5" />
                <span className="text-green-600">
                  {scheduleType === "one-time" 
                    ? "Class scheduled successfully!" 
                    : "Recurring schedule created successfully!"}
                </span>
              </div>
            )}
          
            <Tabs defaultValue="one-time" onValueChange={(val) => setScheduleType(val as "one-time" | "recurring")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="one-time">One-time Class</TabsTrigger>
                <TabsTrigger value="recurring">Recurring Schedule</TabsTrigger>
              </TabsList>
              
              <TabsContent value="one-time" className="space-y-4 pt-4">
                <form onSubmit={(e) => { e.preventDefault(); scheduleOneTimeClass(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="courseSingle">Select Course</Label>
                      <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
                        <SelectTrigger id="courseSingle">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="classTitle">Class Title</Label>
                      <Input 
                        id="classTitle"
                        placeholder="Introduction Session"
                        value={classTitle}
                        onChange={(e) => setClassTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="classDescription">Description (Optional)</Label>
                    <Textarea 
                      id="classDescription"
                      placeholder="What will be covered in this class..."
                      value={classDescription}
                      onChange={(e) => setClassDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="classDate">Date</Label>
                      <Input 
                        id="classDate"
                        type="date"
                        value={classDate}
                        onChange={(e) => setClassDate(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input 
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input 
                        id="duration"
                        type="number"
                        min="15"
                        step="15"
                        value={duration.toString()}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                    <Input 
                      id="meetingLink"
                      placeholder="https://zoom.us/j/..."
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Schedule Class
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="recurring" className="space-y-4 pt-4">
                <form onSubmit={(e) => { e.preventDefault(); createRecurringSchedule(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="courseRecurring">Select Course</Label>
                      <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
                        <SelectTrigger id="courseRecurring">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="classTitleRecurring">Class Title</Label>
                      <Input 
                        id="classTitleRecurring"
                        placeholder="Weekly Session"
                        value={classTitle}
                        onChange={(e) => setClassTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Select Days</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant={recurringDays.includes(idx) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (recurringDays.includes(idx)) {
                              setRecurringDays(recurringDays.filter(d => d !== idx));
                            } else {
                              setRecurringDays([...recurringDays, idx]);
                            }
                          }}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input 
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Time slots section for multiple times per day */}
                  <div>
                    <Label>Class Times</Label>
                    <div className="mt-2 space-y-3">
                      {timeSlots.map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="bg-slate-100 px-3 py-2 rounded-md flex-1">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.day]} at {slot.time}
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setTimeSlots(timeSlots.filter((_, i) => i !== idx))}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                      
                      {/* Add time slot form */}
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Select onValueChange={(val) => setSelectedDay(parseInt(val))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                              <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Input 
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                        />
                        
                        <Button 
                          type="button"
                          onClick={() => {
                            if (selectedDay !== undefined && selectedTime) {
                              addTimeSlot(selectedDay, selectedTime);
                              setSelectedTime("");
                            }
                          }}
                          disabled={selectedDay === undefined || !selectedTime}
                        >
                          Add Time
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full mt-6">
                    Create Schedule
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* You can add other admin functionality here */}
      </div>
      <Footer />
    </div>
  );
};

const createClassInstancesManually = async (
  scheduleId: string,
  courseId: string,
  classTitle: string,
  classDescription: string,
  meetingLink: string,
  daysOfWeek: number[],
  startDate: Date,
  endDate: Date,
  duration: number,
  timeSlots: {day: number, time: string}[]
) => {
  try {
    // First create the parent course class
    const { data: parentClass, error: parentClassError } = await supabase
      .from('course_classes')
      .insert([{
        course_id: courseId,
        title: classTitle,
        description: classDescription,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        recurring: true,
        recurrence_pattern: daysOfWeek.join(','),
        meeting_link: meetingLink
      }])
      .select();
      
    if (parentClassError) throw parentClassError;
    if (!parentClass || parentClass.length === 0) throw new Error("Failed to create parent class");
    
    const parentClassId = parentClass[0].id;
    
    // Loop through every day from start to end date
    const instances = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Create one instance for each day that matches the recurrence pattern
    while (current <= end) {
      const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // If this day is in our recurrence pattern
      if (daysOfWeek.includes(dayOfWeek)) {
        // Get all time slots for this day
        const slotsForDay = timeSlots.filter(slot => slot.day === dayOfWeek);
        
        // Create an instance for each time slot
        for (const slot of slotsForDay) {
          // Parse the time string (e.g., "14:30")
          const [hours, minutes] = slot.time.split(':').map(Number);
          
          // Create a new date for this instance
          const instanceStart = new Date(current);
          instanceStart.setHours(hours, minutes, 0, 0);
          
          // Calculate end time based on duration
          const instanceEnd = new Date(instanceStart);
          instanceEnd.setMinutes(instanceEnd.getMinutes() + duration);
          
          // Add to instances array
          instances.push({
            class_id: parentClassId,
            title: classTitle,
            start_time: instanceStart.toISOString(),
            end_time: instanceEnd.toISOString(),
            meeting_link: meetingLink
          });
        }
      }
      
      // Move to next day
      current.setDate(current.getDate() + 1);
    }
    
    // Insert all instances in chunks to avoid request size limitations
    const chunkSize = 50;
    for (let i = 0; i < instances.length; i += chunkSize) {
      const chunk = instances.slice(i, i + chunkSize);
      
      const { error: insertError } = await supabase
        .from('class_instances')
        .insert(chunk);
        
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (err) {
    console.error("Error creating class instances manually:", err);
    throw err;
  }
};

export default AdminPage;