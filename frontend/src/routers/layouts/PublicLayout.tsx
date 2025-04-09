import { Outlet } from 'react-router-dom';
import React, { Suspense } from 'react';
import Header from '@/components/Player/Header';
import Footer from '@/components/Player/Footer';
import ChatWidget from '@/components/Chat/ChatWidget';

const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

export const PublicLayout: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="font-main min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </Suspense>
  );
};

