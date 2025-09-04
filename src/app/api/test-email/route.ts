import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'

export async function POST (request: NextRequest)
{
  try
  {
    const { email } = await request.json()

    if (!email)
    {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Send test verification email
    const result = await sendVerificationEmail(email, 'test-token-123')

    if (result.success)
    {
      return NextResponse.json(
        { message: 'Test email sent successfully' },
        { status: 200 }
      )
    } else
    {
      return NextResponse.json(
        { message: 'Failed to send test email', error: result.error },
        { status: 500 }
      )
    }

  } catch (error)
  {
    console.error('Test email error:', error)
    return NextResponse.json(
      { message: 'Internal server error', error },
      { status: 500 }
    )
  }
}
