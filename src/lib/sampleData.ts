import { Order } from '@/types/order'

export const sampleOrders: Order[] = [
  {
    id: 'demo_1',
    customerName: 'Alex Johnson',
    orderType: 'delivery',
    status: 'pending',
    total: 42.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    items: [
      { id: 'item_1', name: 'Margherita Pizza', quantity: 2, price: 15.99 },
      { id: 'item_2', name: 'Caesar Salad', quantity: 1, price: 8.99 },
      { id: 'item_3', name: 'Garlic Bread', quantity: 1, price: 5.99 }
    ]
  },
  {
    id: 'demo_2',
    customerName: 'Sarah Chen',
    orderType: 'pickup',
    status: 'preparing',
    total: 28.75,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
    items: [
      { id: 'item_4', name: 'Pepperoni Pizza', quantity: 1, price: 18.99 },
      { id: 'item_5', name: 'Buffalo Wings', quantity: 1, price: 9.76 }
    ]
  },
  {
    id: 'demo_3',
    customerName: 'Mike Rodriguez',
    orderType: 'delivery',
    status: 'ready',
    total: 65.25,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    items: [
      { id: 'item_6', name: 'Supreme Pizza', quantity: 2, price: 22.99 },
      { id: 'item_7', name: 'Chicken Alfredo', quantity: 1, price: 16.99 },
      { id: 'item_8', name: 'Tiramisu', quantity: 2, price: 6.99 }
    ]
  },
  {
    id: 'demo_4',
    customerName: 'Emily Davis',
    orderType: 'pickup',
    status: 'delivered',
    total: 19.99,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
    items: [
      { id: 'item_9', name: 'Hawaiian Pizza', quantity: 1, price: 19.99 }
    ]
  },
  {
    id: 'demo_5',
    customerName: 'James Wilson',
    orderType: 'delivery',
    status: 'pending',
    total: 34.75,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    items: [
      { id: 'item_10', name: 'BBQ Chicken Pizza', quantity: 1, price: 20.99 },
      { id: 'item_11', name: 'Greek Salad', quantity: 1, price: 7.99 },
      { id: 'item_12', name: 'Soda', quantity: 2, price: 2.99 }
    ]
  }
]
