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
import PublicProfilePage from './pages/Profile/PublicProfilePage';
import FriendsPage from './pages/Friends/FriendsPage';
import LandingPage from './pages/Landing/LandingPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import WelcomeOverlay from './components/layout/WelcomeOverlay';
import { WelcomeProvider } from './context/WelcomeProvider';

export default function App() {
  return (
    <BrowserRouter>
      <WelcomeProvider>
        <Routes>
          {/* Landing and auth pages render their own full-screen layout without the Navbar. */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/channels" element={<ChannelsPage />} />
              <Route path="/channels/:id" element={<ChannelRoomPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<PublicProfilePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        {/* The overlay sits outside Routes so it can cover a route change. */}
        <WelcomeOverlay />
      </WelcomeProvider>
    </BrowserRouter>
  );
}
