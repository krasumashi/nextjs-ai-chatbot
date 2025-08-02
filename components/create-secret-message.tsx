'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

interface CreateSecretMessageProps {
  onMessageCreated: (token: string) => void
}

export function CreateSecretMessage({ onMessageCreated }: CreateSecretMessageProps) {
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 1024 * 1024) {
        toast.error('File too large. Maximum size is 1MB.')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() && !file) {
      toast.error('Please enter a message or select a file.')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('message', message)
      if (file) {
        formData.append('file', file)
      }

      const response = await fetch('/api/secret-messages', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to create message')
      }

      const { token } = await response.json()
      onMessageCreated(token)
      
      setMessage('')
      setFile(null)
      
    } catch (error) {
      toast.error('Failed to create secret message.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Create Secret Message</h3>
        <p className="text-sm text-muted-foreground">
          Self-destructs after viewing • Expires in 24h
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Type your secret message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">File (Optional - Max 1MB)</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {file && (
            <p className="text-xs text-muted-foreground">
              ✓ {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || (!message.trim() && !file)}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Create Secret Link
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
