import React from 'react';
import { Home, Search, Heart, User, Menu } from 'lucide-react';

const AppShell = ({ children, variant = "default" }) => {
  const isCompact = variant === "compact";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500 rounded-full opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-indigo-500 rounded-full opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="glass-card border-t border-white/20 px-4 py-3">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Search className="w-5 h-5" />
              <span className="text-xs">Search</span>
            </button>
            <button className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-xs">Favorites</span>
            </button>
            <button className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/10 transition-colors">
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Padding for bottom nav */}
      <div className="h-20"></div>
    </div>
  );
};

export default AppShell;