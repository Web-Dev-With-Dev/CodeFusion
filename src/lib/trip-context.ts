import { createContext, useContext } from 'react';

export interface Item {
  id: string;
  name: string;
  category?: string;
  assignedTo?: string;
  quantity: number;
  isPacked: boolean;
  notes?: string;
}

export interface Person {
  id: string;
  name: string;
  itemCount: number;
  packedCount: number;
}

export interface Trip {
  items: Item[];
  people: Person[];
  categories: string[];
}

export interface TripContextType {
  currentTrip: Trip | null;
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  toggleItemPacked: (id: string) => void;
  addCategory: (category: string) => void;
  addPerson: (person: Person) => void;
}

export const TripContext = createContext<TripContextType | null>(null);

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}; 