'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Copy, Check, Share } from 'lucide-react'
import { toast } from 'sonner'

interface SecretMessageStatusProps {
  token: string
  onBackToCreate: () => void
}

export function SecretMessageStatus({ token, onBackToCreate }: SecretMessageStatusProps) {
  const [copied, setCopied] = useState(false)
  
  const secretUrl = `${window.location.origin}${window.location.pathname}?token=${token}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(secretUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Secret Message',
          text: 'I have a secret message for you',
          url: secretUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Secret Message Created!</h3>
        <p className="text-sm text-muted-foreground">
          Share this link to send your secret message
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secret-url">Secret Link</Label>
            <div className="flex gap-2">
              <Input
                id="secret-url"
                value={secretUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleShare} className="flex-1">
              <Share className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button variant="outline" onClick={handleCopyLink} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Important:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Message expires in 24 hours</li>
              <li>• Self-destructs after being viewed once</li>
              <li>• Link will become invalid after viewing</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={onBackToCreate} className="w-full">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Create Another Message
      </Button>
    </div>
  )
}
