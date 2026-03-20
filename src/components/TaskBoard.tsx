import React, { useState, useRef, useEffect } from 'react';
import { Task, Status, Priority } from '../types';
import TaskCard from './TaskCard';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MoreHorizontal, X, Check, ListFilter, ArrowUpDown, Trash2 } from 'lucide-react';
import { cn } from '../utils';

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: (title: string, priority: Priority, category: string, status: Status) => void;
  categories: string[];
  priorityFilter: Priority | 'All';
  onPriorityFilterChange: (priority: Priority | 'All') => void;
  sortBy: 'date' | 'priority' | 'title';
  onSortChange: (sort: 'date' | 'priority' | 'title') => void;
}

interface ColumnMenuProps {
  status: Status;
  tasks: Task[];
  onDelete: (id: string) => void;
}

function ColumnMenu({ status, tasks, onDelete }: ColumnMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClearColumn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const columnTasks = tasks.filter(t => t.status === status);
    columnTasks.forEach(t => onDelete(t.id));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-1 rounded-lg transition-colors",
          isOpen 
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50" 
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        )}
      >
        <MoreHorizontal size={18} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="py-1">
              <button 
                onClick={handleClearColumn}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                <Trash2 size={14} />
                <span>Clear Column</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const columns: { id: Status; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
  { id: 'completed', label: 'Completed', color: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400' },
];

export default function TaskBoard({ 
  tasks, 
  onStatusChange, 
  onDelete, 
  onAddTask, 
  categories,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortChange
}: TaskBoardProps) {
  const [addingToColumn, setAddingToColumn] = useState<Status | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleQuickAdd = (status: Status) => {
    if (!newTaskTitle.trim()) {
      setAddingToColumn(null);
      return;
    }
    onAddTask(newTaskTitle, 'medium', categories[0] || 'General', status);
    setNewTaskTitle('');
    setAddingToColumn(null);
  };

  return (
    <div className="space-y-8 h-full pb-8">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
      {columns.map((column) => {
        const columnTasks = tasks.filter(t => t.status === column.id);
        
        return (
          <div key={column.id} className="flex flex-col min-w-[300px]">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">{column.label}</h2>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                  column.color
                )}>
                  {columnTasks.length}
                </span>
              </div>
            <ColumnMenu status={column.id} tasks={tasks} onDelete={onDelete} />
            </div>

            <div className="flex-1 space-y-4 min-h-[200px]">
              <AnimatePresence mode="popLayout">
                {columnTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                  />
                ))}
              </AnimatePresence>

              {addingToColumn === column.id ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900 border border-emerald-500/50 rounded-2xl p-4 shadow-lg ring-2 ring-emerald-500/10"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickAdd(column.id);
                      if (e.key === 'Escape') setAddingToColumn(null);
                    }}
                    className="w-full bg-transparent border-none outline-none text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setAddingToColumn(null)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <button 
                      onClick={() => handleQuickAdd(column.id)}
                      className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button 
                  onClick={() => setAddingToColumn(column.id)}
                  className="w-full py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <Plus size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-wider">Add Task</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
