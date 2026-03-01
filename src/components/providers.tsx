import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>
  )
}
