import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  ListTodo, 
  BarChart3, 
  Settings, 
  Plus, 
  Hash, 
  LogOut,
  X,
  Edit2,
  Trash2,
  Check,
  MoreVertical,
  History
} from 'lucide-react';
import { ViewMode, Category } from '../types';
import { cn } from '../utils';
import { FirebaseUser } from '../firebase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  categories: string[];
  customCategories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onAddCategory: (name: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  user: FirebaseUser | null;
  onLogout: () => void;
}

export default function Sidebar({ 
  isOpen,
  onClose,
  activeView, 
  onViewChange, 
  categories, 
  customCategories,
  activeCategory, 
  onCategoryChange,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  user,
  onLogout
}: SidebarProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleEditSubmit = (e: FormEvent, id: string) => {
    e.preventDefault();
    if (editingCategoryName.trim()) {
      onEditCategory(id, editingCategoryName.trim());
      setEditingCategoryId(null);
      setEditingCategoryName('');
    }
  };
  const navItems = [
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'list', label: 'List', icon: ListTodo },
    { id: 'dashboard', label: 'Insights', icon: BarChart3 },
    { id: 'activity', label: 'Activity', icon: History },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-screen z-50 transition-transform duration-300 lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black">
              Z
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">Zenith</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto pt-4">
        <div>
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2 mb-3">Views</p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewMode)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                  activeView === item.id 
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50" 
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-300"
                )}
              >
                <item.icon size={18} className={cn(
                  "transition-colors",
                  activeView === item.id ? "text-emerald-500" : "text-zinc-400 group-hover:text-zinc-600"
                )} />
                <span className="font-medium text-sm">{item.label}</span>
                {activeView === item.id && (
                  <motion.div 
                    layoutId="active-nav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Categories</p>
            <button 
              onClick={() => setIsAddingCategory(true)}
              className="text-zinc-400 hover:text-emerald-500 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {isAddingCategory && (
              <form onSubmit={handleAddSubmit} className="px-2 mb-2">
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg px-2 py-1">
                  <input
                    autoFocus
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category..."
                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
                    onBlur={() => {
                      if (!newCategoryName.trim()) setIsAddingCategory(false);
                    }}
                  />
                  <button type="submit" className="text-emerald-500 hover:text-emerald-600">
                    <Check size={14} />
                  </button>
                </div>
              </form>
            )}
            <button
              onClick={() => onCategoryChange('All')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
                activeCategory === 'All'
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-300"
              )}
            >
              <Hash size={16} className="text-zinc-400" />
              <span className="font-medium text-sm">All Tasks</span>
            </button>
            {categories.map((cat) => {
              const customCat = customCategories.find(c => c.name === cat);
              const isEditing = customCat && editingCategoryId === customCat.id;

              if (isEditing) {
                return (
                  <form 
                    key={customCat.id} 
                    onSubmit={(e) => handleEditSubmit(e, customCat.id)}
                    className="px-2"
                  >
                    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg px-2 py-1">
                      <input
                        autoFocus
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
                        onBlur={() => setEditingCategoryId(null)}
                      />
                      <button type="submit" className="text-emerald-500 hover:text-emerald-600">
                        <Check size={14} />
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div key={cat} className="group relative">
                  <button
                    onClick={() => onCategoryChange(cat)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
                      activeCategory === cat
                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-300"
                    )}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <span className="font-medium text-sm">{cat}</span>
                  </button>
                  
                  {customCat && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategoryId(customCat.id);
                          setEditingCategoryName(customCat.name);
                        }}
                        className="p-1 text-zinc-400 hover:text-emerald-500 transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(customCat.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">{user.displayName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => {
            onViewChange('settings');
            onClose();
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
            activeView === 'settings' 
              ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50" 
              : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-300"
          )}
        >
          <Settings size={18} className={cn(
            "transition-colors",
            activeView === 'settings' ? "text-emerald-500" : "text-zinc-400 group-hover:text-zinc-600"
          )} />
          <span className="font-medium text-sm">Settings</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  </>
);
}
