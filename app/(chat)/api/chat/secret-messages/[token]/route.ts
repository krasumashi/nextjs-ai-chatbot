import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/utils'
import { secretMessage } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface Params {
  token: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { token } = params

    const [message] = await db
      .select()
      .from(secretMessage)
      .where(eq(secretMessage.token, token))
      .limit(1)

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    if (new Date() > message.expiresAt) {
      await db.delete(secretMessage).where(eq(secretMessage.token, token))
      return NextResponse.json(
        { error: 'Message has expired' },
        { status: 410 }
      )
    }

    if (message.viewed) {
      return NextResponse.json(
        { error: 'Message has already been viewed' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      content: message.content,
      fileName: message.fileName,
      fileContent: message.fileContent,
      expiresAt: message.expiresAt.toISOString(),
    })

  } catch (error) {
    console.error('Error retrieving message:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve message' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { token } = params

    await db
      .update(secretMessage)
      .set({ 
        viewed: true,
        viewedAt: new Date()
      })
      .where(eq(secretMessage.token, token))

    setTimeout(async () => {
      try {
        await db.delete(secretMessage).where(eq(secretMessage.token, token))
      } catch (error) {
        console.error('Error deleting message:', error)
      }
    }, 30000)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error marking message as viewed:', error)
    return NextResponse.json(
      { error: 'Failed to mark message as viewed' },
      { status: 500 }
    )
  }
}
