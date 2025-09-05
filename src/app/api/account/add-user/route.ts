import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Add user to account
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
    const { email } = body

    if (!email?.trim())
    {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Only account owners can add users' }, { status: 403 })
    }

    // Check if user already exists
    const targetUser = await prisma.user.findUnique({
      where: { email: email.trim() }
    })

    if (!targetUser)
    {
      return NextResponse.json({ error: 'User with this email does not exist' }, { status: 404 })
    }

    // Check if user is already in an account
    if (targetUser.accountId)
    {
      return NextResponse.json({ error: 'User is already part of an account' }, { status: 400 })
    }

    // Add user to account
    await prisma.user.update({
      where: { id: targetUser.id },
      data: { accountId: currentUser.account.id }
    })

    return NextResponse.json({ message: 'User added to account successfully' })
  } catch (error)
  {
    console.error('Add user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
