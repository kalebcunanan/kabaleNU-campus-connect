import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import ChatDock from '../features/ChatDock';
import { ChatProvider } from '../../context/ChatContext';

export default function MainLayout(): JSX.Element {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // The scroll container persists across routes, so reset it to the top on every page change.
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ChatProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-gray-50 font-sans">
        <Navbar />
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-scroll">
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
        <ChatDock />
      </div>
    </ChatProvider>
  );
}
