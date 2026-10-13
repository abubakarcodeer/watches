"use client";

import { formatDate, shortId } from "../../lib/admin";
import { formatPrice } from "../../lib/config";
import { formatPkPhone } from "../../data/pakistan";

export default function ShippingLabels({ orders = [] }) {
  if (!orders.length) return null;

  return (
    <div className="shipping-labels-container hidden print:block">
      {orders.map((order, idx) => (
        <div key={order.id} className="label-page p-8 bg-white border-2 border-dashed border-gray-300 mb-8 last:mb-0">
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
            <div>
              <h1 className="font-logo text-4xl font-semibold tracking-tight text-black">WatchShop</h1>
              <p className="text-[10px] text-muted">Quality Organic Cotton Basics</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{shortId(order.id)}</p>
              <p className="text-xs">{formatDate(order.createdAt, true)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2 border-b border-line">Ship To</h3>
              <p className="text-xl font-bold text-black uppercase">{order.customer}</p>
              <p className="text-base leading-snug mt-1">{order.shipping?.address}</p>
              <p className="text-base font-semibold">{order.shipping?.city}, {order.shipping?.province}</p>
              <p className="text-base">{order.shipping?.country}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm font-bold">Phone:</span>
                <span className="text-lg font-bold">{formatPkPhone(order.phone)}</span>
              </div>
            </div>
            <div className="bg-sand p-4 rounded flex flex-col justify-center items-center border border-line">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Payment Method</h3>
              <p className="text-lg font-bold text-forest-deep">{order.paymentMethod}</p>

              <div className="mt-4 text-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Amount to Collect</h3>
                <p className="text-3xl font-black text-black">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2 border-b border-line">Order Contents</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-line">
                  <th className="py-1 font-semibold">Item</th>
                  <th className="py-1 text-center font-semibold">Qty</th>
                  <th className="py-1 text-right font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, i) => (
                  <tr key={i} className="border-b border-line/50">
                    <td className="py-1.5">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-[10px] text-muted">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
                    </td>
                    <td className="py-1.5 text-center">{item.quantity}</td>
                    <td className="py-1.5 text-right">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" className="pt-2 text-right text-muted uppercase text-[10px] font-bold">Subtotal</td>
                  <td className="pt-2 text-right font-medium">{formatPrice(order.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="text-right text-muted uppercase text-[10px] font-bold">Delivery</td>
                  <td className="text-right font-medium">{order.shippingCost ? formatPrice(order.shippingCost) : "Free"}</td>
                </tr>
                <tr className="border-t border-black">
                  <td colSpan="2" className="pt-1 text-right uppercase text-[10px] font-bold">Total</td>
                  <td className="pt-1 text-right font-bold">{formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {order.notes && (
            <div className="mt-4 p-3 bg-sand/50 rounded text-xs border border-line">
              <span className="font-bold uppercase mr-2">Note:</span> {order.notes}
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-line text-[9px] text-muted flex justify-between">
            <p>Printed on {new Date().toLocaleString()}</p>
            <p>watchshop.com</p>
          </div>
        </div>
      ))}
    </div>
  );
}
