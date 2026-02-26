import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format } from 'date-fns';
import { Plus, Receipt, Trash2, Citrus, Truck, Package, Droplet, MoreHorizontal } from 'lucide-react';
import { DateSelector } from '../components/DateSelector';

const CATEGORIES = [
  { id: 'oranges', label: 'برتقال', icon: Citrus, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'bottles_05L', label: 'قنينات 0.5L', icon: Droplet, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { id: 'bottles_1L', label: 'قنينات 1L', icon: Package, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  { id: 'transport', label: 'نقل', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'other', label: 'أخرى', icon: MoreHorizontal, color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800' },
] as const;

export default function Expenses() {
  const [category, setCategory] = useState<typeof CATEGORIES[number]['id']>('oranges');
  const [amount, setAmount] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const todayExpenses = useLiveQuery(() => db.expenses.where('date').equals(selectedDate).reverse().sortBy('timestamp'), [selectedDate]) || [];

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const amountNum = Number(amount);
    const quantityNum = quantity ? Number(quantity) : undefined;

    await db.expenses.add({
      date: selectedDate,
      category,
      amount: amountNum,
      quantity: quantityNum,
      description,
      timestamp: Date.now()
    });

    // If oranges or bottles, add to inventory
    if (category === 'oranges' || category === 'bottles_05L' || category === 'bottles_1L') {
      if (quantityNum) {
        await db.inventory.add({
          date: selectedDate,
          item: category,
          quantityAdded: quantityNum,
          quantityUsed: 0,
          timestamp: Date.now()
        });
      }
    }

    setAmount('');
    setQuantity('');
    setDescription('');
  };

  const handleDelete = async (id?: number) => {
    if (id) await db.expenses.delete(id);
  };

  const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <DateSelector date={selectedDate} onChange={setSelectedDate} />

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-rose-500" />
          تسجيل مصاريف جديدة
        </h2>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">الفئة</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
                      isSelected 
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 shadow-sm scale-105' 
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`} />
                    <span className="text-xs font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">المبلغ (MAD)</label>
              <input 
                type="number" 
                min="0.5"
                step="0.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="مثال: 150"
                required
              />
            </div>
            {(category === 'oranges' || category === 'bottles_05L' || category === 'bottles_1L') && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {category === 'oranges' ? 'الكمية (Kg)' : 'العدد'}
                </label>
                <input 
                  type="number" 
                  min="0.5"
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
                  placeholder={category === 'oranges' ? 'مثال: 50' : 'مثال: 100'}
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">ملاحظات (اختياري)</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="تفاصيل إضافية..."
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            إضافة المصروف
          </button>
        </form>
      </div>

      <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 text-center border border-rose-100 dark:border-rose-900/50 flex justify-between items-center">
        <div className="text-rose-600 dark:text-rose-400 font-medium">مجموع المصاريف</div>
        <div className="font-bold text-2xl text-rose-700 dark:text-rose-300">{totalExpenses} <span className="text-sm font-normal">MAD</span></div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-3 px-1">المصاريف المسجلة</h3>
        <div className="space-y-2">
          {todayExpenses.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-sm">لا توجد مصاريف مسجلة في هذا اليوم</div>
          ) : (
            todayExpenses.map(exp => {
              const cat = CATEGORIES.find(c => c.id === exp.category);
              const Icon = cat?.icon || MoreHorizontal;
              return (
                <div key={exp.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 flex justify-between items-center shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${cat?.bg} ${cat?.color} transition-transform duration-300 hover:scale-110 hover:rotate-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {cat?.label} {exp.quantity ? `(${exp.quantity} ${exp.category === 'oranges' ? 'Kg' : 'قنينة'})` : ''}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {format(exp.timestamp, 'HH:mm')} {exp.description ? `• ${exp.description}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-rose-600 dark:text-rose-400">-{exp.amount} MAD</div>
                    <button onClick={() => handleDelete(exp.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
