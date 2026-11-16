'use client';

import Image from 'next/image';
import { formatVND } from '../lib/api';
import { useCart } from '../context/CartContext';

interface CartPanelProps {
  onClose: () => void;
}

export default function CartPanel({ onClose }: CartPanelProps) {
  const { items, total, updateQuantity, removeItem } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Đóng giỏ hàng"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-heading"
        className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <h2
              id="cart-heading"
              className="text-xl font-black text-[#382218]"
            >
              Giỏ hàng
            </h2>
            <p className="text-sm text-stone-500">
              {items.reduce((count, item) => count + item.quantity, 0)} món
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
          >
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="text-5xl" aria-hidden="true">
              ☕
            </span>
            <p className="mt-4 font-bold text-stone-800">Giỏ hàng đang trống</p>
            <p className="mt-1 text-sm text-stone-500">
              Hãy chọn món yêu thích từ thực đơn nhé.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full bg-[#382218] px-5 py-2.5 text-sm font-bold text-white"
            >
              Tiếp tục chọn món
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex gap-3 border-b border-stone-100 pb-4"
                >
                  <Image
                    src={item.product.imageUrl}
                    alt=""
                    width={72}
                    height={72}
                    unoptimized
                    className="h-[72px] w-[72px] rounded-xl bg-stone-50 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-stone-900">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-stone-500">
                          Size {item.size}
                          {item.toppings.length > 0 &&
                            ` · ${item.toppings.map((topping) => topping.name).join(', ')}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Xóa ${item.product.name} khỏi giỏ`}
                        className="text-xs font-semibold text-rose-700 hover:text-rose-900"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-stone-200">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          aria-label={`Giảm số lượng ${item.product.name}`}
                          className="h-8 w-8 rounded-l-full hover:bg-stone-100"
                        >
                          −
                        </button>
                        <span className="min-w-7 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                          aria-label={`Tăng số lượng ${item.product.name}`}
                          className="h-8 w-8 rounded-r-full hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-[#382218]">
                        {formatVND(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-stone-200 bg-stone-50 p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700">Tổng tiền</span>
                <span className="text-xl font-black text-[#382218]">
                  {formatVND(total)}
                </span>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                Kiểm tra đơn hàng và cập nhật số lượng trước khi tiếp tục.
              </p>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
