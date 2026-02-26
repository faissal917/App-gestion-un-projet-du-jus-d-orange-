import Dexie, { Table } from 'dexie';

export interface Sale {
  id?: number;
  date: string; // YYYY-MM-DD
  bottlesSold: number;
  pricePerBottle: number;
  totalIncome: number;
  litersSold: number;
  bottleSize?: number;
  timestamp: number;
}

export interface Expense {
  id?: number;
  date: string; // YYYY-MM-DD
  category: 'oranges' | 'transport' | 'bottles_1L' | 'bottles_05L' | 'other';
  amount: number;
  quantity?: number; // e.g., kg of oranges
  description?: string;
  timestamp: number;
}

export interface Inventory {
  id?: number;
  date: string;
  item: 'oranges' | 'bottles_1L' | 'bottles_05L';
  quantityAdded: number;
  quantityUsed: number;
  timestamp: number;
}

export class RamadanJuiceDB extends Dexie {
  sales!: Table<Sale>;
  expenses!: Table<Expense>;
  inventory!: Table<Inventory>;

  constructor() {
    super('RamadanJuiceDB');
    this.version(1).stores({
      sales: '++id, date, timestamp',
      expenses: '++id, date, category, timestamp',
      inventory: '++id, date, item, timestamp'
    });
  }
}

export const db = new RamadanJuiceDB();
