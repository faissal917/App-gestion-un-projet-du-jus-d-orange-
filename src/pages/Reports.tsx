import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, parseISO, startOfWeek, startOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';
import { BarChart3, Download, Calendar, TrendingUp, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type FilterType = 'daily' | 'weekly' | 'monthly';

export default function Reports() {
  const [filter, setFilter] = useState<FilterType>('daily');
  
  const allSales = useLiveQuery(() => db.sales.toArray()) || [];
  const allExpenses = useLiveQuery(() => db.expenses.toArray()) || [];

  const getGroupKey = (dateStr: string, currentFilter: FilterType) => {
    const d = parseISO(dateStr);
    if (currentFilter === 'monthly') return format(startOfMonth(d), 'yyyy-MM-dd');
    if (currentFilter === 'weekly') return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    return dateStr;
  };

  // Group by selected filter
  const groupedStats = allSales.reduce((acc, sale) => {
    const key = getGroupKey(sale.date, filter);
    if (!acc[key]) {
      acc[key] = { date: key, income: 0, expenses: 0, profit: 0, bottles: 0 };
    }
    acc[key].income += sale.totalIncome;
    acc[key].bottles += sale.bottlesSold;
    return acc;
  }, {} as Record<string, any>);

  allExpenses.forEach(exp => {
    const key = getGroupKey(exp.date, filter);
    if (!groupedStats[key]) {
      groupedStats[key] = { date: key, income: 0, expenses: 0, profit: 0, bottles: 0 };
    }
    groupedStats[key].expenses += exp.amount;
  });

  const statsArray = Object.values(groupedStats).map(stat => ({
    ...stat,
    profit: stat.income - stat.expenses
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = statsArray.reduce((sum, s) => sum + s.income, 0);
  const totalExpenses = statsArray.reduce((sum, s) => sum + s.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;
  const totalBottles = statsArray.reduce((sum, s) => sum + s.bottles, 0);

  const bestDay = statsArray.reduce((best, current) => 
    current.profit > (best?.profit || 0) ? current : best, 
  statsArray[0]);

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Add title
    doc.setFontSize(20);
    doc.text('Ramadan Juice Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Total Income: ${totalIncome.toFixed(2)} MAD`, 20, 40);
    doc.text(`Total Expenses: ${totalExpenses.toFixed(2)} MAD`, 20, 50);
    doc.text(`Total Profit: ${totalProfit.toFixed(2)} MAD`, 20, 60);
    doc.text(`Total Bottles Sold: ${totalBottles}`, 20, 70);

    const tableData = statsArray.map(stat => {
      let dateLabel = stat.date;
      if (filter === 'monthly') dateLabel = format(parseISO(stat.date), 'MMMM yyyy');
      if (filter === 'weekly') dateLabel = `Week of ${stat.date}`;
      
      return [
        dateLabel,
        stat.bottles.toString(),
        stat.income.toFixed(2),
        stat.expenses.toFixed(2),
        stat.profit.toFixed(2)
      ];
    });

    autoTable(doc, {
      startY: 80,
      head: [['Period', 'Bottles', 'Income (MAD)', 'Expenses (MAD)', 'Profit (MAD)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] }, // Orange-500
    });

    doc.save(`ramadan-juice-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            التقارير
          </h2>
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Download className="w-4 h-4" />
            تحميل PDF
          </button>
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setFilter('daily')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filter === 'daily' ? 'bg-white dark:bg-zinc-900 text-indigo-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            يومي
          </button>
          <button
            onClick={() => setFilter('weekly')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filter === 'weekly' ? 'bg-white dark:bg-zinc-900 text-indigo-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            أسبوعي
          </button>
          <button
            onClick={() => setFilter('monthly')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filter === 'monthly' ? 'bg-white dark:bg-zinc-900 text-indigo-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            شهري
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1">إجمالي الأرباح</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalProfit.toFixed(2)}</div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1">إجمالي القنينات</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">{totalBottles}</div>
          </div>
        </div>

        {bestDay && filter === 'daily' && (
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-4 mb-6 border border-orange-100 dark:border-orange-900/50 flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full text-orange-600 dark:text-orange-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-1">أفضل يوم مبيعات</div>
              <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(parseISO(bestDay.date), 'EEEE, d MMMM yyyy', { locale: ar })}
              </div>
              <div className="font-bold text-orange-900 dark:text-orange-200 mt-1">
                {bestDay.profit.toFixed(2)} MAD ربح
              </div>
            </div>
          </div>
        )}

        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-3 px-1">
          {filter === 'daily' ? 'الملخص اليومي' : filter === 'weekly' ? 'الملخص الأسبوعي' : 'الملخص الشهري'}
        </h3>
        <div className="space-y-2">
          {statsArray.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-sm">لا توجد بيانات لعرضها</div>
          ) : (
            statsArray.map(stat => (
              <div key={stat.date} className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 flex justify-between items-center border border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white text-sm">
                    {filter === 'daily' && format(parseISO(stat.date), 'd MMMM', { locale: ar })}
                    {filter === 'weekly' && `أسبوع ${format(parseISO(stat.date), 'd MMMM', { locale: ar })}`}
                    {filter === 'monthly' && format(parseISO(stat.date), 'MMMM yyyy', { locale: ar })}
                  </div>
                  <div className="text-xs text-zinc-500">{stat.bottles} قنينة</div>
                </div>
                <div className="text-left">
                  <div className={`font-bold ${stat.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {stat.profit >= 0 ? '+' : ''}{stat.profit.toFixed(2)} MAD
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    م: {stat.income.toFixed(0)} | ص: {stat.expenses.toFixed(0)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
