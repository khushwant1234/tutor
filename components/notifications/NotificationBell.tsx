"use client";

import { useState } from 'react';
import { BellIcon, Check, Clock } from 'lucide-react';
import { useNotifications } from '@/components/providers/NotificationsProvider';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'class_added':
        return <div className="bg-blue-100 p-2 rounded-full"><Clock className="h-4 w-4 text-blue-600" /></div>;
      case 'class_reminder': 
        return <div className="bg-amber-100 p-2 rounded-full"><Clock className="h-4 w-4 text-amber-600" /></div>;
      default:
        return <div className="bg-gray-100 p-2 rounded-full"><BellIcon className="h-4 w-4 text-gray-600" /></div>;
    }
  };

  const handleNotificationClick = async (id: string, link?: string) => {
    await markAsRead(id);
    if (link) {
      // Your router navigation or window.location can go here
    }
    setIsOpen(false);
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 text-white hover:bg-blue-800 rounded-full focus:outline-none"
        onClick={handleBellClick}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={handleClickOutside}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-40 max-h-[450px] flex flex-col">
            <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
              <h3 className="font-medium text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => markAllAsRead()}
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-grow">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`border-b last:border-b-0 p-3 hover:bg-gray-50 cursor-pointer flex ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                  >
                    <div className="mr-3 flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-medium">{notification.title}</div>
                      <div className="text-xs mt-1 text-gray-600">{notification.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="p-2 bg-gray-50 border-t">
              <Link href="/notifications">
                <Button 
                  variant="ghost" 
                  className="w-full text-sm justify-center hover:bg-gray-200 text-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};