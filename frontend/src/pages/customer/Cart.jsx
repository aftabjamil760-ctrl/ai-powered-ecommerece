import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiArrowRight, FiTag } from 'react-icons/fi';
import { getCart, updateCartQuantity, removeFromCart } from '../../utils/cartService';

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const handleQuantity = (id, delta) => {
    const updated = updateCartQuantity(id, items.find((item) => item.id === id).quantity + delta);
    setItems(updated);
  };

  const handleRemove = (id) => {
    const updated = removeFromCart(id);
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 75 || subtotal === 0 ? 0 : 8;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-white py-14 shadow-sm shadow-slate-200/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-primary">Cart</p>
          <h1 className="text-4xl font-bold tracking-tight">Your shopping bag</h1>
          <p className="mt-3 text-slate-600">Review your items, update quantities, and continue to checkout.</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="text-lg font-semibold text-slate-900">Your cart is empty</p>
                <p className="mt-3 text-sm text-slate-500">Add products to the cart to start checkout.</p>
                <Link to="/products" className="mt-6 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <img src={item.image} alt={item.name} className="h-28 w-28 rounded-3xl object-cover" />
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.category}</p>
                      <h2 className="mt-2 text-lg font-semibold text-slate-950">{item.name}</h2>
                      <p className="mt-2 text-sm text-slate-500">${item.price.toFixed(2)} each</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                          <button onClick={() => handleQuantity(item.id, -1)} className="px-2 text-slate-500 hover:text-slate-900">-</button>
                          <span className="px-3 font-medium">{item.quantity}</span>
                          <button onClick={() => handleQuantity(item.id, 1)} className="px-2 text-slate-500 hover:text-slate-900">+</button>
                        </div>
                        <button onClick={() => handleRemove(item.id)} className="text-sm font-semibold text-rose-500 hover:text-rose-600">
                          <FiTrash2 className="inline-block mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <span className="text-lg font-semibold text-slate-950">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => navigate(`/product/${item.id}`)} className="text-sm font-semibold text-primary hover:text-primary/80">
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-950">Order summary</h2>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-4 font-semibold text-slate-950">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              disabled={items.length === 0}
              onClick={() => navigate('/checkout', { state: { product: items[0] } })}
              className="mt-8 w-full rounded-full bg-foreground px-5 py-4 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Checkout
            </button>
            <p className="mt-4 text-xs text-slate-500">You can checkout with the first item now and complete the rest later.</p>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Cart;
