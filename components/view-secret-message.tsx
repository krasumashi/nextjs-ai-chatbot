'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Download, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface ViewSecretMessageProps {
  token: string
  onBack: () => void
}

interface SecretMessageData {
  content: string
  fileName?: string
  fileContent?: string
  expiresAt: string
}

export function ViewSecretMessage({ token, onBack }: ViewSecretMessageProps) {
  const [messageData, setMessageData] = useState<SecretMessageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isViewed, setIsViewed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch(`/api/secret-messages/${token}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Message not found')
          }
          if (response.status === 410) {
            throw new Error('Message has expired or already been viewed')
          }
          throw new Error('Failed to load message')
        }

        const data = await response.json()
        setMessageData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchMessage()
    }
  }, [token])

  const handleViewMessage = async () => {
    if (!messageData || isViewed) return

    try {
      const response = await fetch(`/api/secret-messages/${token}`, {
        method: 'POST',
      })

      if (response.ok) {
        setIsViewed(true)
        setShowMessage(true)
        toast.success('Message will be destroyed in 30 seconds')
      }
    } catch (error) {
      toast.error('Failed to mark message as viewed')
    }
  }

  const handleDownloadFile = () => {
    if (!messageData?.fileContent || !messageData?.fileName) return

    const blob = new Blob([messageData.fileContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = messageData.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading message...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Button variant="outline" onClick={onBack} className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    )
  }

  if (!messageData) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Message Not Found</h3>
              <p className="text-sm text-muted-foreground">This message may have expired or been deleted.</p>
            </div>
          </CardContent>
        </Card>
        <Button variant="outline" onClick={onBack} className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Secret Message</h3>
        <p className="text-sm text-muted-foreground">
          ⚠️ This message will self-destruct after viewing
        </p>
      </div>

      {!showMessage ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Once you view this message, it will be permanently deleted.
                </p>
              </div>
              
              <Button onClick={handleViewMessage} className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Secret Message
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {messageData.content && (
              <div>
                <h4 className="font-medium mb-2">Message:</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{messageData.content}</p>
                </div>
              </div>
            )}
            
            {messageData.fileName && messageData.fileContent && (
              <div>
                <h4 className="font-medium mb-2">Attached File:</h4>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{messageData.fileName}</span>
                  <Button size="sm" variant="outline" onClick={handleDownloadFile}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
            
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                🔥 This message has been viewed and will be destroyed in 30 seconds
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" onClick={onBack} className="w-full">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    </div>
  )
}
