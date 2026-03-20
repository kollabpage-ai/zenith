import React, { useState } from 'react';
import { Plus, Calendar, Tag, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Priority } from '../types';
import { cn } from '../utils';

interface TaskInputProps {
  onAdd: (title: string, priority: Priority, category: string) => void;
  categories: string[];
}

export default function TaskInput({ onAdd, categories }: TaskInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState(categories[0] || 'General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, priority, category);
    setTitle('');
    setIsExpanded(false);
  };

  return (
    <div className="mb-8">
      <form 
        onSubmit={handleSubmit}
        className={cn(
          "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm transition-all duration-300 overflow-hidden",
          isExpanded ? "ring-2 ring-emerald-500/20 border-emerald-500/50" : "hover:border-zinc-300 dark:hover:border-zinc-700"
        )}
      >
        <div className="p-4 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Plus size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Add a new task..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
          />
          {!isExpanded && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
              <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">Enter</kbd>
              <span>to add</span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-zinc-100 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Priority</span>
                  <div className="flex p-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={cn(
                          "px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                          priority === p 
                            ? "bg-emerald-500 text-white shadow-sm" 
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Category</span>
                  <div className="relative">
                    <input 
                      list="categories-list"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Type or choose..."
                      className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:ring-1 ring-emerald-500/30 w-40"
                    />
                    <datalist id="categories-list">
                      {categories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-200 dark:shadow-none"
                >
                  Create Task
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
