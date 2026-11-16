'use client';

import Image from 'next/image';
import { useState } from 'react';
import { calculateUnitPrice } from '../lib/cart';
import { formatVND } from '../lib/api';
import type {
  CartItemSelection,
  ProductSize,
  ToppingOption,
} from '../types/cart';
import { TOPPING_OPTIONS } from '../types/cart';
import type { Product } from '../types/product';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (selection: CartItemSelection) => void;
}

const SIZES: { size: ProductSize; label: string; adjustment: number }[] = [
  { size: 'S', label: 'Nhỏ', adjustment: -5000 },
  { size: 'M', label: 'Vừa · giá gốc', adjustment: 0 },
  { size: 'L', label: 'Lớn', adjustment: 5000 },
];

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [size, setSize] = useState<ProductSize>('M');
  const [toppings, setToppings] = useState<ToppingOption[]>([]);
  const [quantity, setQuantity] = useState(1);
  const availableToppings =
    product.category === 'Bánh ngọt' ? [] : TOPPING_OPTIONS;
  const unitPrice = calculateUnitPrice(product.price, size, toppings);

  const toggleTopping = (topping: ToppingOption) => {
    setToppings((selected) =>
      selected.some((item) => item.id === topping.id)
        ? selected.filter((item) => item.id !== topping.id)
        : [...selected, topping],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng cửa sổ tùy chỉnh"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-heading"
        className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Chi tiết và tùy chọn sản phẩm
            </p>
            <h2
              id="product-detail-heading"
              className="mt-1 text-xl font-black text-[#382218] sm:text-2xl"
            >
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4 rounded-2xl bg-stone-50 p-3">
          <Image
            src={product.imageUrl}
            alt=""
            width={80}
            height={80}
            unoptimized
            className="h-20 w-20 rounded-xl object-contain"
          />
          <div>
            {product.description && (
              <p className="text-sm text-stone-600">{product.description}</p>
            )}
            <p className="mt-1 text-sm font-bold text-[#382218]">
              Giá gốc: {formatVND(product.price)} · Size M
            </p>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-bold text-stone-900">
            Chọn kích cỡ
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((option) => (
              <label
                key={option.size}
                className={`cursor-pointer rounded-xl border p-3 text-center transition-colors ${
                  size === option.size
                    ? 'border-amber-700 bg-amber-50 text-[#382218]'
                    : 'border-stone-200 hover:border-amber-400'
                }`}
              >
                <input
                  type="radio"
                  name="product-size"
                  value={option.size}
                  checked={size === option.size}
                  onChange={() => setSize(option.size)}
                  className="sr-only"
                  aria-label={`Size ${option.size}`}
                />
                <span className="block font-bold">Size {option.size}</span>
                <span className="mt-1 block text-xs text-stone-500">
                  {option.adjustment === 0
                    ? option.label
                    : `${option.label} (${option.adjustment > 0 ? '+' : '−'}${formatVND(Math.abs(option.adjustment))})`}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-bold text-stone-900">
            Topping
          </legend>
          {availableToppings.length > 0 ? (
            <div className="space-y-2">
              {availableToppings.map((topping) => (
                <label
                  key={topping.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 px-3 py-2.5 hover:border-amber-400"
                >
                  <span className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={toppings.some((item) => item.id === topping.id)}
                      onChange={() => toggleTopping(topping)}
                      className="h-4 w-4 accent-amber-800"
                    />
                    {topping.name}
                  </span>
                  <span className="text-sm font-semibold text-stone-600">
                    +{formatVND(topping.price)}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-stone-50 px-3 py-3 text-sm text-stone-500">
              Món bánh không có tùy chọn topping.
            </p>
          )}
        </fieldset>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-stone-100 pt-5">
          <div>
            <p className="text-xs text-stone-500">Tổng cộng</p>
            <p className="text-xl font-black text-[#382218]" aria-live="polite">
              {formatVND(unitPrice * quantity)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-stone-200">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                aria-label="Giảm số lượng"
                className="h-10 w-10 rounded-l-full text-lg hover:bg-stone-100"
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm font-bold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                aria-label="Tăng số lượng"
                className="h-10 w-10 rounded-r-full text-lg hover:bg-stone-100"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                onAddToCart({ product, size, toppings, quantity })
              }
              className="rounded-full bg-[#382218] px-5 py-3 text-sm font-bold text-white hover:bg-[#4a2e21]"
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
