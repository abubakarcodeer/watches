import { SEED_PRODUCTS } from "./products";

// Sample database for demo mode (no Firebase connected). Everything here is made up.
export const DEMO_ADMIN_UID = "demo-admin";

const daysAgo = (days, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
};

const CUSTOMERS = [
  { firstName: "Ayesha", lastName: "Khan", city: "Lahore", province: "Punjab", phone: "+923001234501" },
  { firstName: "Bilal", lastName: "Ahmed", city: "Karachi", province: "Sindh", phone: "+923001234502" },
  { firstName: "Sara", lastName: "Malik", city: "Islamabad", province: "Islamabad Capital Territory", phone: "+923001234503" },
  { firstName: "Usman", lastName: "Tariq", city: "Faisalabad", province: "Punjab", phone: "+923001234504" },
  { firstName: "Hina", lastName: "Raza", city: "Peshawar", province: "Khyber Pakhtunkhwa", phone: "+923001234505" },
];

// [customer index, days ago, status, [[product id, quantity], ...]]
const ORDERS = [
  [0, 0, "Pending", [["ws-tissot-prx", 1]]],
  [1, 1, "Pending", [["ws-casio-g-shock", 2], ["ws-nato-strap", 1]]],
  [2, 2, "Confirmed", [["ws-omega-seamaster", 1]]],
  [3, 3, "Shipped", [["ws-seiko-prospex-diver", 1]]],
  [4, 4, "Delivered", [["ws-michael-kors-parker", 1], ["ws-leather-watch-box", 1]]],
  [0, 6, "Delivered", [["ws-citizen-eco-drive", 1]]],
  [1, 8, "Cancelled", [["ws-apple-watch-sport", 1]]],
  [2, 9, "Delivered", [["ws-rolex-datejust-41", 1]]],
  [3, 11, "Delivered", [["ws-fossil-grant-chronograph", 1], ["ws-daniel-wellington-classic", 1]]],
];

const email = (c) => `${c.firstName}.${c.lastName}@example.com`.toLowerCase();

const lineItems = (lines) =>
  lines.map(([id, quantity]) => {
    const p = SEED_PRODUCTS.find((product) => product.id === id);
    return { id, title: p.title, price: p.price, size: p.sizes?.[0] || "", color: p.colors?.[0]?.name || "", quantity, image: p.image };
  });

const contact = (c) => ({
  customer: `${c.firstName} ${c.lastName}`,
  email: email(c),
  phone: c.phone,
  shipping: { firstName: c.firstName, lastName: c.lastName, phone: c.phone, address: "House 12, Street 4, Block B", city: c.city, province: c.province, postalCode: "54000", country: "Pakistan" },
});

export function demoSeed() {
  const products = Object.fromEntries(
    SEED_PRODUCTS.map((p, i) => [
      p.id,
      // A couple of low-stock and sold-out items so the dashboard warnings have something to show.
      { ...p, isActive: true, stock: i === 2 ? 3 : i === 13 ? 0 : 25, createdAt: daysAgo(40 - i), updatedAt: daysAgo(20 - Math.min(i, 19)) },
    ])
  );

  const orders = Object.fromEntries(
    ORDERS.map(([customer, days, status, lines], i) => {
      const items = lineItems(lines);
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingCost = subtotal >= 200 ? 0 : 15;
      return [
        `demoOrder${String(i + 1).padStart(4, "0")}`,
        {
          ...contact(CUSTOMERS[customer]),
          notes: "",
          items,
          subtotal,
          shippingCost,
          total: subtotal + shippingCost,
          paymentMethod: "Cash on Delivery",
          status,
          userId: null,
          createdAt: daysAgo(days, 10 + (i % 8)),
        },
      ];
    })
  );

  const abandoned = lineItems([["ws-samsung-galaxy-watch", 1]]);

  return {
    products,
    orders,
    checkouts: {
      demoCheckout0001: { ...contact(CUSTOMERS[4]), items: abandoned, total: abandoned[0].price, createdAt: daysAgo(1, 19), updatedAt: daysAgo(1, 19) },
    },
    subscribers: Object.fromEntries(CUSTOMERS.slice(0, 4).map((c, i) => [`demoSubscriber${i + 1}`, { email: email(c), createdAt: daysAgo(i * 3 + 1) }])),
    users: {
      [DEMO_ADMIN_UID]: { uid: DEMO_ADMIN_UID, email: "", firstName: "Demo", lastName: "Admin", role: "admin", createdAt: daysAgo(60) },
      ...Object.fromEntries(
        CUSTOMERS.slice(0, 3).map((c, i) => [`demoCustomer${i + 1}`, { uid: `demoCustomer${i + 1}`, email: email(c), firstName: c.firstName, lastName: c.lastName, role: "customer", createdAt: daysAgo(30 - i * 7) }])
      ),
    },
  };
}
