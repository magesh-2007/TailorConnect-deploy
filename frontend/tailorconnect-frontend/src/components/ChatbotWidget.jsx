import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import api from '../services/api'
import * as storage from '../services/storageService'

const QUICK_QUESTIONS = [
  '🔍 Find tailors in Chennai',
  '💰 Blouse stitching price list',
  '👗 Bridal Aari blouse ideas',
  '📏 How to take blouse measurements?',
  '📦 Track my orders',
]

export default function ChatbotWidget() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  // If already on the dedicated full chatbot page, hide the floating drawer to prevent redundancy
  const isChatbotPage = location.pathname.includes('/customer/chatbot') || location.pathname.includes('/customer/ai')

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '👋 Vanakkam! I\'m your TailorConnect AI Chatbot. How can I help you today? Ask about nearby tailors, blouse designs, stitching prices, or track your orders!',
      ts: Date.now(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, loading])

  if (isChatbotPage) return null

  const getSmartBotReply = (query) => {
    const q = query.toLowerCase()

    // 1. Tailor Search by city or specialty
    if (q.includes('tailor') || q.includes('chennai') || q.includes('madurai') || q.includes('coimbatore') || q.includes('kovilpatti') || q.includes('trichy') || q.includes('salem') || q.includes('aari') || q.includes('shop')) {
      const allTailors = storage.getTailors ? storage.getTailors() : []
      let matched = []
      if (q.includes('chennai')) {
        matched = allTailors.filter(t => (t.location || '').toLowerCase().includes('chennai'))
      } else if (q.includes('madurai')) {
        matched = allTailors.filter(t => (t.location || '').toLowerCase().includes('madurai'))
      } else if (q.includes('coimbatore')) {
        matched = allTailors.filter(t => (t.location || '').toLowerCase().includes('coimbatore'))
      } else if (q.includes('aari') || q.includes('bridal')) {
        matched = allTailors.filter(t => ((t.specialist || '') + (t.about || '')).toLowerCase().includes('aari') || ((t.specialist || '') + (t.about || '')).toLowerCase().includes('bridal'))
      } else {
        matched = allTailors.slice(0, 3)
      }

      if (matched.length === 0) matched = allTailors.slice(0, 2)

      const names = matched.map(m => `• **${m.name}** (${m.shopName || m.location}) — ⭐ ${m.rating || '4.9'} | ${m.specialist || 'Tailor'}`).join('\n')

      return {
        text: `🔍 Here are top verified tailors matching your search:\n\n${names}\n\nWould you like to view their full profile or book stitching?`,
        action: 'tailors',
        tailors: matched,
      }
    }

    // 2. Pricing / Rates
    if (q.includes('price') || q.includes('rate') || q.includes('cost') || q.includes('evlo') || q.includes('charges') || q.includes('fee') || q.includes('how much')) {
      return {
        text: `💰 **Estimated Stitching Price Guide (Tamil Nadu):**\n\n` +
          `• **Simple Cotton Blouse:** ₹350 – ₹500 (1-2 days)\n` +
          `• **Princess Cut Lined Blouse:** ₹600 – ₹950 (2-3 days)\n` +
          `• **Handcrafted Aari Work Blouse:** ₹2,500 – ₹8,500+ (5-10 days)\n` +
          `• **Maggam / Zardosi Bridal Wear:** ₹3,500 – ₹12,000 (7-14 days)\n` +
          `• **Custom Lehenga / Anarkali:** ₹3,000 – ₹9,000\n` +
          `• **Salwar / Kurti Stitching:** ₹500 – ₹1,200\n` +
          `• **Alteration & Fitting:** ₹100 – ₹300\n\n` +
          `*Exact rates depend on fabric intricacy and urgent delivery options.*`,
        action: 'pricing',
      }
    }

    // 3. Design / Blouse Styling
    if (q.includes('blouse') || q.includes('design') || q.includes('neck') || q.includes('saree') || q.includes('pattern') || q.includes('lehenga') || q.includes('style')) {
      return {
        text: `✨ **Trending Blouse Design Suggestions:**\n\n` +
          `1. **Deep Pot Neck with Tassels:** Perfect for Kanchipuram silk sarees with antique zari borders.\n` +
          `2. **Boat Neck with French Knot Aari:** Modern, elegant look for festive party wear.\n` +
          `3. **Sweetheart Neck with Elbow Coin Work:** Traditional South Indian bridal favourite.\n` +
          `4. **Princess Cut with Back Dori:** Comfortable snug fit for everyday comfort.\n\n` +
          `Would you like to use this design concept in a new tailoring request?`,
        action: 'design',
      }
    }

    // 4. Measurements
    if (q.includes('measurement') || q.includes('measure') || q.includes('alavu') || q.includes('size') || q.includes('fitting')) {
      return {
        text: `📏 **Quick Blouse Measurement Guide:**\n\n` +
          `1. **Chest / Bust:** Measure around the fullest part of chest.\n` +
          `2. **Waist:** Measure around the ribcage where the blouse hem ends.\n` +
          `3. **Shoulder:** Measure bone-to-bone across upper back.\n` +
          `4. **Armhole:** Measure around the arm joint snugly.\n` +
          `5. **Sleeve Length:** Short (5-6"), Elbow (10-11"), or Full (20-22").\n` +
          `6. **Blouse Length:** Standard is 13.5 to 15 inches from shoulder apex.\n\n` +
          `💡 *Tip: You can also choose 'Send Sample Blouse' during request creation!*`,
        action: 'measurement',
      }
    }

    // 5. Order Tracking
    if (q.includes('track') || q.includes('order') || q.includes('ord-') || q.includes('status') || q.includes('delivery')) {
      return {
        text: `📦 **Order Tracking Assistant:**\n\n` +
          `You can view all your tailoring requests live under **Tailoring Requests**.\n` +
          `If you have an Order ID (like \`ORD-101\`), type it here or click below to check status!`,
        action: 'orders',
      }
    }

    // 6. Greetings in Tamil / English
    if (q.includes('hi') || q.includes('hello') || q.includes('vanakkam') || q.includes('hey') || q.includes('epdi') || q.includes('help')) {
      return {
        text: `🙏 **Vanakkam! Welcome to TailorConnect.**\n\n` +
          `I can assist you with:\n` +
          `• 🔍 Finding verified tailors near you\n` +
          `• 👗 Blouse neck & embroidery design concepts\n` +
          `• 💰 Stitching price estimation\n` +
          `• 📏 Measurement guidance\n` +
          `• 📦 Checking order status\n\n` +
          `What would you like to know today?`,
        action: 'general',
      }
    }

    // Default Fallback
    return {
      text: `Got it! I understand you're asking about "${query}".\n\n` +
        `As your TailorConnect assistant, I can connect you with top master tailors, provide bridal blouse styling suggestions, check stitching price estimates, and guide your measurements.\n\n` +
        `Would you like to browse tailors or book a custom stitching request?`,
      action: 'general',
    }
  }

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim()
    if (!query) return

    const userMessage = { role: 'user', text: query, ts: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Attempt backend AI first
      const res = await api.post('/ai/chat', { message: query }).catch(() => null)
      if (res && res.data && res.data.reply) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: res.data.reply,
          tailors: res.data.tailors || null,
          action: res.data.action || null,
          ts: Date.now(),
        }])
      } else {
        // Smart instant response fallback
        const smartReply = getSmartBotReply(query)
        setMessages(prev => [...prev, {
          role: 'bot',
          text: smartReply.text,
          tailors: smartReply.tailors || null,
          action: smartReply.action || null,
          ts: Date.now(),
        }])
      }
    } catch {
      const smartReply = getSmartBotReply(query)
      setMessages(prev => [...prev, {
        role: 'bot',
        text: smartReply.text,
        tailors: smartReply.tailors || null,
        action: smartReply.action || null,
        ts: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating Launcher Button ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 90,
          zIndex: 9989,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            height: 52,
            padding: '0 18px',
            borderRadius: 26,
            background: 'linear-gradient(135deg, #0F5C5E 0%, #164E63 100%)',
            color: '#FFFFFF',
            border: '2px solid rgba(255,255,255,0.85)',
            boxShadow: '0 8px 24px rgba(15,92,94,0.35)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'scale(1.02)' : 'scale(1)',
          }}
          title="Open AI Chatbot"
        >
          <span style={{ fontSize: 20 }}>🤖</span>
          <span>{isOpen ? 'Close Chat' : 'Chatbot'}</span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 6px #22C55E',
            }}
          />
        </button>
      </div>

      {/* ── Floating Chat Drawer Modal ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 86,
            right: 24,
            zIndex: 9992,
            width: 370,
            maxWidth: 'calc(100vw - 48px)',
            height: 520,
            maxHeight: 'calc(100vh - 120px)',
            background: '#FFFFFF',
            color: '#1E293B',
            borderRadius: 20,
            boxShadow: '0 20px 45px rgba(0,0,0,0.22), 0 4px 14px rgba(15,92,94,0.15)',
            border: '1.5px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F5C5E 0%, #164E63 100%)',
              color: '#FFFFFF',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.01em' }}>
                  TailorBot AI
                </div>
                <div style={{ fontSize: 11, color: '#A7F3D0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
                  Online · TailorConnect Guide
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Expand to Full Page */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/customer/chatbot')
                }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Open in Full Screen Page"
              >
                ⛶ Full Page
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: '2px 6px',
                  lineHeight: 1,
                }}
                title="Close Chatbot"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: '#F8FAFC',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '86%',
                    padding: '10px 14px',
                    borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                    background: m.role === 'user' ? '#0F5C5E' : '#FFFFFF',
                    color: m.role === 'user' ? '#FFFFFF' : '#1E293B',
                    fontSize: 13,
                    lineHeight: 1.55,
                    border: m.role === 'user' ? 'none' : '1px solid #E2E8F0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.text}

                  {/* Render Tailor Action Cards if present */}
                  {m.tailors && m.tailors.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {m.tailors.map(tailor => (
                        <div
                          key={tailor.id || tailor._id}
                          style={{
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: 8,
                            padding: '8px 10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 12, color: '#0F5C5E' }}>{tailor.name}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>📍 {tailor.location || tailor.shopLocation} · ⭐ {tailor.rating || '4.9'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false)
                              navigate(`/customer/tailors/${tailor.id || tailor._id}`)
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              background: '#0F5C5E',
                              color: '#fff',
                              border: 'none',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            View →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Buttons based on context */}
                  {m.action === 'design' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        navigate('/customer/create-order?aiPrompt=Bridal+blouse+design')
                      }}
                      style={{
                        marginTop: 8,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: '#0F5C5E',
                        color: '#fff',
                        border: 'none',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      ✂️ Book This Blouse Request →
                    </button>
                  )}

                  {m.action === 'pricing' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        navigate('/customer/tailors')
                      }}
                      style={{
                        marginTop: 8,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: '#0F5C5E',
                        color: '#fff',
                        border: 'none',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      🔍 Compare Tailors & Rates →
                    </button>
                  )}

                  {m.action === 'orders' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        navigate('/customer/orders')
                      }}
                      style={{
                        marginTop: 8,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: '#0F5C5E',
                        color: '#fff',
                        border: 'none',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      📦 Open Tailoring Requests →
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: '#FFFFFF', borderRadius: 12, width: 'fit-content', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 12, color: '#0F5C5E', fontWeight: 600 }}>TailorBot is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div
            style={{
              padding: '6px 10px',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {QUICK_QUESTIONS.slice(0, 3).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                style={{
                  padding: '4px 9px',
                  borderRadius: 14,
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#334155',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div
            style={{
              padding: '10px',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSend()
              }}
              placeholder="Ask anything in Tamil or English..."
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 10,
                border: '1.5px solid #CBD5E1',
                fontSize: 12.5,
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                padding: '9px 14px',
                borderRadius: 10,
                background: input.trim() ? '#0F5C5E' : '#CBD5E1',
                color: '#FFFFFF',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'default',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
