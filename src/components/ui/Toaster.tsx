"use client"
import { useState, createContext, useContext, useCallback } from "react"

type Toast = { id: string; message: string; type?: "success" | "error" | "info" }
const ToastContext = createContext<{ show: (msg: string, type?: Toast["type"]) => void }>({ show: () => {} })

export function useToast() { return useContext(ToastContext) }

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={"px-5 py-3 rounded-sm text-sm font-semibold shadow-lg animate-slide-up " +
            (t.type === "error" ? "bg-danger text-white" : t.type === "info" ? "bg-accent text-white" : "bg-success text-white")}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
