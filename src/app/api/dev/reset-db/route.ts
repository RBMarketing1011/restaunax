import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Sample orders for seeding database
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
    total: 35.98,
    items: [
      { name: 'Meat Lovers Pizza', quantity: 1, price: 24.99 },
      { name: 'Mozzarella Sticks', quantity: 1, price: 10.99 }
    ]
  },
  {
    customerName: 'Lisa Thompson',
    orderType: 'pickup' as const,
    status: 'preparing' as const,
    total: 31.47,
    items: [
      { name: 'Veggie Pizza', quantity: 1, price: 17.99 },
      { name: 'Greek Salad', quantity: 1, price: 11.99 },
      { name: 'Breadsticks', quantity: 1, price: 1.49 }
    ]
  },
  {
    customerName: 'Robert Brown',
    orderType: 'delivery' as const,
    status: 'ready' as const,
    total: 58.96,
    items: [
      { name: 'BBQ Chicken Pizza', quantity: 2, price: 21.99 },
      { name: 'Chicken Wings', quantity: 1, price: 14.98 }
    ]
  },
  {
    customerName: 'Jennifer Lee',
    orderType: 'pickup' as const,
    status: 'delivered' as const,
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

export async function GET (request: NextRequest)
{
  try
  {
    // Only allow this in development
    if (process.env.NODE_ENV === 'production')
    {
      return NextResponse.json(
        { message: 'Database reset is not allowed in production' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    console.log('Starting database reset and reseed...')

    if (accountId)
    {
      // Seed specific account with orders
      console.log(`Seeding account ${ accountId } with orders...`)

      // Verify account exists
      const account = await prisma.account.findUnique({
        where: { id: accountId }
      })

      if (!account)
      {
        return NextResponse.json(
          { message: 'Account not found', accountId },
          { status: 404 }
        )
      }

      // Clear existing orders for this account
      await prisma.orderItem.deleteMany({
        where: {
          order: {
            accountId: accountId
          }
        }
      })

      await prisma.order.deleteMany({
        where: { accountId: accountId }
      })

      // Create orders for this account
      for (const orderData of sampleOrders)
      {
        await prisma.order.create({
          data: {
            customerName: orderData.customerName,
            orderType: orderData.orderType,
            status: orderData.status,
            total: orderData.total,
            accountId: accountId,
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

      console.log(`Account ${ accountId } seeded successfully`)

      return NextResponse.json(
        {
          message: `Account seeded successfully`,
          accountId: accountId,
          ordersCreated: sampleOrders.length,
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )

    } else
    {
      // Clear entire database only
      console.log('Clearing entire database...')

      // Clear all data in the correct order (respecting foreign key constraints)
      await prisma.verificationToken.deleteMany({})
      await prisma.orderItem.deleteMany({})
      await prisma.order.deleteMany({})
      await prisma.account.deleteMany({})
      await prisma.user.deleteMany({})

      console.log('Database cleared successfully')

      return NextResponse.json(
        {
          message: 'Database cleared successfully',
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )
    }

  } catch (error)
  {
    console.error('Database reset and reseed error:', error)
    return NextResponse.json(
      {
        message: 'Failed to reset and reseed database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
