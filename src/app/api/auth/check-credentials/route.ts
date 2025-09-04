import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST (request: NextRequest)
{
  try
  {
    const { email, password } = await request.json()

    if (!email || !password)
    {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user)
    {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid)
    {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Credentials are correct, check email verification
    if (!user.emailVerified)
    {
      return NextResponse.json(
        { error: 'Please verify your email address before signing in. Check your email inbox for the verification link.' },
        { status: 403 }
      )
    }

    // All good - credentials correct and email verified
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )

  } catch (error)
  {
    console.error('Credential check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
