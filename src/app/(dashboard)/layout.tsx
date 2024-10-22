'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useSocket } from '@/hooks/use-socket';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const socket = useSocket(session?.user?.id || null);

  useEffect(() => {
    if (socket) {
      socket.on('nyNotifikasjon', (data: { message: string; url?: string }) => {
        toast.info(data.message, {
          onClick: () => {
            if (data.url) {
              window.location.href = data.url;
            }
          },
        });
      });

      return () => {
        socket.off('nyNotifikasjon');
      };
    }
  }, [socket]);

  return (
    <html lang="no">
      <body>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
        <ToastContainer position="bottom-right" />
      </body>
    </html>
  );
}