export type Item = {
  id: string;
  name: string;
  category: string;
  assignedTo: string;
  isPacked: boolean;
  quantity: number;
  notes?: string;
};

export type Person = {
  id: string;
  name: string;
  itemCount: number;
  packedCount: number;
};

export type Location = {
  name: string;
  description: string;
  mustVisitPlaces: {
    name: string;
    description: string;
    type: 'attraction' | 'restaurant' | 'shopping' | 'nature' | 'culture';
  }[];
  weather: string;
  bestTimeToVisit: string;
  localCuisine: string[];
  transportationTips: string;
};

export type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  people: Person[];
  items: Item[];
  categories: string[];
  transportation: string;
  location?: Location;
};
