import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import * as storage from '../../services/storageService'

const SUGGESTIONS = [
  '🔍 Find tailors in Chennai',
  '👗 Bridal Aari blouse designs for silk saree',
  '💰 Blouse stitching price list',
  '📏 How to take blouse measurements?',
  '🧵 Best fabric for summer lehenga',
  '📦 Track my tailoring requests',
  '🏪 Tailors in Madurai for Maggam work',
  '✨ Sleeve design ideas for designer blouse',
]

function BotAvatar() {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #0F5C5E 0%, #164E63 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, color: '#fff',
      boxShadow: '0 3px 10px rgba(15,92,94,0.3)',
      border: '2px solid #E2E8F0',
    }}>
      🤖
    </div>
  )
}

function UserAvatar({ user }) {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
      background: '#E0E7FF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, fontWeight: 700, color: '#4338CA',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}>
      {user?.profileImage ? (
        <img src={user.profileImage} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        user?.name?.slice(0, 1).toUpperCase() || '👤'
      )}
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 6px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 8, height: 8, borderRadius: '50%', background: '#0F5C5E',
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <span style={{ fontSize: 12, color: '#64748B', marginLeft: 6, fontWeight: 600 }}>TailorBot is thinking...</span>
    </div>
  )
}

export default function CustomerChatbot() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      ts: Date.now(),
      content: `👋 **Vanakkam ${user?.name ? user.name.split(' ')[0] : ''}!** I am your **TailorConnect AI Chatbot**.\n\n` +
        `I'm here to assist you with everything tailoring & fashion in Tamil Nadu:\n` +
        `• 🔍 **Find Top Tailors** across Chennai, Madurai, Coimbatore, Kovilpatti & Trichy\n` +
        `• 👗 **Blouse & Dress Designs** (Aari needlework, boat neck, bridal patterns)\n` +
        `• 💰 **Stitching Rates & Price Estimates** for blouses, lehengas & salwars\n` +
        `• 📏 **Measurement Guides** (step-by-step sizing for a perfect fit)\n` +
        `• 📦 **Order Tracking** and status updates for your requests\n` +
        `• 🧵 **Fabric & Styling Recommendations**\n\n` +
        `Feel free to ask me in **Tamil, Tanglish, or English**!`,
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [availableTailors, setAvailableTailors] = useState([])
  const [userOrders, setUserOrders] = useState([])

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const recognitionRef = useRef(null)

  // Fetch tailors & user orders on load for rich local answers
  useEffect(() => {
    // 1. Get tailors
    api.get('/tailors').then(res => {
      const data = res.data?.data?.tailors || res.data?.tailors || []
      if (data.length > 0) setAvailableTailors(data)
      else setAvailableTailors(storage.getTailors ? storage.getTailors() : [])
    }).catch(() => {
      setAvailableTailors(storage.getTailors ? storage.getTailors() : [])
    })

    // 2. Get user's orders
    if (user) {
      api.get('/orders/my').then(res => {
        const o = res.data?.data?.orders || res.data?.orders || []
        setUserOrders(o)
      }).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Smart Rule Engine for Instant Responses ──
  const generateKnowledgeResponse = (query) => {
    const q = query.toLowerCase().trim()

    // 1. TAILOR SEARCH
    if (q.includes('tailor') || q.includes('chennai') || q.includes('madurai') || q.includes('coimbatore') || q.includes('kovilpatti') || q.includes('trichy') || q.includes('salem') || q.includes('shop') || q.includes('boutique') || q.includes('thedu')) {
      let matched = []
      let locationText = 'Tamil Nadu'

      if (q.includes('chennai')) {
        matched = availableTailors.filter(t => (t.location || t.shopLocation || '').toLowerCase().includes('chennai'))
        locationText = 'Chennai'
      } else if (q.includes('madurai')) {
        matched = availableTailors.filter(t => (t.location || t.shopLocation || '').toLowerCase().includes('madurai'))
        locationText = 'Madurai'
      } else if (q.includes('coimbatore')) {
        matched = availableTailors.filter(t => (t.location || t.shopLocation || '').toLowerCase().includes('coimbatore'))
        locationText = 'Coimbatore'
      } else if (q.includes('kovilpatti')) {
        matched = availableTailors.filter(t => (t.location || t.shopLocation || '').toLowerCase().includes('kovilpatti'))
        locationText = 'Kovilpatti'
      } else if (q.includes('aari') || q.includes('bridal') || q.includes('maggam')) {
        matched = availableTailors.filter(t =>
          ((t.specialist || '') + (t.about || '')).toLowerCase().includes('aari') ||
          ((t.specialist || '') + (t.about || '')).toLowerCase().includes('bridal') ||
          ((t.specialist || '') + (t.about || '')).toLowerCase().includes('maggam')
        )
        locationText = 'Specialist Bridal & Aari'
      } else {
        matched = availableTailors.slice(0, 4)
      }

      if (matched.length === 0) matched = availableTailors.slice(0, 3)

      return {
        content: `🔍 **Verified Tailors in ${locationText}:**\n\n` +
          `I found ${matched.length} top-rated boutique tailor${matched.length > 1 ? 's' : ''} available on TailorConnect. Check their specialties, ratings, and click below to book or view profiles directly:`,
        tailors: matched,
        action: 'find_tailors',
      }
    }

    // 2. PRICING & RATES
    if (q.includes('price') || q.includes('rate') || q.includes('cost') || q.includes('evlo') || q.includes('charges') || q.includes('fee') || q.includes('how much') || q.includes('vilai')) {
      return {
        content: `💰 **TailorConnect Stitching Price Guide (Tamil Nadu):**\n\n` +
          `| Service Type | Estimated Rate | Typical Delivery |\n` +
          `| :--- | :--- | :--- |\n` +
          `| **Simple Cotton Blouse** | ₹350 – ₹500 | 1 – 2 Days |\n` +
          `| **Princess Cut Lined Blouse** | ₹600 – ₹950 | 2 – 3 Days |\n` +
          `| **Designer Blouse (Piping/Puff)** | ₹800 – ₹1,400 | 3 – 5 Days |\n` +
          `| **Bridal Hand Aari Work Blouse** | ₹2,500 – ₹8,500+ | 5 – 10 Days |\n` +
          `| **Heirloom Maggam / Zardosi Work** | ₹3,500 – ₹12,000 | 7 – 14 Days |\n` +
          `| **Custom Bridal Lehenga** | ₹3,000 – ₹9,500 | 5 – 10 Days |\n` +
          `| **Salwar Kameez / Kurti** | ₹500 – ₹1,200 | 2 – 4 Days |\n` +
          `| **Fitting Alteration & Hemming** | ₹100 – ₹300 | Same Day / 1 Day |\n\n` +
          `💡 *Rates may vary based on customized thread work, stone types, and rush delivery options. You can receive exact custom quotes by submitting a tailoring request!*`,
        action: 'pricing',
      }
    }

    // 3. BLOUSE DESIGNS & STYLING
    if (q.includes('blouse') || q.includes('design') || q.includes('neck') || q.includes('saree') || q.includes('pattern') || q.includes('lehenga') || q.includes('style') || q.includes('sleeve') || q.includes('color')) {
      return {
        content: `🎨 **Designer Styling Recommendation for You:**\n\n` +
          `**1. Front Neckline Ideas:**\n` +
          `• *Sweetheart Neck:* Flattering and universally elegant for festive silk sarees.\n` +
          `• *Classic Broad U or Round Neck:* Timeless choice for heavy temple jewellery.\n` +
          `• *Boat Neck:* Chic contemporary look, great for chiffon, georgette & organza sarees.\n\n` +
          `**2. Back Neck Patterns:**\n` +
          `• *Deep Pot Neck with Handmade Latkans/Tassels:* Most popular South Indian wedding design.\n` +
          `• *Diamond or Teardrop Cut-out:* Clean modern geometry with zardosi border.\n` +
          `• *Backless with Criss-Cross Dori:* Youthful and comfortable fit.\n\n` +
          `**3. Sleeve Inspiration:**\n` +
          `• *Elbow-Length with Temple Border Aari Work:* Traditional royal look.\n` +
          `• *Puff Sleeve with Embroidered Cuff:* Retro vintage Tamil cinema style.\n\n` +
          `**4. Saree Color Pairing:**\n` +
          `• Mustard Yellow Saree ➔ Bottle Green or Maroon Velvet Blouse\n` +
          `• Rani Pink Saree ➔ Royal Blue or Antique Gold Blouse\n` +
          `• Pastel Mint / Peach Saree ➔ Rose Gold or Pearl work Blouse\n\n` +
          `Would you like to use this design concept directly in a Tailoring Request?`,
        action: 'design',
        designPrompt: 'Bridal silk blouse with elbow sleeves, deep pot neck, antique gold zari embroidery and custom latkans',
      }
    }

    // 4. MEASUREMENTS
    if (q.includes('measurement') || q.includes('measure') || q.includes('alavu') || q.includes('size') || q.includes('fitting') || q.includes('inch')) {
      return {
        content: `📏 **How to Take Perfect Blouse Measurements at Home:**\n\n` +
          `Follow these 6 key steps with an inch tape:\n\n` +
          `1. **Bust / Chest Circumference:** Measure around the fullest part of your bust, keeping the measuring tape parallel to the floor.\n` +
          `2. **Underbust / Waist:** Measure snug right where the blouse ends (around your rib cage).\n` +
          `3. **Shoulder Width:** Measure straight across the back from the tip of one shoulder bone to the other.\n` +
          `4. **Armhole Circumference:** Wrap the tape around the arm socket under the armpit comfortably (not too tight).\n` +
          `5. **Sleeve Length & Round:** Measure from shoulder tip down to desired length (Short: 5-6", Elbow: 10-11", 3/4th: 15-16", Full: 20-22") + circumference at that point.\n` +
          `6. **Blouse Length:** From the highest point of the shoulder near the neck straight down over the bust apex to the desired hem (usually 13.5" to 15").\n\n` +
          `💡 **No tape handy?** In TailorConnect, you can simply choose **"Send Sample Well-Fitting Blouse"** when booking, and the tailor will match it 100%!`,
        action: 'measurement',
      }
    }

    // 5. ORDER TRACKING
    if (q.includes('track') || q.includes('order') || q.includes('ord-') || q.includes('status') || q.includes('delivery')) {
      if (userOrders.length > 0) {
        const orderList = userOrders.map(o =>
          `• **Order #${o._id?.slice(-6) || o.orderNumber || 'ORD'}** — Status: \`${o.orderStatus || 'IN_PROGRESS'}\` | Total: ₹${o.totalAmount || o.price || '—'}`
        ).join('\n')

        return {
          content: `📦 **Here are your current active tailoring requests:**\n\n${orderList}\n\n` +
            `Click below to view the live timeline, tracking stages, and tailor chat!`,
          action: 'orders',
        }
      }

      return {
        content: `📦 **Live Order Tracking:**\n\n` +
          `You can monitor every stage of your tailoring request:\n` +
          `1. Request Accepted & Measurement Verified ✂️\n` +
          `2. Fabric Cut & In Stitching Queue 🧵\n` +
          `3. Embroidery / Aari Work in Progress ✨\n` +
          `4. Quality Inspection & Ready for Pickup / Delivery 🚚\n\n` +
          `Click below to visit your orders screen!`,
        action: 'orders',
      }
    }

    // 6. FABRIC & MATERIAL
    if (q.includes('fabric') || q.includes('material') || q.includes('silk') || q.includes('cotton') || q.includes('georgette') || q.includes('chanderi') || q.includes('summer')) {
      return {
        content: `🧵 **Expert Fabric Recommendations:**\n\n` +
          `• **For Heavy Embroidery / Aari Work:** Raw Silk, Pure Silk, or Thick Tussar silk are the best choices because thin fabrics will pucker under heavy thread tension.\n` +
          `• **For Hot / Summer Weather:** 100% Mulmul Cotton, Linen Cotton, or Chanderi silk with breathable cotton lining.\n` +
          `• **For Flowy Lehengas / Skirts:** Georgette, Organza, or Net with satin inner lining.\n` +
          `• **Lining Advice:** Always ask for preshrunk 2x2 cotton lining or butter crepe to avoid shrinkage after first wash.`,
        action: 'fabric',
      }
    }

    // 7. GREETINGS & TAMIL / TANGLISH
    if (q.includes('vanakkam') || q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('epdi') || q.includes('nalla') || q.includes('help')) {
      return {
        content: `🙏 **Vanakkam! Welcome to TailorConnect.**\n\n` +
          `Ungalukku enna help venum? Enakitta neenga:\n\n` +
          `1. 🔍 **Tailors Thedalaam** — Chennai, Madurai, Coimbatore la best tailors irukangala nu paakalaam.\n` +
          `2. 👗 **Blouse Designs** — Aari work, boat neck, wedding bridal blouse suggestions kekaalaam.\n` +
          `3. 💰 **Stitching Rates** — Blouse mattrum dress stitching rates therinjukalaam.\n` +
          `4. 📏 **Measurements** — Perfect alavu eduka guidance peralaam.\n` +
          `5. 📦 **Order Status** — Ungaloda orders track pannalaam.\n\n` +
          `Keezhe irukra options click pannunga or direct-ah type pannunga!`,
        action: 'general',
      }
    }

    // Default Fallback
    return {
      content: `I understand! As your TailorConnect assistant, I can help you find verified master tailors across Tamil Nadu, design customized bridal blouses & lehengas, calculate stitching rates, and guide your measurements.\n\n` +
        `Feel free to try asking one of the suggestions below, or let me know what garment you'd like to stitch!`,
      action: 'general',
    }
  }

  // ── Send Message ──
  const send = useCallback(async (customText, file) => {
    const textToSend = customText || input
    if (!textToSend.trim() && !file && !imageFile) return

    const userMsg = {
      role: 'user',
      ts: Date.now(),
      content: textToSend,
      image: imagePreview || null,
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setImageFile(null)
    setImagePreview(null)
    setLoading(true)

    try {
      let aiReplied = false

      // Try Backend AI first if message is pure text
      if (!file && !imageFile && textToSend.trim()) {
        try {
          const res = await api.post('/ai/chat', { message: textToSend })
          if (res && res.data && res.data.reply) {
            aiReplied = true
            setMessages(prev => [...prev, {
              role: 'bot',
              ts: Date.now(),
              content: res.data.reply,
              tailors: res.data.tailors || null,
              action: res.data.action || null,
              designPrompt: res.data.designPrompt || null,
            }])
          }
        } catch {
          // If backend throws 503 or error, failover smoothly to knowledge engine
          aiReplied = false
        }
      }

      if (!aiReplied) {
        // High-quality local intelligence fallback
        setTimeout(() => {
          const result = generateKnowledgeResponse(textToSend)
          setMessages(prev => [...prev, {
            role: 'bot',
            ts: Date.now(),
            content: result.content,
            tailors: result.tailors || null,
            action: result.action || null,
            designPrompt: result.designPrompt || null,
          }])
          setLoading(false)
        }, 400)
        return
      }
    } catch {
      const result = generateKnowledgeResponse(textToSend)
      setMessages(prev => [...prev, {
        role: 'bot',
        ts: Date.now(),
        content: result.content,
        tailors: result.tailors || null,
        action: result.action || null,
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [input, imageFile, imagePreview, availableTailors, userOrders])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
    inputRef.current?.focus()
  }

  // Voice speech-to-text
  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input is supported in Google Chrome & Edge. Please type your question.')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'ta-IN'
    rec.interimResults = true
    rec.maxAlternatives = 1
    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setInput(t)
    }
    rec.onerror = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const clearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([
        {
          role: 'bot',
          ts: Date.now(),
          content: '👋 Conversation restarted! How can I assist you with your tailoring needs today?',
        }
      ])
    }
  }

  return (
    <DashboardLayout role="customer">
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .ai-chat-input:focus { outline: none; border-color: #0F5C5E; box-shadow: 0 0 0 3px rgba(15,92,94,0.12); }
        .chip-button:hover { background: #0F5C5E !important; color: #FFFFFF !important; border-color: #0F5C5E !important; transform: translateY(-1px); }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #0F5C5E 0%, #164E63 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 4px 14px rgba(15,92,94,0.25)',
            border: '2px solid rgba(255,255,255,0.8)',
          }}>
            🤖
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F5C5E', fontFamily: "'Outfit', sans-serif" }}>
              AI Chatbot
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              Your 24/7 Smart Tailoring & Fashion Assistant
            </p>
          </div>
        </div>

        {/* Status & Actions Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#ECFDF5',
            padding: '6px 12px',
            borderRadius: 20,
            border: '1px solid #A7F3D0',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'pulseDot 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#065F46' }}>Online & Ready</span>
          </div>

          <button
            type="button"
            onClick={clearChat}
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              border: '1.5px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#64748B',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Clear Chat History"
          >
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      {/* ── Main Chat Shell ── */}
      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: 18,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 270px)',
        minHeight: 520,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}>
        {/* Messages Scroll Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          background: '#F8FAFC',
        }}>
          {messages.map((msg, index) => {
            const isBot = msg.role === 'bot'
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  flexDirection: isBot ? 'row' : 'row-reverse',
                }}
              >
                {isBot ? <BotAvatar /> : <UserAvatar user={user} />}

                <div style={{
                  maxWidth: '78%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  alignItems: isBot ? 'flex-start' : 'flex-end',
                }}>
                  {/* Uploaded User Image */}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Reference attachment"
                      style={{
                        maxHeight: 180,
                        borderRadius: 12,
                        objectFit: 'contain',
                        border: '1.5px solid #E2E8F0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}
                    />
                  )}

                  {/* Text Content */}
                  {msg.content && (
                    <div style={{
                      background: isBot ? '#FFFFFF' : '#0F5C5E',
                      color: isBot ? '#1E293B' : '#FFFFFF',
                      padding: '13px 18px',
                      borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      border: isBot ? '1.5px solid #E2E8F0' : 'none',
                      boxShadow: isBot ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 8px rgba(15,92,94,0.25)',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                    </div>
                  )}

                  {/* Tailor Cards Result */}
                  {msg.tailors && msg.tailors.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: 10,
                      width: '100%',
                      marginTop: 4,
                    }}>
                      {msg.tailors.map((tailor) => (
                        <div
                          key={tailor.id || tailor._id}
                          style={{
                            background: '#FFFFFF',
                            border: '1.5px solid #CBD5E1',
                            borderRadius: 12,
                            padding: '12px 14px',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                          }}
                        >
                          <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: '#DDEBE7', overflow: 'hidden', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                          }}>
                            {tailor.avatar || tailor.profileImage ? (
                              <img src={tailor.avatar || tailor.profileImage} alt={tailor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                            ) : '👗'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0F5C5E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {tailor.name}
                            </div>
                            <div style={{ fontSize: 11.5, color: '#64748B' }}>
                              🏪 {tailor.shopName || 'Boutique Studio'}
                            </div>
                            <div style={{ fontSize: 11, color: '#94A3B8' }}>
                              📍 {tailor.location || tailor.shopLocation || 'Tamil Nadu'} · ⭐ {tailor.rating || '4.9'}
                            </div>
                          </div>
                          <Link to={`/customer/tailors/${tailor.id || tailor._id}`} style={{ textDecoration: 'none' }}>
                            <button
                              type="button"
                              style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: '#0F5C5E',
                                color: '#FFFFFF',
                                border: 'none',
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              View →
                            </button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contextual Action Buttons */}
                  {msg.action === 'design' && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/customer/create-order?aiPrompt=${encodeURIComponent(msg.designPrompt || 'Bridal Blouse Design')}`)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: '#0F5C5E',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        ✂️ Book This Style in a New Request
                      </button>
                    </div>
                  )}

                  {msg.action === 'pricing' && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => navigate('/customer/tailors')}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          background: '#0F5C5E',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🔍 Browse All Tailors & Compare
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/customer/create-order')}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          background: '#FFFFFF',
                          color: '#0F5C5E',
                          border: '1.5px solid #0F5C5E',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🏷️ Request Free Quotation
                      </button>
                    </div>
                  )}

                  {msg.action === 'orders' && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => navigate('/customer/orders')}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          background: '#0F5C5E',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📦 View My Orders List →
                      </button>
                    </div>
                  )}

                  <div style={{ fontSize: 11, color: '#94A3B8' }}>
                    {new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}

          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <BotAvatar />
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '4px 16px 16px 16px',
                padding: '12px 16px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}>
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Image Attachment Preview */}
        {imagePreview && (
          <div style={{
            padding: '10px 18px',
            background: '#F0FDF4',
            borderTop: '1px solid #BBF7D0',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <img src={imagePreview} alt="Selected dress" style={{ height: 46, width: 46, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #BBF7D0' }} />
            <div style={{ fontSize: 12.5, color: '#0F5C5E', fontWeight: 600 }}>
              Dress image attached! Ask for design matching or tailor recommendations.
            </div>
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(null) }}
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748B' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div style={{
          padding: '14px 18px',
          borderTop: '1.5px solid #E2E8F0',
          background: '#FFFFFF',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              className="ai-chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything in Tamil or English... (Press Enter to send)"
              rows={2}
              style={{
                width: '100%',
                resize: 'none',
                padding: '11px 44px 11px 14px',
                borderRadius: 12,
                border: '1.5px solid #CBD5E1',
                fontSize: 13.5,
                fontFamily: 'inherit',
                lineHeight: 1.45,
                background: '#F8FAFC',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
              }}
            />
            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={isListening ? stopVoice : startVoice}
              title={isListening ? 'Stop recording' : 'Voice input (Tamil / English)'}
              style={{
                position: 'absolute',
                right: 10,
                bottom: 12,
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                background: isListening ? '#FEE2E2' : 'transparent',
                color: isListening ? '#DC2626' : '#64748B',
                transition: 'all 0.2s',
              }}
            >
              {isListening ? '⏹' : '🎤'}
            </button>
          </div>

          {/* Attach Image */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Attach reference dress photo"
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              border: '1.5px solid #CBD5E1',
              background: imageFile ? '#DDEBE7' : '#FFFFFF',
              cursor: 'pointer',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            📎
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => send()}
            disabled={loading || (!input.trim() && !imageFile)}
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              border: 'none',
              background: loading || (!input.trim() && !imageFile) ? '#CBD5E1' : '#0F5C5E',
              color: '#FFFFFF',
              cursor: loading || (!input.trim() && !imageFile) ? 'default' : 'pointer',
              fontSize: 18,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
      </div>

      {/* ── Quick Suggestion Chips ── */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          💡 Click to Ask Instantly:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              type="button"
              className="chip-button"
              onClick={() => send(s)}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 600,
                border: '1.5px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
