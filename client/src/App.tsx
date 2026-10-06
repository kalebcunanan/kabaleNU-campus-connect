import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import HomePage from './pages/Home/HomePage';
import EventsPage from './pages/Events/EventsPage';
import EventDetailPage from './pages/Events/EventDetailPage';
import MarketplacePage from './pages/Marketplace/MarketplacePage';
import ChannelsPage from './pages/Channels/ChannelsPage';
import ChannelRoomPage from './pages/Channels/ChannelRoomPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import LandingPage from './pages/Landing/LandingPage';
import WelcomeOverlay from './components/layout/WelcomeOverlay';
import { WelcomeProvider } from './context/WelcomeProvider';

const NotFound = () => <div className="p-8 text-center text-2xl font-bold text-red-600">404 - Not Found</div>;

export default function App() {
  return (
    <BrowserRouter>
      <WelcomeProvider>
      <Routes>
        {/* Auth pages render their own full-screen layout without the Navbar. */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/channels" element={<ChannelsPage />} />
            <Route path="/channels/:id" element={<ChannelRoomPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      {/* The overlay sits outside Routes so it can cover a route change. */}
      <WelcomeOverlay />
      </WelcomeProvider>
    </BrowserRouter>
  );
}
