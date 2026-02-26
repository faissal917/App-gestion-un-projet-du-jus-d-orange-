import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Database, Trash2 } from 'lucide-react';
import { db } from '../db';

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };

  const clearData = async () => {
    if (window.confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذه العملية.')) {
      await db.sales.clear();
      await db.expenses.clear();
      await db.inventory.clear();
      alert('تم مسح جميع البيانات بنجاح.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-zinc-500" />
          الإعدادات
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-zinc-900 dark:text-white">المظهر</div>
              <div className="text-sm text-zinc-500">تغيير بين الوضع الليلي والنهاري</div>
            </div>
            <button 
              onClick={toggleTheme}
              className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-rose-500" />
                مسح البيانات
              </div>
              <div className="text-sm text-zinc-500">حذف جميع المبيعات والمصاريف والمخزون</div>
            </div>
            <button 
              onClick={clearData}
              className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
