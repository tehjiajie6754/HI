'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, Check, Loader2, Sparkles, MapPin, CloudSun,
  UserCircle2, ScanSearch, AlertTriangle, ListTree,
} from 'lucide-react'

export type ReasoningStatus = 'pending' | 'active' | 'done' | 'warn'

export type ReasoningKind =
  | 'profile' | 'cross-ref' | 'ambiguity'
  | 'maps' | 'weather' | 'compose'

export interface ReasoningStep {
  id: string
  kind: ReasoningKind
  title: string
  status: ReasoningStatus
  // Optional structured detail lines rendered under the step.
  details?: string[]
  // Optional "tool call" chip — e.g. an API endpoint or function name.
  toolCall?: string
}

const KIND_ICON: Record<ReasoningKind, React.ReactNode> = {
  'profile':    <UserCircle2 className="w-3.5 h-3.5" />,
  'cross-ref':  <ScanSearch className="w-3.5 h-3.5" />,
  'ambiguity':  <AlertTriangle className="w-3.5 h-3.5" />,
  'maps':       <MapPin className="w-3.5 h-3.5" />,
  'weather':    <CloudSun className="w-3.5 h-3.5" />,
  'compose':    <ListTree className="w-3.5 h-3.5" />,
}

function StatusDot({ status }: { status: ReasoningStatus }) {
  if (status === 'done') {
    return (
      <div className="w-5 h-5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/40 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-[#C9A84C]" strokeWidth={3} />
      </div>
    )
  }
  if (status === 'active') {
    return (
      <div className="w-5 h-5 rounded-full bg-[#1A1A2E] flex items-center justify-center shrink-0 ring-2 ring-[#C9A84C]/30">
        <Loader2 className="w-3 h-3 text-[#C9A84C] animate-spin" />
      </div>
    )
  }
  if (status === 'warn') {
    return (
      <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
      </div>
    )
  }
  return (
    <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 flex items-center justify-center shrink-0">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
    </div>
  )
}

export default function ReasoningPanel({
  steps,
  isComplete,
  defaultOpen = true,
}: {
  steps: ReasoningStep[]
  isComplete: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  const activeOrLast = steps.find(s => s.status === 'active') || steps[steps.length - 1]
  const summary = isComplete
    ? `Reasoned through ${steps.length} steps`
    : (activeOrLast?.title || 'Thinking…')

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/70 transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1A1A2E] to-[#2a2a4e] flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C9A84C]">
              {isComplete ? 'Reasoning' : 'Thinking'}
            </span>
            {!isComplete && (
              <span className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-[#C9A84C] animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-[#C9A84C] animate-pulse" style={{ animationDelay: '0.15s' }} />
                <span className="w-1 h-1 rounded-full bg-[#C9A84C] animate-pulse" style={{ animationDelay: '0.3s' }} />
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 truncate mt-0.5 font-medium">
            {summary}
          </p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      {/* Steps */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-gray-100 bg-[#FAFAFA]"
          >
            <ol className="px-4 py-4 space-y-3 relative">
              {/* Vertical thread line */}
              <div className="absolute left-[26px] top-7 bottom-7 w-px bg-gradient-to-b from-[#C9A84C]/40 via-gray-200 to-transparent" />

              {steps.map((step, idx) => (
                <motion.li
                  key={step.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="relative flex gap-3"
                >
                  <StatusDot status={step.status} />
                  <div className="flex-1 min-w-0 pb-1">
                    {/* Title row */}
                    <div className="flex items-start flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        step.status === 'warn'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : step.status === 'done'
                            ? 'bg-[#C9A84C]/10 text-[#A68A3D] border border-[#C9A84C]/30'
                            : step.status === 'active'
                              ? 'bg-[#1A1A2E] text-[#C9A84C]'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        {KIND_ICON[step.kind]}
                        <span>{step.kind === 'cross-ref' ? 'cross-ref' : step.kind}</span>
                      </span>
                      <span className={`text-sm font-semibold leading-snug ${
                        step.status === 'pending' ? 'text-gray-400' : 'text-[#1A1A2E]'
                      }`}>
                        {step.title}
                      </span>
                    </div>

                    {/* Tool call chip */}
                    {step.toolCall && step.status !== 'pending' && (
                      <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-gray-500 bg-white border border-gray-200 rounded-md px-2 py-1">
                        <span className="text-[#C9A84C]">→</span>
                        <span className="truncate">{step.toolCall}</span>
                      </div>
                    )}

                    {/* Detail lines */}
                    {step.details && step.details.length > 0 && step.status !== 'pending' && (
                      <ul className="mt-2 space-y-1">
                        {step.details.map((d, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.05 * i }}
                            className="text-[13px] text-gray-600 leading-relaxed flex items-start gap-2"
                          >
                            <span className="text-[#C9A84C] mt-1.5 shrink-0">·</span>
                            <span>{d}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
