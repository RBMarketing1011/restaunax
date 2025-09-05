import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Update account name
export async function PATCH (request: NextRequest)
{
  try
  {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
    {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name?.trim())
    {
      return NextResponse.json({ error: 'Account name is required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Only account owners can update account name' }, { status: 403 })
    }

    // Update account name
    await prisma.account.update({
      where: { id: user.account.id },
      data: { name: name.trim() }
    })

    return NextResponse.json({ message: 'Account name updated successfully' })
  } catch (error)
  {
    console.error('Account update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
