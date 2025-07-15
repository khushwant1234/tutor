"use client";

import { useEffect } from "react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/footer/Footer";
import { useNotifications } from "@/components/providers/NotificationsProvider";
import { BellIcon, Clock, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, refreshNotifications } =
    useNotifications();
  const router = useRouter();

  useEffect(() => {
    refreshNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "class_added":
        return (
          <div className="bg-blue-100 p-3 rounded-full">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
        );
      case "class_reminder":
        return (
          <div className="bg-amber-100 p-3 rounded-full">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-3 rounded-full">
            <BellIcon className="h-5 w-5 text-gray-600" />
          </div>
        );
    }
  };

  const handleNotificationClick = async (notification: {
    id: string;
    course_id?: string;
  }) => {
    await markAsRead(notification.id);
    // Only navigate if there's a course_id to create a meaningful link
    if (notification.course_id) {
      router.push(`/Courses/${notification.course_id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <BellIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                We&apos;ll notify you when there&apos;s something new.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex">
                    <div className="mr-4 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
