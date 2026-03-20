import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MoreVertical, 
  CheckCircle2, 
  Circle, 
  Trash2,
  Tag,
  ChevronRight
} from 'lucide-react';
import { Task, Priority, Status } from '../types';
import { cn } from '../utils';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string) => void;
  onDelete: (id: string) => void;
  key?: string;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange(task.id);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
    setIsMenuOpen(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200",
        isCompleted && "opacity-60 grayscale-[0.5]"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(task.id);
          }}
          className={cn(
            "mt-1 transition-colors",
            isCompleted ? "text-emerald-500" : "text-zinc-300 hover:text-emerald-500"
          )}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate transition-all",
            isCompleted && "line-through text-zinc-400 dark:text-zinc-500"
          )}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative" ref={menuRef}>
          <button 
            onClick={handleDeleteClick}
            className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
          
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                isMenuOpen 
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50" 
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              )}
            >
              <MoreVertical size={16} />
            </button>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="py-1">
                    <button 
                      onClick={handleStatusClick}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Change Status</span>
                      </div>
                      <ChevronRight size={14} className="text-zinc-400" />
                    </button>
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 mx-2 my-1" />
                    <button 
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Delete Task</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
          priorityColors[task.priority]
        )}>
          {task.priority}
        </span>

        <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
          <Tag size={12} />
          <span className="text-[11px] font-medium">{task.category}</span>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 ml-auto">
            <Calendar size={12} />
            <span className="text-[11px] font-medium">
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
