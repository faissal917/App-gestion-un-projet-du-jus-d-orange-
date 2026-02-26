import { format, addDays, subDays, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';

export function DateSelector({ date, onChange }: { date: string, onChange: (d: string) => void }) {
  const handlePrev = () => onChange(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'));
  const handleNext = () => onChange(format(addDays(parseISO(date), 1), 'yyyy-MM-dd'));
  
  const isToday = date === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-2xl p-3 shadow-sm border border-zinc-100 dark:border-zinc-800 mb-6">
      <button onClick={handlePrev} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
        <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
      </button>
      
      <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
        <CalendarIcon className="w-4 h-4 text-orange-500" />
        {isToday ? 'اليوم' : format(parseISO(date), 'd MMMM yyyy', { locale: ar })}
      </div>

      <button 
        onClick={handleNext} 
        disabled={isToday}
        className={`p-2 rounded-xl transition-colors ${isToday ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
      >
        <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
      </button>
    </div>
  );
}
