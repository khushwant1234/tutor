'use client';

import { useEffect, useState } from 'react';
import { NotificationSender } from '@/components/NotificationSender';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Course {
  id: string;
  name: string;
}

export default function AdminCoursePage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCourse = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, name')
        .eq('id', params.id)
        .single();
      
      if (data) {
        setCourse(data);
      }
    };

    fetchCourse();
  }, [params.id, supabase]);

  return (
    <div>
      <div className="mt-6">
        <NotificationSender 
          courseId={params.id} 
          courseName={course?.name || 'Course'} 
        />
      </div>
    </div>
  );
} 