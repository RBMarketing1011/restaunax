import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Remove user from account
export async function POST (request: NextRequest)
{
  try
  {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
    {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId)
    {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { account: true }
    })

    if (!currentUser || !currentUser.account)
    {
      return NextResponse.json({ error: 'User or account not found' }, { status: 404 })
    }

    // Check if user is account owner
    if (currentUser.account.ownerId !== currentUser.id)
    {
      return NextResponse.json({ error: 'Only account owners can remove users' }, { status: 403 })
    }

    // Check if trying to remove themselves
    if (userId === currentUser.id)
    {
      return NextResponse.json({ error: 'Account owners cannot remove themselves' }, { status: 400 })
    }

    // Check if target user exists and is in the same account
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser)
    {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.accountId !== currentUser.account.id)
    {
      return NextResponse.json({ error: 'User is not part of your account' }, { status: 400 })
    }

    // Remove user from account
    await prisma.user.update({
      where: { id: userId },
      data: { accountId: null }
    })

    return NextResponse.json({ message: 'User removed from account successfully' })
  } catch (error)
  {
    console.error('Remove user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
