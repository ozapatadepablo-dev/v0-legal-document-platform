'use client'

import { FileText } from 'lucide-react'
import Image from 'next/image'

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bTlNtZ9dAfyfo1OltAYfNo00kY96B6.png"
              alt="LexOZ Logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <h1 className="text-lg font-semibold text-foreground">LexOZ</h1>
              <p className="text-xs text-muted-foreground">Análisis Legal</p>
            </div>
          </div>
          
          <nav className="hidden items-center gap-6 md:flex">
            <a 
              href="#" 
              className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <FileText className="h-4 w-4" />
              Documentos
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
