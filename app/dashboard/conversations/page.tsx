'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, MessageCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Customer {
  customer_phone: string
  last_message: string
  last_contact: string
  total_messages: number
  status: string
}

interface Message {
  id: string
  customer_phone: string
  role: string
  message: string
  timestamp: string
}

export default function ConversationsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [tenantId, setTenantId] = useState('default')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchCustomers() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const tid = user.user_metadata?.tenant_id || 'default'
      setTenantId(tid)
      const { data } = await supabase
        .from('crm')
        .select('customer_phone, last_message, last_contact, total_messages, status')
        .eq('tenant_id', tid)
        .order('last_contact', { ascending: false })
      setCustomers(data || [])
      setLoadingCustomers(false)
    }
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (!selectedCustomer) return
    async function fetchMessages() {
      setLoadingMessages(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('chat_history')
        .select('id, customer_phone, role, message, timestamp')
        .eq('tenant_id', tenantId)
        .eq('customer_phone', selectedCustomer)
        .order('timestamp', { ascending: true })
      setMessages(data || [])
      setLoadingMessages(false)
    }
    fetchMessages()
  }, [selectedCustomer, tenantId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredCustomers = customers.filter((c) =>
    c.customer_phone.toLowerCase().includes(search.toLowerCase())
  )
  const selectedCustomerData = customers.find((c) => c.customer_phone === selectedCustomer)

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Chat history with your customers</p>
      </div>
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex min-h-0">
        <div className={`w-full lg:w-80 flex-shrink-0 border-r border-gray-200 flex flex-col ${selectedCustomer ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search by phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingCustomers ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-28 bg-gray-100 animate-pulse rounded" />
                  <div className="h-3 w-40 bg-gray-100 animate-pulse rounded" />
                </div>
              </div>
            )) : filteredCustomers.length === 0 ? (
              <div className="py-12 text-center">
                <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No conversations found</p>
              </div>
            ) : filteredCustomers.map((customer) => (
              <button
                key={customer.customer_phone}
                onClick={() => setSelectedCustomer(customer.customer_phone)}
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${selectedCustomer === customer.customer_phone ? 'bg-green-50' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {customer.customer_phone.slice(-2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{customer.customer_phone}</p>
                    {customer.last_contact && (
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {formatDistanceToNow(new Date(customer.last_contact), { addSuffix: false })}
                      </p>
                    )}
                  </div>
                  {customer.last_message && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{customer.last_message}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedCustomer ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
              <button onClick={() => setSelectedCustomer(null)} className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {selectedCustomer.slice(-2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedCustomer}</p>
                {selectedCustomerData && (
                  <p className="text-xs text-gray-400">{selectedCustomerData.total_messages} messages</p>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No messages found</p>
                  </div>
                </div>
              ) : messages.map((msg) => {
                const isBot = msg.role === 'assistant' || msg.role === 'bot'
                return (
                  <div key={msg.id} className={`flex ${isBot ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${isBot ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isBot ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'}`}>
                        {msg.message}
                      </div>
                      {msg.timestamp && (
                        <p className="text-xs text-gray-400 px-1">{format(new Date(msg.timestamp), 'MMM d, h:mm a')}</p>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-center p-8">
            <div>
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Select a conversation</p>
              <p className="text-sm text-gray-400 mt-1">Choose a customer from the list to view their chat history</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
