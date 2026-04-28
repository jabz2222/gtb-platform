'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelative } from '@/lib/utils/formatters'

interface Contact {
  id: string
  full_name: string
  role: string
}

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  read_at: string | null
  created_at: string
}

const ROLE_COLORS: Record<string, string> = {
  admin: '#C9A84C',
  staff: '#5BB8E8',
  mentor: '#9B2454',
  educator: '#CC2222',
}

export default function MessagingUI({
  currentUserId,
  contacts,
}: {
  currentUserId: string
  contacts: Contact[]
}) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0] ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!selectedContact) return

    // Load messages between currentUser and selectedContact
    supabase
      .from('messages' as 'profiles') // type cast since messages table may not be in types yet
      .select('*')
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedContact.id}),` +
        `and(sender_id.eq.${selectedContact.id},recipient_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data ?? []) as unknown as Message[])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
  }, [selectedContact?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || !selectedContact) return
    setSending(true)

    const { data } = await supabase
      .from('messages' as 'profiles')
      .insert({
        sender_id: currentUserId,
        recipient_id: selectedContact.id,
        body: body.trim(),
        read_at: null,
      } as unknown as Record<string, unknown>)
      .select()
      .single()

    if (data) {
      setMessages(prev => [...prev, data as unknown as Message])
      setBody('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    setSending(false)
  }

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Contact list */}
      <div className="w-64 flex-shrink-0 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Contacts</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
          {contacts.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[#444] text-xs">No contacts available</p>
            </div>
          ) : (
            contacts.map(c => {
              const color = ROLE_COLORS[c.role] ?? '#555'
              const isSelected = selectedContact?.id === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{ backgroundColor: `${color}20`, color, fontFamily: "'Arial Black', sans-serif" }}
                  >
                    {c.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white truncate">{c.full_name}</p>
                    <p className="text-[10px] capitalize" style={{ color }}>{c.role}</p>
                  </div>
                  {isSelected && (
                    <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: '#C9A84C' }} />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden flex flex-col">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 flex-shrink-0">
              <div
                className="w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-black"
                style={{
                  backgroundColor: `${ROLE_COLORS[selectedContact.role] ?? '#555'}20`,
                  color: ROLE_COLORS[selectedContact.role] ?? '#555',
                  fontFamily: "'Arial Black', sans-serif",
                }}
              >
                {selectedContact.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{selectedContact.full_name}</p>
                <p className="text-[10px] capitalize text-[#444]">{selectedContact.role}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#333] text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.sender_id === currentUserId
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-sm px-3 py-2 ${
                          isMine
                            ? 'bg-[#C9A84C]/20 text-white'
                            : 'bg-white/[0.05] text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.body}</p>
                        <p className="text-[10px] text-[#444] mt-1">{formatRelative(msg.created_at)}</p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="px-4 py-3 border-t border-white/5 flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder={`Message ${selectedContact.full_name}…`}
                className="flex-1 bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2 text-sm
                           placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !body.trim()}
                className="bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black px-4 py-2
                           rounded-sm transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#333] text-sm">Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
