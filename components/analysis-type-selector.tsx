'use client'

import { FileText, Home, Building2, Stamp, FileSearch, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ANALYSIS_TYPES, type AnalysisType } from '@/lib/legal-prompts'

const iconMap = {
  Sparkles,
  FileText,
  Home,
  Building2,
  Stamp,
  FileSearch,
}

interface AnalysisTypeSelectorProps {
  selected: AnalysisType
  onSelect: (type: AnalysisType) => void
  disabled?: boolean
}

export function AnalysisTypeSelector({ selected, onSelect, disabled }: AnalysisTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Tipo de Análisis
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ANALYSIS_TYPES.map((type) => {
          const Icon = iconMap[type.icon as keyof typeof iconMap] || FileText
          const isSelected = selected === type.id
          
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              disabled={disabled}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {type.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {type.description}
                </p>
              </div>
              {isSelected && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
