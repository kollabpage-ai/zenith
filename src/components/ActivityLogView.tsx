import { motion } from 'motion/react';
import { Activity, History, ArrowLeft } from 'lucide-react';
import { ActivityLog, ViewMode } from '../types';
import { cn } from '../utils';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  onBack: (view: ViewMode) => void;
}

export default function ActivityLogView({ logs, onBack }: ActivityLogViewProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLogBg = (action: string) => {
    switch (action) {
      case 'TASK_CREATED': return 'bg-emerald-50 dark:bg-emerald-900/20';
      case 'STATUS_CHANGED': return 'bg-amber-50 dark:bg-amber-900/20';
      case 'TASK_DELETED': return 'bg-rose-50 dark:bg-rose-900/20';
      default: return 'bg-zinc-50 dark:bg-zinc-900/50';
    }
  };

  const getLogIcon = (action: string) => {
    switch (action) {
      case 'TASK_CREATED': return '✨';
      case 'STATUS_CHANGED': return '🔄';
      case 'TASK_DELETED': return '🗑️';
      default: return '⚡';
    }
  };

  const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return formatDate(isoString);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onBack('dashboard')}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Activity History</h1>
            <p className="text-sm text-zinc-500">A complete log of your productivity journey</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-500">
          {logs.length} Total Actions
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {logs.length > 0 ? (
            logs.map((log, i) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="p-6 flex items-start gap-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-lg",
                  getLogBg(log.action)
                )}>
                  {getLogIcon(log.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 font-bold">
                      {log.details}
                    </p>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                      {getRelativeTime(log.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {formatDate(log.timestamp)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400">
                <History size={40} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">No activity yet</h3>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto">Start managing your tasks to see your productivity history grow here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
