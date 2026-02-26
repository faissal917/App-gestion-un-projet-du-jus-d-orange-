import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DateSelector } from '../components/DateSelector';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const todaySales = useLiveQuery(() => db.sales.where('date').equals(selectedDate).toArray(), [selectedDate]) || [];
  const todayExpenses = useLiveQuery(() => db.expenses.where('date').equals(selectedDate).toArray(), [selectedDate]) || [];
  
  const allSales = useLiveQuery(() => db.sales.toArray()) || [];
  const allExpenses = useLiveQuery(() => db.expenses.toArray()) || [];

  const todayIncome = todaySales.reduce((sum, sale) => sum + sale.totalIncome, 0);
  const todayTotalExpenses = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const todayProfit = todayIncome - todayTotalExpenses;

  const totalIncome = allSales.reduce((sum, sale) => sum + sale.totalIncome, 0);
  const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalProfit = totalIncome - totalExpenses;

  // Prepare chart data (last 7 days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const daySales = allSales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.totalIncome, 0);
    const dayExpenses = allExpenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0);
    return {
      name: format(d, 'MM/dd'),
      profit: daySales - dayExpenses,
      sales: daySales
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-3xl p-6 border border-orange-100 dark:border-orange-900/30 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-orange-900 dark:text-orange-100 mb-1">مرحباً بك! 🌙</h2>
          <p className="text-orange-700/80 dark:text-orange-300/80 text-sm mb-6">إليك ملخص أداء مشروعك اليوم</p>
          
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/20 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">الربح الصافي</h3>
              <div className={`p-2 rounded-full ${todayProfit >= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                {todayProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
            </div>
            <div className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              {todayProfit.toFixed(2)} <span className="text-lg text-zinc-400 font-medium">MAD</span>
            </div>
          </div>
        </div>
      </div>

      <DateSelector date={selectedDate} onChange={setSelectedDate} />

      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          title="المدخول" 
          value={todayIncome} 
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />} 
          trend={todayIncome > 0 ? 'up' : 'neutral'}
        />
        <StatCard 
          title="المصاريف" 
          value={todayTotalExpenses} 
          icon={<Activity className="w-5 h-5 text-rose-500" />} 
          trend={todayTotalExpenses > 0 ? 'down' : 'neutral'}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
        <h3 className="text-zinc-800 dark:text-zinc-200 font-bold mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" />
          تطور المبيعات (أسبوع)
        </h3>
        <div className="h-48 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#18181b', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-3xl p-6 shadow-lg shadow-orange-500/25 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
        <h3 className="text-orange-100 text-sm font-medium mb-2 relative z-10">مجموع أرباح رمضان</h3>
        <div className="text-4xl font-black tracking-tight relative z-10">
          {totalProfit.toFixed(2)} <span className="text-xl opacity-80 font-medium">MAD</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: number, icon: React.ReactNode, trend: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold">{title}</h3>
        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
        {value.toFixed(2)}
      </div>
    </div>
  );
}
