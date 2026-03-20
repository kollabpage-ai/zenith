import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import TaskInput from './components/TaskInput';
import TaskBoard from './components/TaskBoard';
import TaskList from './components/TaskList';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import ActivityLogView from './components/ActivityLogView';
import { Task, ViewMode, Theme, Priority, ActivityLog, Status, Category } from './types';
import { cn } from './utils';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  orderBy,
  limit,
  OperationType,
  handleFirestoreError,
  FirebaseUser
} from './firebase';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activeView, setActiveView] = useState<ViewMode>('board');
  const [activeCategory, setActiveCategory] = useState('All');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zenith-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: email.split('@')[0]
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth Error:', err.code, err.message);
      let message = 'An error occurred during authentication.';
      
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
          message = 'Invalid email or password. Please check your credentials or sign up if you don\'t have an account.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          message = 'This email is already registered. Please sign in instead.';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak. It must be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          message = 'Email/Password sign-in is not enabled. Please enable it at: https://console.firebase.google.com/project/ai-studio-applet-webapp-8fa8b/authentication/providers';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled.';
          break;
      }
      setAuthError(message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        // Create or update user profile in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          createdAt: serverTimestamp(),
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`));
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Task Syncing
  useEffect(() => {
    if (!user || !isAuthReady) {
      setTasks([]);
      return;
    }

    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef, 
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasksData.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate().toISOString() : data.dueDate,
        } as Task);
      });
      setTasks(tasksData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  // Real-time Category Syncing
  useEffect(() => {
    if (!user || !isAuthReady) {
      setCustomCategories([]);
      return;
    }

    const categoriesRef = collection(db, 'categories');
    const q = query(
      categoriesRef, 
      where('uid', '==', user.uid),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData: Category[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        categoriesData.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Category);
      });
      setCustomCategories(categoriesData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'categories'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  // Real-time Activity Syncing
  useEffect(() => {
    if (!user || !isAuthReady) {
      setActivityLogs([]);
      return;
    }

    const logsRef = collection(db, 'activityLogs');
    const q = query(
      logsRef, 
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData: ActivityLog[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        logsData.push({
          ...data,
          id: doc.id,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp,
        } as ActivityLog);
      });
      setActivityLogs(logsData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'activityLogs'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('zenith-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('zenith-theme', 'light');
    }
  }, [theme]);

  const categories = useMemo(() => {
    const taskCats = Array.from(new Set(tasks.map(t => t.category)));
    const customCats = customCategories.map(c => c.name);
    const allCats = Array.from(new Set([...taskCats, ...customCats]));
    return allCats.sort();
  }, [tasks, customCategories]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(t => t.category === activeCategory);
    }

    // Priority Filter
    if (priorityFilter !== 'All') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description?.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'priority') {
        const priorityMap: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
        return priorityMap[b.priority] - priorityMap[a.priority];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [tasks, activeCategory, priorityFilter, searchQuery, sortBy]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleAddTask = async (title: string, priority: Priority, category: string, status: Status = 'todo') => {
    if (!user) return;
    try {
      const tasksRef = collection(db, 'tasks');
      const newTask = {
        uid: user.uid,
        title,
        priority,
        category,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(tasksRef, newTask);
      
      // Log activity
      await addDoc(collection(db, 'activityLogs'), {
        uid: user.uid,
        action: 'TASK_CREATED',
        timestamp: serverTimestamp(),
        details: `Created task: ${title}`
      });

      // If category is new, add it to customCategories
      if (!customCategories.some(c => c.name.toLowerCase() === category.toLowerCase())) {
        await addDoc(collection(db, 'categories'), {
          uid: user.uid,
          name: category,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const handleAddCategory = async (name: string) => {
    if (!user || !name.trim()) return;
    if (customCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
    try {
      await addDoc(collection(db, 'categories'), {
        uid: user.uid,
        name: name.trim(),
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'categories');
    }
  };

  const handleEditCategory = async (id: string, newName: string) => {
    if (!user || !newName.trim()) return;
    try {
      const categoryRef = doc(db, 'categories', id);
      const oldName = customCategories.find(c => c.id === id)?.name;
      await updateDoc(categoryRef, { name: newName.trim() });

      // Update all tasks with this category
      if (oldName) {
        const tasksToUpdate = tasks.filter(t => t.category === oldName);
        for (const task of tasksToUpdate) {
          await updateDoc(doc(db, 'tasks', task.id), { category: newName.trim() });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user) return;
    try {
      const categoryToDelete = customCategories.find(c => c.id === id);
      await deleteDoc(doc(db, 'categories', id));

      // Update tasks in this category to 'General'
      if (categoryToDelete) {
        const tasksToUpdate = tasks.filter(t => t.category === categoryToDelete.name);
        for (const task of tasksToUpdate) {
          await updateDoc(doc(db, 'tasks', task.id), { category: 'General' });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const handleStatusChange = async (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const nextStatus: Record<string, string> = {
      'todo': 'in-progress',
      'in-progress': 'completed',
      'completed': 'todo'
    };
    const newStatus = nextStatus[task.status] as any;

    const statusLabels: Record<string, string> = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'completed': 'Completed'
    };

    try {
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Log activity
      await addDoc(collection(db, 'activityLogs'), {
        uid: user.uid,
        action: 'STATUS_CHANGED',
        taskId: id,
        timestamp: serverTimestamp(),
        details: `Moved "${task.title}" to ${statusLabels[newStatus]}`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    try {
      const taskRef = doc(db, 'tasks', id);
      await deleteDoc(taskRef);

      // Log activity
      await addDoc(collection(db, 'activityLogs'), {
        uid: user.uid,
        action: 'TASK_DELETED',
        taskId: id,
        timestamp: serverTimestamp(),
        details: `Deleted task "${taskToDelete.title}"`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
    }
  };

  if (!isAuthReady) {
    return (
      <div className={cn("flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950", theme === 'dark' && 'dark')}>
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn("flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4", theme === 'dark' && 'dark')}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 text-2xl font-black">
              Z
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome to Zenith'}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              {isSignUp ? 'Join us to boost your productivity.' : 'Sign in to manage your tasks.'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              />
            </div>
            
            {authError && (
              <p className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
                {authError}
              </p>
            )}

            <button 
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center"
            >
              {isAuthLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-4 text-zinc-400 font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-3 mb-6"
          >
            <span className="w-5 h-5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300 rounded-sm text-[10px] font-black">G</span>
            Google Account
          </button>

          <p className="text-center text-sm text-zinc-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
              }}
              className="text-emerald-500 font-bold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300", theme === 'dark' && 'dark')}>
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeView} 
        onViewChange={(view) => {
          setActiveView(view);
          setIsSidebarOpen(false);
        }}
        categories={categories}
        customCategories={customCategories}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setIsSidebarOpen(false);
        }}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar 
          onMenuToggle={() => setIsSidebarOpen(true)}
          onViewChange={setActiveView}
          title={activeView.charAt(0).toUpperCase() + activeView.slice(1)} 
          user={user}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeView !== 'dashboard' && activeView !== 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <TaskInput onAdd={handleAddTask} categories={categories} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeView + activeCategory}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeView === 'board' && (
                  <TaskBoard 
                    tasks={filteredTasks} 
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                    onAddTask={handleAddTask}
                    categories={categories}
                    priorityFilter={priorityFilter}
                    onPriorityFilterChange={setPriorityFilter}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />
                )}
                {activeView === 'list' && (
                  <TaskList 
                    tasks={filteredTasks} 
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                    priorityFilter={priorityFilter}
                    onPriorityFilterChange={setPriorityFilter}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />
                )}
                {activeView === 'dashboard' && (
                  <Dashboard 
                    tasks={tasks} 
                    logs={activityLogs} 
                    onViewAllLogs={() => setActiveView('activity')}
                  />
                )}
                {activeView === 'activity' && (
                  <ActivityLogView 
                    logs={activityLogs} 
                    onBack={setActiveView} 
                  />
                )}
                {activeView === 'settings' && (
                  <Settings 
                    user={user} 
                    onLogout={handleLogout}
                    customCategories={customCategories}
                    onAddCategory={handleAddCategory}
                    onEditCategory={handleEditCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
