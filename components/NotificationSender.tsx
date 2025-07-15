"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";

interface NotificationSenderProps {
  courseId: string;
  courseName: string;
}

export function NotificationSender({
  courseId,
  courseName,
}: NotificationSenderProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const sendNotification = async () => {
    if (!title || !message) {
      toast({
        title: "Error",
        description: "Please fill in both title and message fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from("notifications").insert([
        {
          course_id: courseId,
          title,
          message,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification sent successfully!",
      });

      // Clear the form
      setTitle("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">
        Send Notification to {courseName}
      </h3>
      <div className="space-y-2">
        <Input
          placeholder="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Notification Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
        <Button
          onClick={sendNotification}
          disabled={isSending}
          className="w-full"
        >
          {isSending ? "Sending..." : "Send Notification"}
        </Button>
      </div>
    </div>
  );
}
