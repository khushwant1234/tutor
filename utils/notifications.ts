import supabase from './supabase/client';

export const createClassAddedNotification = async (
  userId: string, 
  classTitle: string, 
  classId: string,
  courseTitle: string,
  dateTime: string
) => {
  try {
    const formattedDate = new Date(dateTime).toLocaleString();
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'New Class Added',
      message: `A new class "${classTitle}" has been added to ${courseTitle} on ${formattedDate}`,
      link: `/Dashboard?highlight=${classId}`,
      type: 'class_added'
    });
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

export const createClassReminderNotification = async (
  userId: string,
  classTitle: string,
  classId: string,
  startTime: string,
  meetingLink?: string
) => {
  try {
    const formattedTime = new Date(startTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Upcoming Class Reminder',
      message: `Your class "${classTitle}" starts at ${formattedTime}${meetingLink ? '. Click to join.' : ''}`,
      link: meetingLink || `/Dashboard?highlight=${classId}`,
      type: 'class_reminder'
    });
    return true;
  } catch (error) {
    console.error('Error creating reminder notification:', error);
    return false;
  }
};