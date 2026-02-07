'use client'

import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-background animate-in slide-in-from-bottom-2',
            toast.variant === 'destructive' && 'border-destructive/50 bg-destructive/10',
            toast.variant === 'success' && 'border-emerald-500/50 bg-emerald-500/10'
          )}
        >
          {toast.variant === 'destructive' && (
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          )}
          {toast.variant === 'success' && (
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          )}
          {!toast.variant && (
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          )}

          <div className="flex-1 space-y-1">
            {toast.title && (
              <p className="text-sm font-semibold">{toast.title}</p>
            )}
            {toast.description && (
              <p className="text-sm text-muted-foreground">{toast.description}</p>
            )}
          </div>

          <button
            onClick={() => dismiss(toast.id)}
            className="shrink-0 rounded-md p-1 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
