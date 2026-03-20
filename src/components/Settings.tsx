import { motion } from 'motion/react';
import { User, LogOut, Hash, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { FirebaseUser } from '../firebase';
import { Category } from '../types';
import { useState, FormEvent } from 'react';

interface SettingsProps {
  user: FirebaseUser | null;
  onLogout: () => void;
  customCategories: Category[];
  onAddCategory: (name: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export default function Settings({ 
  user, 
  onLogout,
  customCategories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory
}: SettingsProps) {
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-6 p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-500/20">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <User size={32} />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{user?.displayName}</h2>
          <p className="text-zinc-500 dark:text-zinc-400">{user?.email}</p>
        </div>
      </div>

      <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Category Management</h3>
          <button 
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Plus size={14} />
            Add Category
          </button>
        </div>

        {isAddingCategory && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddSubmit} 
            className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-emerald-500/30"
          >
            <Hash size={18} className="text-emerald-500" />
            <input
              autoFocus
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
            />
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={16} />
              </button>
              <button 
                type="submit"
                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                <Check size={16} />
              </button>
            </div>
          </motion.form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {customCategories.map((cat) => (
            <div 
              key={cat.id}
              className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 group"
            >
              {editingCategoryId === cat.id ? (
                <form onSubmit={(e) => handleEditSubmit(e, cat.id)} className="flex-1 flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold"
                  />
                  <button type="submit" className="text-emerald-500">
                    <Check size={16} />
                  </button>
                  <button type="button" onClick={() => setEditingCategoryId(null)} className="text-zinc-400">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                      <Hash size={14} />
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingCategoryId(cat.id);
                        setEditingCategoryName(cat.name);
                      }}
                      className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {customCategories.length === 0 && !isAddingCategory && (
            <div className="col-span-full py-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <p className="text-sm text-zinc-500">No custom categories yet. Add one to get started!</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Quick Actions</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-rose-500" />
              <div>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Logout</p>
                <p className="text-xs text-rose-500/70">Sign out of your account</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
