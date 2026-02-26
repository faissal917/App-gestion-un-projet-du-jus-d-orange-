import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Package, AlertTriangle, Info } from 'lucide-react';

export default function Inventory() {
  const allInventory = useLiveQuery(() => db.inventory.toArray()) || [];
  const allSales = useLiveQuery(() => db.sales.toArray()) || [];

  // Calculate total oranges bought
  const totalOrangesBought = allInventory
    .filter(i => i.item === 'oranges')
    .reduce((sum, i) => sum + i.quantityAdded, 0);

  // Calculate total bottles bought
  const totalBottles05LBought = allInventory
    .filter(i => i.item === 'bottles_05L')
    .reduce((sum, i) => sum + i.quantityAdded, 0);

  const totalBottles1LBought = allInventory
    .filter(i => i.item === 'bottles_1L')
    .reduce((sum, i) => sum + i.quantityAdded, 0);

  // Calculate total liters sold
  const totalLitersSold = allSales.reduce((sum, s) => sum + s.litersSold, 0);

  // Calculate bottles used
  const usedBottles05L = allSales
    .filter(s => s.bottleSize === 0.5 || !s.bottleSize)
    .reduce((sum, s) => sum + s.bottlesSold, 0);

  const usedBottles1L = allSales
    .filter(s => s.bottleSize === 1)
    .reduce((sum, s) => sum + s.bottlesSold, 0);

  // Estimate oranges used based on liters sold (e.g., 1 kg = 0.4 L)
  // Or conversely: 1 L requires 2.5 kg of oranges
  const ORANGES_PER_LITER = 2.5; 
  const estimatedOrangesUsed = totalLitersSold * ORANGES_PER_LITER;
  const remainingOranges = Math.max(0, totalOrangesBought - estimatedOrangesUsed);

  const remainingBottles05L = Math.max(0, totalBottles05LBought - usedBottles05L);
  const remainingBottles1L = Math.max(0, totalBottles1LBought - usedBottles1L);

  const isLowOranges = remainingOranges > 0 && remainingOranges < 20;
  const isLowBottles05L = remainingBottles05L > 0 && remainingBottles05L < 20;
  const isLowBottles1L = remainingBottles1L > 0 && remainingBottles1L < 20;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" />
          حالة المخزون
        </h2>
        
        <div className="space-y-4">
          <InventoryCard 
            title="البرتقال" 
            remaining={remainingOranges} 
            total={totalOrangesBought} 
            used={estimatedOrangesUsed} 
            unit="Kg" 
            isLow={isLowOranges}
            color="orange"
          />

          <InventoryCard 
            title="قنينات 0.5L" 
            remaining={remainingBottles05L} 
            total={totalBottles05LBought} 
            used={usedBottles05L} 
            unit="قنينة" 
            isLow={isLowBottles05L}
            color="emerald"
          />

          <InventoryCard 
            title="قنينات 1L" 
            remaining={remainingBottles1L} 
            total={totalBottles1LBought} 
            used={usedBottles1L} 
            unit="قنينة" 
            isLow={isLowBottles1L}
            color="teal"
          />
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 flex gap-3 border border-blue-100 dark:border-blue-900/50">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
            يتم حساب المخزون المتبقي تقريبياً بناءً على المبيعات. 
            <br/>
            (كل 1 لتر عصير يستهلك حوالي 2.5 كغ برتقال)
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryCard({ 
  title, 
  remaining, 
  total, 
  used, 
  unit, 
  isLow, 
  color 
}: { 
  title: string, 
  remaining: number, 
  total: number, 
  used: number, 
  unit: string, 
  isLow: boolean,
  color: 'orange' | 'emerald' | 'teal' 
}) {
  const percentage = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  
  const colorClasses = {
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-zinc-900 dark:text-white">{title}</div>
        {isLow && (
          <div className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-100 dark:bg-rose-950/50 px-2 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            مخزون منخفض
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-end mb-2">
        <div className="text-3xl font-bold text-zinc-900 dark:text-white">
          {remaining.toFixed(1)} <span className="text-sm font-normal text-zinc-500">{unit}</span>
        </div>
        <div className="text-xs text-zinc-500 text-right">
          <div>المشترى: {total.toFixed(1)} {unit}</div>
          <div>المستهلك: {used.toFixed(1)} {unit}</div>
        </div>
      </div>

      <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${isLow ? 'bg-rose-500' : colorClasses[color]} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
