'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  FileText,
  MessageSquare,
  Search,
  BarChart2,
  Settings,
  BrainCircuit,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/sst', label: 'Single Source of Truth', icon: BookOpen, num: '01' },
  { href: '/reports', label: 'Informes', icon: FileText, num: '02' },
  { href: '/feedback', label: 'Feedback', icon: MessageSquare, num: '03' },
  { href: '/sourcing', label: 'Tech Sourcing Hub', icon: Search, num: '04' },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart2, num: '05' },
  { href: '/admin', label: 'Admin', icon: Settings, num: '06' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Recruiting</p>
          <p className="text-xs text-muted-foreground">Intelligence Hub</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span className={cn('text-xs font-mono w-5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground/50')}>
                {item.num}
              </span>
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-border p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
