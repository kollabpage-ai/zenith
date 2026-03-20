import { Search, User, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { ViewMode } from '../types';
import { FirebaseUser } from '../firebase';
import { cn } from '../utils';

interface TopBarProps {
  onMenuToggle: () => void;
  onViewChange: (view: ViewMode) => void;
  title: string;
  user: FirebaseUser | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function TopBar({ onMenuToggle, onViewChange, title, user, searchQuery, onSearchChange }: TopBarProps) {
  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 sm:gap-8 flex-1">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50 truncate max-w-[100px] sm:max-w-none">{title}</h1>
        
        <div className="relative max-w-md w-full group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-800 border focus:border-emerald-500/30 rounded-xl text-sm outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={() => onViewChange('settings')}
          className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors group"
        >
          <div className="text-right hidden lg:block">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[100px]">{user?.displayName || 'User'}</p>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || ''} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User size={18} />
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
