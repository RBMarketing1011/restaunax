import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE - Delete account and all associated data
export async function DELETE ()
{
  try
  {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
    {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { account: true }
    })

    if (!user || !user.account)
    {
      return NextResponse.json({ error: 'User or account not found' }, { status: 404 })
    }

    // Check if user is account owner
    if (user.account.ownerId !== user.id)
    {
      return NextResponse.json({ error: 'Only account owners can delete accounts' }, { status: 403 })
    }

    // Delete in the correct order due to foreign key constraints
    // 1. Delete order items (cascade should handle this)
    // 2. Delete orders
    await prisma.order.deleteMany({
      where: { accountId: user.account.id }
    })

    // 3. Remove all users from the account (set accountId to null)
    await prisma.user.updateMany({
      where: { accountId: user.account.id },
      data: { accountId: null }
    })

    // 4. Delete the account
    await prisma.account.delete({
      where: { id: user.account.id }
    })

    // 5. Delete the owner user
    await prisma.user.delete({
      where: { id: user.id }
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error)
  {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
