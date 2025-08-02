import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db/utils'
import { secretMessage } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const message = formData.get('message') as string
    const file = formData.get('file') as File | null

    if (!message?.trim() && !file) {
      return NextResponse.json(
        { error: 'Message or file is required' },
        { status: 400 }
      )
    }

    let fileContent = ''
    let fileName = ''

    if (file) {
      fileName = file.name
      fileContent = await file.text()
    }

    const token = nanoid(16)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.insert(secretMessage).values({
      token,
      content: message || '',
      fileName: fileName || null,
      fileContent: fileContent || null,
      expiresAt,
      viewed: false,
    })

    return NextResponse.json({ token })
    
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
