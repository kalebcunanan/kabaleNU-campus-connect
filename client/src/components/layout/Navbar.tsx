import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWelcomeEntrance } from '../../hooks/useWelcomeEntrance';
import { Avatar } from '../common/Avatar';
import FriendRequestBadge from './FriendRequestBadge';
import { NavIcon } from './NavIcon';
import logo from '../../assets/logo/kabalenu-logo.png';
import feedIcon from '../../assets/icons/feed.png';
import eventsIcon from '../../assets/icons/events.png';
import marketIcon from '../../assets/icons/market.png';
import channelsIcon from '../../assets/icons/channels.png';
import friendsIcon from '../../assets/icons/friends.png';
import leaderboardIcon from '../../assets/icons/leaderboard.png';
import profileIcon from '../../assets/icons/profile.png';
import logoutIcon from '../../assets/icons/logout.png';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

interface IndicatorStyle extends React.CSSProperties {
  '--i': number;
}

// The profile link matches only its exact path so /profile/:id (another user) does not light it up.
const NAV_ITEMS: NavItem[] = [
  { to: '/home', label: 'Feed', icon: feedIcon },
  { to: '/events', label: 'Events', icon: eventsIcon },
  { to: '/marketplace', label: 'Market', icon: marketIcon },
  { to: '/channels', label: 'Channels', icon: channelsIcon },
  { to: '/friends', label: 'Friends', icon: friendsIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: leaderboardIcon },
  { to: '/profile', label: 'Profile', icon: profileIcon, end: true },
];

const getItemClass = ({ isActive }: { isActive: boolean }): string =>
  `flex h-full w-[var(--w)] items-center justify-center transition-colors ${
    isActive ? 'text-nu-gold' : 'text-white hover:text-nu-gold'
  }`;

const isItemActive = (item: NavItem, pathname: string): boolean =>
  item.end ? pathname === item.to : pathname.startsWith(item.to);

export const Navbar: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { pathname } = useLocation();
  const entrance = useWelcomeEntrance('animate-slide-down');

  const activeIndex: number = NAV_ITEMS.findIndex((item) => isItemActive(item, pathname));
  const indicatorStyle: IndicatorStyle = { '--i': Math.max(activeIndex, 0) };

  return (
    <nav
      aria-label="Main navigation"
      className={`relative z-40 shrink-0 border-b-2 border-nu-gold bg-nu-blue shadow-md ${entrance.className}`}
      style={entrance.style}
    >
      {/* On phones the icons wrap to a second row so seven items still fit at 375px. */}
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-2 px-4 sm:h-16 sm:grid-cols-[1fr_auto_1fr]">
        <Link to={user ? '/home' : '/'} className="flex h-14 items-center justify-self-start sm:h-full" aria-label="KabaleNU home">
          <img
            src={logo}
            alt="KabaleNU"
            className="h-10 w-auto object-contain origin-left scale-[1.5] sm:scale-[2]"
          />
        </Link>

        {user ? (
          <>
            <div className="relative order-last col-span-2 flex h-12 items-stretch justify-self-center gap-[var(--g)] [--g:0.125rem] [--w:2.75rem] sm:order-none sm:col-span-1 sm:h-full md:[--g:0.75rem] md:[--w:3.5rem] lg:[--g:1.5rem] lg:[--w:4rem]">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={getItemClass}
                  aria-label={item.label}
                  title={item.label}
                >
                  {item.to === '/profile' && user.profilePicture ? (
                    <Avatar src={user.profilePicture} name={user.name} className="h-8 w-8" />
                  ) : item.to === '/friends' ? (
                    <span className="relative inline-flex">
                      <NavIcon src={item.icon} />
                      <FriendRequestBadge />
                    </span>
                  ) : (
                    <NavIcon src={item.icon} />
                  )}
                </NavLink>
              ))}
              <span
                aria-hidden="true"
                style={indicatorStyle}
                className={`pointer-events-none absolute bottom-0 left-0 h-1 w-[var(--w)] translate-x-[calc(var(--i)*(var(--w)+var(--g)))] bg-nu-gold transition-transform duration-300 ease-out motion-reduce:transition-none ${
                  activeIndex === -1 ? 'opacity-0' : ''
                }`}
              />
            </div>

            <div className="flex h-14 items-center justify-end gap-3 sm:h-full">
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
        ) : isLoading ? (
          // While the session restores, show nothing so Login and Register do not flash.
          <span aria-hidden="true" />
        ) : (
          <>
            <span className="hidden sm:block" />
            <div className="flex h-14 items-center gap-4 font-medium text-white sm:h-full">
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
