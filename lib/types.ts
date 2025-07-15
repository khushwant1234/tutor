export type Notification = {
  id: string;
  course_id: string;
  message: string;
  created_at: string;
  read: boolean;
  title: string;
}

export type User = {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    name?: string;
    full_name?: string;
    display_name?: string;
    image_url?: string;
    avatar_url?: string;
  };
}

export type Course = {
  id: string;
  title: string;
  description?: string;
  price?: number;
  duration?: string;
  level?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type ScheduledClass = {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  scheduled_time: string;
  duration_minutes: number;
  meeting_link?: string;
  created_at: string;
  // Additional properties used in Admin page
  class_id?: string;
  start_time?: string;
  recurring?: boolean;
  parent_title?: string;
}

export type CourseNote = {
  id: string;
  course_id: string;
  title: string;
  file_path: string;
  file_size?: number;
  tags?: string;
  is_public: boolean;
  created_at: string;
} 