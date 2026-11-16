import type {
  ProductSize,
  ToppingOption,
} from '../types/cart';

const SIZE_PRICE_ADJUSTMENTS: Record<ProductSize, number> = {
  S: -5000,
  M: 0,
  L: 5000,
};

export function calculateUnitPrice(
  basePrice: number,
  size: ProductSize,
  toppings: readonly ToppingOption[],
): number {
  const sizePrice = Math.max(0, basePrice + SIZE_PRICE_ADJUSTMENTS[size]);
  return sizePrice + toppings.reduce((total, topping) => total + topping.price, 0);
}

export function getCartItemKey(selection: {
  product: { id: string };
  size: ProductSize;
  toppings: readonly ToppingOption[];
}): string {
  const toppingIds = selection.toppings
    .map((topping) => topping.id)
    .sort()
    .join(',');
  return `${selection.product.id}:${selection.size}:${toppingIds}`;
}
