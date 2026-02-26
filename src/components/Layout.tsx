import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Receipt, Package, BarChart3, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function BottomNav() {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/sales', icon: ShoppingCart, label: 'المبيعات' },
    { path: '/expenses', icon: Receipt, label: 'المصاريف' },
    { path: '/inventory', icon: Package, label: 'المخزون' },
    { path: '/reports', icon: BarChart3, label: 'التقارير' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-300",
                isActive ? "text-orange-500" : "text-zinc-500 dark:text-zinc-400 hover:text-orange-400"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 transition-all duration-300",
                isActive ? "scale-110" : "group-hover:scale-110 group-hover:-translate-y-1"
              )} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-20" dir="rtl">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md px-4 py-4 rounded-b-3xl mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold shadow-inner overflow-hidden border-2 border-white/20">
              {/* Placeholder for the user's logo */}
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Juice&backgroundColor=ffedd5" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">عصير رمضان</h1>
              <p className="text-orange-100 text-xs font-medium">طازج ومنعش كل يوم</p>
            </div>
          </div>
          <Link to="/settings" className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <Settings className="w-6 h-6" />
          </Link>
        </div>
      </header>
      <main className="p-4 max-w-md mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
