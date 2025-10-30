import { useState, useCallback } from "react"

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(({ title, description, variant = "default" }: ToastProps) => {
    // Simple console-based toast for now (you can replace with a proper toast library later)
    if (variant === "destructive") {
      console.error(`[Toast Error] ${title}${description ? `: ${description}` : ""}`)
      alert(`Error: ${title}${description ? `\n${description}` : ""}`)
    } else {
      console.log(`[Toast] ${title}${description ? `: ${description}` : ""}`)
      alert(`${title}${description ? `\n${description}` : ""}`)
    }
  }, [])

  return { toast }
}

