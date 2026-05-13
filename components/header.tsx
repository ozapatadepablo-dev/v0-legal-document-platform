'use client'

import { Scale, FileText } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
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
