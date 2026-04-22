'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { MessageCircle, X, Send, Minimize2, Maximize2, Compass, Trash2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUser } from '@/contexts/UserContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `zen-${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()
  const { user } = useUser()

  const greeting = user
    ? `Hello, ${user.full_name?.split(' ')[0]}! I'm your Zen Travel concierge. Where would you like to go next? ✈️`
    : t('chatbot.greeting')

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })), sessionId }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || t('chatbot.error'),
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('chatbot.error'),
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([{ id: 'greeting', role: 'assistant', content: greeting, timestamp: new Date() }])
  }

  const chatWidth = isExpanded ? 'w-[480px]' : 'w-[360px]'
  const chatHeight = isExpanded ? 'h-[600px]' : 'h-[480px]'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`${chatWidth} ${chatHeight} flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-stone)] bg-[var(--color-white)]`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-charcoal)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Zen Concierge</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-white/60">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearChat} title="Clear chat" className="p-1.5 text-white/50 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-white/50 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors">
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-white/50 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--color-cream)]/30">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Compass className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[var(--color-charcoal)] text-white rounded-br-sm' : 'bg-white border border-[var(--color-stone)] text-[var(--color-charcoal)] rounded-bl-sm shadow-sm'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center flex-shrink-0">
                    <Compass className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white border border-[var(--color-stone)] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-[var(--color-gold)] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[var(--color-stone)] bg-[var(--color-white)]">
              <div className="flex items-center gap-2 bg-[var(--color-cream)] rounded-xl border border-[var(--color-stone)] px-3 py-2 focus-within:border-[var(--color-gold)] transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={t('chatbot.placeholder')}
                  className="flex-1 bg-transparent text-sm text-[var(--color-charcoal)] placeholder-[var(--color-text-muted)] outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center disabled:opacity-40 transition-opacity hover:shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <p className="text-center text-xs text-[var(--color-text-muted)] mt-2">Powered by Zen Travel AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center shadow-[0_4px_20px_rgba(201,168,76,0.5)] hover:shadow-[0_6px_28px_rgba(201,168,76,0.6)] transition-shadow"
        aria-label="Open travel concierge chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
