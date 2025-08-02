'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Shield, X } from 'lucide-react'
import { CreateSecretMessage } from './create-secret-message'
import { ViewSecretMessage } from './view-secret-message'
import { SecretMessageStatus } from './secret-message-status'

interface SecretDropModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SecretDropModal({ open, onOpenChange }: SecretDropModalProps) {
  const [currentView, setCurrentView] = useState<'create' | 'view' | 'status'>('create')
  const [messageToken, setMessageToken] = useState<string>('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token && open) {
      setMessageToken(token)
      setCurrentView('view')
    }
  }, [searchParams, open])

  const handleMessageCreated = (token: string) => {
    setMessageToken(token)
    setCurrentView('status')
  }

  const handleBackToCreate = () => {
    setCurrentView('create')
    setMessageToken('')
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setCurrentView('create')
      setMessageToken('')
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            SecretDrop
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          {currentView === 'create' && (
            <CreateSecretMessage onMessageCreated={handleMessageCreated} />
          )}
          
          {currentView === 'view' && (
            <ViewSecretMessage 
              token={messageToken} 
              onBack={handleBackToCreate}
            />
          )}
          
          {currentView === 'status' && (
            <SecretMessageStatus 
              token={messageToken}
              onBackToCreate={handleBackToCreate}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
