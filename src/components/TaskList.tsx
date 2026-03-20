import { Task, Priority } from '../types';
import TaskCard from './TaskCard';
import { motion, AnimatePresence } from 'motion/react';
import { ListFilter, ArrowUpDown } from 'lucide-react';
import { cn } from '../utils';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string) => void;
  onDelete: (id: string) => void;
  priorityFilter: Priority | 'All';
  onPriorityFilterChange: (priority: Priority | 'All') => void;
  sortBy: 'date' | 'priority' | 'title';
  onSortChange: (sort: 'date' | 'priority' | 'title') => void;
}

export default function TaskList({ 
  tasks, 
  onStatusChange, 
  onDelete,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortChange
}: TaskListProps) {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className={cn(
              "flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold transition-all",
              priorityFilter !== 'All' ? "text-emerald-500 border-emerald-500/30" : "text-zinc-600 dark:text-zinc-400 hover:border-emerald-500/30"
            )}>
              <ListFilter size={14} />
              <span>{priorityFilter === 'All' ? 'Filter' : `Priority: ${priorityFilter}`}</span>
            </button>
            <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
              {(['All', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => onPriorityFilterChange(p)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors capitalize",
                    priorityFilter === p ? "text-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : "text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:border-emerald-500/30 transition-all">
              <ArrowUpDown size={14} />
              <span className="capitalize">Sort: {sortBy}</span>
            </button>
            <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
              {(['date', 'priority', 'title'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onSortChange(s)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors capitalize",
                    sortBy === s ? "text-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : "text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{tasks.length} Tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
