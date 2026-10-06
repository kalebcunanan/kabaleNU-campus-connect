import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import HomePage from './pages/Home/HomePage';
import EventsPage from './pages/Events/EventsPage';
import MarketplacePage from './pages/Marketplace/MarketplacePage';
import ChannelsPage from './pages/Channels/ChannelsPage';
import ChannelRoomPage from './pages/Channels/ChannelRoomPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import LandingPage from './pages/Landing/LandingPage';

const NotFound = () => <div className="p-8 text-center text-2xl font-bold text-red-600">404 - Not Found</div>;

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/channels" element={<ChannelsPage />} />
              <Route path="/channels/:id" element={<ChannelRoomPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}