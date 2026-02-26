import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format } from 'date-fns';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { DateSelector } from '../components/DateSelector';

export default function Sales() {
  const [bottles, setBottles] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>(10);
  const [bottleSize, setBottleSize] = useState<0.5 | 1>(0.5);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const todaySales = useLiveQuery(() => db.sales.where('date').equals(selectedDate).reverse().sortBy('timestamp'), [selectedDate]) || [];

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bottles || !price) return;

    const bottlesNum = Number(bottles);
    const priceNum = Number(price);
    const total = bottlesNum * priceNum;
    const liters = bottlesNum * bottleSize;

    await db.sales.add({
      date: selectedDate,
      bottlesSold: bottlesNum,
      pricePerBottle: priceNum,
      totalIncome: total,
      litersSold: liters,
      bottleSize: bottleSize,
      timestamp: Date.now()
    });

    setBottles('');
  };

  const handleDelete = async (id?: number) => {
    if (id) await db.sales.delete(id);
  };

  const totalBottles = todaySales.reduce((sum, s) => sum + s.bottlesSold, 0);
  const totalLiters = todaySales.reduce((sum, s) => sum + s.litersSold, 0);
  const totalIncome = todaySales.reduce((sum, s) => sum + s.totalIncome, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <DateSelector date={selectedDate} onChange={setSelectedDate} />

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-orange-500" />
          تسجيل مبيعات جديدة
        </h2>
        <form onSubmit={handleAddSale} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">حجم القنينة</label>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setBottleSize(0.5); if (price === 20) setPrice(10); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${bottleSize === 0.5 ? 'bg-white dark:bg-zinc-900 text-orange-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                نصف لتر (0.5L)
              </button>
              <button
                type="button"
                onClick={() => { setBottleSize(1); if (price === 10) setPrice(20); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${bottleSize === 1 ? 'bg-white dark:bg-zinc-900 text-orange-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                لتر واحد (1L)
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">عدد القنينات</label>
              <input 
                type="number" 
                min="1"
                value={bottles}
                onChange={(e) => setBottles(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="مثال: 5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">ثمن القنينة (MAD)</label>
              <input 
                type="number" 
                min="1"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="10"
                required
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            إضافة المبيعات
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-3 text-center border border-orange-100 dark:border-orange-900/50">
          <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">المدخول</div>
          <div className="font-bold text-orange-700 dark:text-orange-300">{totalIncome}</div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3 text-center border border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">القنينات</div>
          <div className="font-bold text-zinc-900 dark:text-white">{totalBottles}</div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3 text-center border border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">اللترات</div>
          <div className="font-bold text-zinc-900 dark:text-white">{totalLiters}L</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-3 px-1">المبيعات المسجلة</h3>
        <div className="space-y-2">
          {todaySales.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-sm">لا توجد مبيعات مسجلة في هذا اليوم</div>
          ) : (
            todaySales.map(sale => (
              <div key={sale.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 flex justify-between items-center shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white">{sale.bottlesSold} قنينات {sale.bottleSize ? `(${sale.bottleSize}L)` : '(0.5L)'}</div>
                  <div className="text-xs text-zinc-500">{format(sale.timestamp, 'HH:mm')} • {sale.pricePerBottle} درهم للقنينة</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">+{sale.totalIncome} MAD</div>
                  <button onClick={() => handleDelete(sale.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
