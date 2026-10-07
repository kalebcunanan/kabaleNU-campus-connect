import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import ChatDock from '../features/ChatDock';
import { ChatProvider } from '../../context/ChatContext';

export default function MainLayout() {
  return (
    <ChatProvider>
      <div className="flex min-h-dvh flex-col bg-gray-50 font-sans">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <ChatDock />
      </div>
    </ChatProvider>
  );
}
