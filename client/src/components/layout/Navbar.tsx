import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-[#00205B] text-[#FFB81C] p-4 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-tight">Campus Connect</Link>
        
        {user ? (
          <div className="flex space-x-4 items-center font-medium">
            <Link to="/home" className="hover:text-white transition-colors">Feed</Link>
            <Link to="/events" className="hover:text-white transition-colors">Events</Link>
            <Link to="/marketplace" className="hover:text-white transition-colors">Market</Link>
            <Link to="/channels" className="hover:text-white transition-colors">Channels</Link>
            <Link to="/profile" className="hover:text-white transition-colors truncate max-w-[100px]">{user.name}</Link>
            <button onClick={logout} className="bg-[#FFB81C] text-[#00205B] px-3 py-1 rounded-md font-bold hover:bg-yellow-400 transition-colors">
              Logout
            </button>
          </div>
        ) : (
          <div className="space-x-4 font-medium">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="bg-[#FFB81C] text-[#00205B] px-4 py-1.5 rounded-md font-bold hover:bg-yellow-400 transition-colors">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};