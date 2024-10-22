import React, { useEffect, useState } from 'react';

interface Notification {
  id: string;
  message: string;
  url?: string;
  createdAt: string;
  read: boolean;
}

export const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications);
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notificationId: string, url?: string) => {
    // Marker varselet som lest
    await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    });

    // Naviger til URL hvis den finnes
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div>
      <h2>Dine varsler</h2>
      <ul>
        {notifications.map((notification) => (
          <li
            key={notification.id}
            style={{ backgroundColor: notification.read ? '#fff' : '#e6f7ff' }}
            onClick={() => handleNotificationClick(notification.id, notification.url)}
          >
            {notification.message}
            <br />
            <small>{new Date(notification.createdAt).toLocaleString('nb-NO')}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};