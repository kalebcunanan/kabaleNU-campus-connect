import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWelcomeEntrance } from '../../hooks/useWelcomeEntrance';
import { Avatar } from '../common/Avatar';
import { NavIcon } from './NavIcon';
import logo from '../../assets/logo/kabalenu-logo.png';
import feedIcon from '../../assets/icons/feed.png';
import eventsIcon from '../../assets/icons/events.png';
import marketIcon from '../../assets/icons/market.png';
import channelsIcon from '../../assets/icons/channels.png';
import leaderboardIcon from '../../assets/icons/leaderboard.png';
import profileIcon from '../../assets/icons/profile.png';
import logoutIcon from '../../assets/icons/logout.png';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/home', label: 'Feed', icon: feedIcon },
  { to: '/events', label: 'Events', icon: eventsIcon },
  { to: '/marketplace', label: 'Market', icon: marketIcon },
  { to: '/channels', label: 'Channels', icon: channelsIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: leaderboardIcon },
  { to: '/profile', label: 'Profile', icon: profileIcon },
];

const getItemClass = ({ isActive }: { isActive: boolean }): string =>
  `flex h-full w-12 items-center justify-center border-b-4 transition-colors sm:w-16 ${
    isActive ? 'border-nu-gold text-nu-gold' : 'border-transparent text-white hover:text-nu-gold'
  }`;

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const entrance = useWelcomeEntrance('animate-slide-down');

  return (
    <nav
      className={`sticky top-0 z-40 border-b-2 border-nu-gold bg-nu-blue shadow-md ${entrance.className}`}
      style={entrance.style}
    >
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4">
        <Link to={user ? '/home' : '/'} className="justify-self-start flex items-center" aria-label="KabaleNU home">
          <img
            src={logo}
            alt="KabaleNU"
            className="h-10 w-auto object-contain origin-left scale-[1.5] sm:scale-[2]"
          />
        </Link>

        {user ? (
          <>
            <div className="flex h-full items-stretch gap-2 sm:gap-6">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={getItemClass} aria-label={item.label} title={item.label}>
                  {item.to === '/profile' && user.profilePicture ? (
                    <Avatar src={user.profilePicture} name={user.name} className="h-8 w-8" />
                  ) : (
                    <NavIcon src={item.icon} />
                  )}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={logout}
                aria-label="Logout"
                title="Logout"
                className="text-white transition-colors hover:text-nu-gold"
              >
                <NavIcon src={logoutIcon} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span />
            <div className="flex items-center gap-4 font-medium text-white">
              <Link to="/login" className="hover:text-nu-gold">Login</Link>
              <Link to="/register" className="rounded-md bg-nu-gold px-4 py-1.5 font-bold text-nu-blue hover:bg-yellow-400">
                Register
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};