import type { Product } from './product';

export type ProductSize = 'S' | 'M' | 'L';

export interface ToppingOption {
  id: string;
  name: string;
  price: number;
}

export const TOPPING_OPTIONS: readonly ToppingOption[] = [
  { id: 'white-pearls', name: 'Trân châu trắng', price: 5000 },
  { id: 'coffee-jelly', name: 'Thạch cà phê', price: 5000 },
  { id: 'espresso-shot', name: 'Shot espresso', price: 10000 },
  { id: 'cheese-foam', name: 'Kem cheese', price: 10000 },
];

export interface CartItemSelection {
  product: Product;
  size: ProductSize;
  toppings: ToppingOption[];
  quantity: number;
}

export interface CartItem extends CartItemSelection {
  key: string;
  unitPrice: number;
}
