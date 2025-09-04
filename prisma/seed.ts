import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleOrders = [
  {
    customerName: 'Alex Johnson',
    orderType: 'delivery' as const,
    status: 'pending' as const,
    total: 42.5,
    items: [
      { name: 'Margherita Pizza', quantity: 2, price: 15.99 },
      { name: 'Caesar Salad', quantity: 1, price: 8.99 },
      { name: 'Garlic Bread', quantity: 1, price: 5.99 }
    ]
  },
  {
    customerName: 'Sarah Chen',
    orderType: 'pickup' as const,
    status: 'preparing' as const,
    total: 28.75,
    items: [
      { name: 'Pepperoni Pizza', quantity: 1, price: 18.99 },
      { name: 'Buffalo Wings', quantity: 1, price: 9.76 }
    ]
  },
  {
    customerName: 'Mike Rodriguez',
    orderType: 'delivery' as const,
    status: 'ready' as const,
    total: 65.25,
    items: [
      { name: 'Supreme Pizza', quantity: 2, price: 22.99 },
      { name: 'Chicken Alfredo', quantity: 1, price: 16.99 },
      { name: 'Tiramisu', quantity: 2, price: 6.99 }
    ]
  },
  {
    customerName: 'Emily Davis',
    orderType: 'pickup' as const,
    status: 'delivered' as const,
    total: 19.99,
    items: [
      { name: 'Hawaiian Pizza', quantity: 1, price: 19.99 }
    ]
  },
  {
    customerName: 'James Wilson',
    orderType: 'delivery' as const,
    status: 'pending' as const,
    total: 34.75,
    items: [
      { name: 'BBQ Chicken Pizza', quantity: 1, price: 20.99 },
      { name: 'Greek Salad', quantity: 1, price: 7.99 },
      { name: 'Soda', quantity: 2, price: 2.99 }
    ]
  },
  {
    customerName: 'Lisa Thompson',
    orderType: 'pickup' as const,
    status: 'preparing' as const,
    total: 45.50,
    items: [
      { name: 'Meat Lovers Pizza', quantity: 1, price: 24.99 },
      { name: 'Mozzarella Sticks', quantity: 1, price: 8.99 },
      { name: 'Chocolate Cake', quantity: 1, price: 11.52 }
    ]
  },
  {
    customerName: 'David Brown',
    orderType: 'delivery' as const,
    status: 'ready' as const,
    total: 52.25,
    items: [
      { name: 'Veggie Pizza', quantity: 2, price: 17.99 },
      { name: 'Spinach Salad', quantity: 1, price: 9.99 },
      { name: 'Garlic Knots', quantity: 1, price: 6.28 }
    ]
  },
  {
    customerName: 'Jennifer Martinez',
    orderType: 'pickup' as const,
    status: 'pending' as const,
    total: 31.75,
    items: [
      { name: 'White Pizza', quantity: 1, price: 21.99 },
      { name: 'Breadsticks', quantity: 1, price: 4.99 },
      { name: 'Iced Tea', quantity: 2, price: 2.49 }
    ]
  },
  {
    customerName: 'Robert Garcia',
    orderType: 'delivery' as const,
    status: 'preparing' as const,
    total: 39.99,
    items: [
      { name: 'Four Cheese Pizza', quantity: 1, price: 19.99 },
      { name: 'Chicken Wings', quantity: 12, price: 15.99 },
      { name: 'Coleslaw', quantity: 1, price: 4.01 }
    ]
  },
  {
    customerName: 'Amanda Lee',
    orderType: 'pickup' as const,
    status: 'ready' as const,
    total: 27.50,
    items: [
      { name: 'Sicilian Pizza', quantity: 1, price: 23.99 },
      { name: 'Marinara Sauce', quantity: 1, price: 3.51 }
    ]
  },
  {
    customerName: 'Kevin Taylor',
    orderType: 'delivery' as const,
    status: 'delivered' as const,
    total: 58.75,
    items: [
      { name: 'Deluxe Pizza', quantity: 2, price: 21.99 },
      { name: 'Antipasto Salad', quantity: 1, price: 12.99 },
      { name: 'Cannoli', quantity: 2, price: 4.99 }
    ]
  },
  {
    customerName: 'Michelle White',
    orderType: 'pickup' as const,
    status: 'pending' as const,
    total: 41.25,
    items: [
      { name: 'Mushroom Pizza', quantity: 1, price: 18.99 },
      { name: 'Calzone', quantity: 1, price: 13.99 },
      { name: 'Gelato', quantity: 2, price: 4.99 }
    ]
  },
  {
    customerName: 'Christopher Anderson',
    orderType: 'delivery' as const,
    status: 'preparing' as const,
    total: 33.50,
    items: [
      { name: 'Pesto Pizza', quantity: 1, price: 20.99 },
      { name: 'Caprese Salad', quantity: 1, price: 8.99 },
      { name: 'Lemonade', quantity: 2, price: 2.49 }
    ]
  },
  {
    customerName: 'Nicole Thomas',
    orderType: 'pickup' as const,
    status: 'ready' as const,
    total: 25.99,
    items: [
      { name: 'Gluten-Free Pizza', quantity: 1, price: 22.99 },
      { name: 'Side Salad', quantity: 1, price: 3.00 }
    ]
  },
  {
    customerName: 'Daniel Jackson',
    orderType: 'delivery' as const,
    status: 'pending' as const,
    total: 47.75,
    items: [
      { name: 'Seafood Pizza', quantity: 1, price: 26.99 },
      { name: 'Shrimp Scampi', quantity: 1, price: 18.99 },
      { name: 'Garlic Bread', quantity: 1, price: 1.77 }
    ]
  }
]

async function main ()
{
  console.log('Start seeding...')

  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()

  // Get the first account to associate orders with
  const account = await prisma.account.findFirst()

  if (!account)
  {
    console.log('No accounts found. Please create an account first by registering a user.')
    return
  }

  console.log(`Seeding orders for account: ${ account.id }`)

  // Create orders with items
  for (const orderData of sampleOrders)
  {
    await prisma.order.create({
      data: {
        customerName: orderData.customerName,
        orderType: orderData.orderType,
        status: orderData.status,
        total: orderData.total,
        accountId: account.id,
        items: {
          create: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) =>
  {
    console.error(e)
    process.exit(1)
  })
  .finally(async () =>
  {
    await prisma.$disconnect()
  })
