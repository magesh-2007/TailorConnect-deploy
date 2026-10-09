import React, { useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const STEPS = [
  { step: 1, title: 'Garment', icon: '👗' },
  { step: 2, title: 'Design', icon: '🎨' },
  { step: 3, title: 'Fabric', icon: '🧵' },
  { step: 4, title: 'Measurements', icon: '📏' },
  { step: 5, title: 'Customization', icon: '✨' },
  { step: 6, title: 'Delivery', icon: '🚚' },
  { step: 7, title: 'Review', icon: '📋' },
  { step: 8, title: 'Submit', icon: '🚀' }
]

const DRESS_CATEGORIES = [
  { id: 'Bridal Blouse', title: 'Bridal Blouse', icon: '👰', desc: 'Heavy Aari, Maggam, Zari & Stone work bridal blouses', avgDays: '5–7 Days' },
  { id: 'Aari Work', title: 'Aari Embroidery', icon: '🪡', desc: 'Handcrafted needle embroidery on silk/velvet fabrics', avgDays: '6–9 Days' },
  { id: 'Embroidery', title: 'Designer Embroidery', icon: '🌸', desc: 'Thread work, machine embroidery, cutwork & neck motifs', avgDays: '4–6 Days' },
  { id: 'Designer Dress', title: 'Designer Dress / Lehenga', icon: '💃', desc: 'Lehengas, party wear gowns, ethnic anarkalis', avgDays: '7–12 Days' },
  { id: 'Saree Alteration', title: 'Saree Alteration & Kuchu', icon: '🥻', desc: 'Fall, pico, saree kuchu/tassels, waist alterations', avgDays: '2–3 Days' },
  { id: 'Kids Wear', title: 'Kids Ethnic Wear', icon: '🧒', desc: 'Pattu pavadai, kids kurtas, ethnic frocks & sets', avgDays: '3–5 Days' },
  { id: 'Custom Stitching', title: 'Custom Stitching', icon: '✂️', desc: 'Tailored precisely based on your custom pattern & fit', avgDays: '4–7 Days' },
  { id: 'Alteration', title: 'Alterations & Repairs', icon: '🔧', desc: 'Expert alterations for a perfect fit on any garment', avgDays: '1–3 Days' },
]

const URGENCY_OPTIONS = [
  { id: 'standard', label: 'Standard', desc: 'Normal delivery timeline', icon: '📦', extra: '+₹0' },
  { id: 'express', label: 'Express', desc: '50% faster delivery', icon: '⚡', extra: '+₹200' },
  { id: 'urgent', label: 'Urgent', desc: 'Fastest turnaround available', icon: '🔥', extra: '+₹400' },
]

export default function CreateOrder() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef(null)

  const preselectedService = searchParams.get('service') || ''
  const preselectedTailorId = searchParams.get('tailorId') || ''

  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [error, setError] = useState('')

  // Saved Measurement Profiles
  const [savedProfiles, setSavedProfiles] = useState([])
  const [selectedProfileId, setSelectedProfileId] = useState('')

  // Form State across 8 Steps
  const [dressCategory, setDressCategory] = useState(preselectedService || '')
  const [customName, setCustomName] = useState('')
  const [designDescription, setDesignDescription] = useState('')
  const [neckPattern, setNeckPattern] = useState('')
  const [sleeveStyle, setSleeveStyle] = useState('')
  const [referenceImages, setReferenceImages] = useState([])
  const [referenceImagePreviews, setReferenceImagePreviews] = useState([])
  
  // Fabric Step
  const [fabricMaterial, setFabricMaterial] = useState('Pure Silk')
  const [fabricColor, setFabricColor] = useState('Crimson Pink & Gold')

  // Measurements Step
  const [measurementsNotes, setMeasurementsNotes] = useState('')
  const [measurements, setMeasurements] = useState({ chest: '36', waist: '30', shoulder: '14.5', sleeve: '11.0', hip: '38', length: '15.0', neck: '7.0', armhole: '16.5' })

  // Customization Step
  const [quantity, setQuantity] = useState(1)
  const [specialNotes, setSpecialNotes] = useState('')

  // Delivery Step
  const [urgency, setUrgency] = useState('standard')
  const [deadline, setDeadline] = useState('')
  const [budget, setBudget] = useState('1500')
  const [location, setLocation] = useState(user?.location || 'Chennai')

  React.useEffect(() => {
    api.get('/measurements').then(res => {
      const list = res.data?.data?.profiles || []
      setSavedProfiles(list)
      if (list.length > 0) {
        const def = list.find(p => p.isDefault) || list[0]
        setSelectedProfileId(def._id)
        setMeasurements({
          chest: def.chest || '36',
          waist: def.waist || '30',
          shoulder: def.shoulder || '14.5',
          sleeve: def.sleeveLength || '11.0',
          hip: def.hip || '38',
          length: def.dressLength || '15.0',
          neck: def.neck || '7.0',
          armhole: def.armhole || '16.5'
        })
      }
    }).catch(() => {})
  }, [])

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - referenceImages.length)
    setReferenceImages(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setReferenceImagePreviews(prev => [...prev, ev.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== idx))
    setReferenceImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const validateStep = () => {
    if (currentStep === 1 && !dressCategory) {
      setError('Please select a service type.')
      return false
    }
    if (currentStep === 2 && !designDescription.trim()) {
      setError('Please describe your design requirements.')
      return false
    }
    if (currentStep === 3 && !deadline) {
      setError('Please select a required delivery date.')
      return false
    }
    setError('')
    return true
  }

  const nextStep = () => {
    if (validateStep()) setCurrentStep(s => Math.min(4, s + 1))
  }
  const prevStep = () => { setError(''); setCurrentStep(s => Math.max(1, s - 1)) }

  const handleSubmit = async () => {
    setError('')
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('designName', customName || dressCategory)
      formData.append('category', dressCategory)
      formData.append('designDescription', designDescription)
      formData.append('neckPattern', neckPattern)
      formData.append('sleeveStyle', sleeveStyle)
      formData.append('deadline', deadline)
      formData.append('budget', budget || 0)
      formData.append('urgent', urgency === 'urgent')
      formData.append('urgency', urgency)
      formData.append('location', location || user?.location || '')
      formData.append('specialInstructions', specialNotes)
      formData.append('measurementsNotes', measurementsNotes)
      if (provideMeasurements) {
        formData.append('measurements', JSON.stringify(measurements))
      }
      if (preselectedTailorId) formData.append('tailorId', preselectedTailorId)
      referenceImages.forEach(f => formData.append('referenceImages', f))

      const res = await api.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const orderData = res.data?.data?.order || res.data?.order || res.data
      setSubmitted(orderData)
    } catch (err) {
      console.error('CreateOrder error:', err)
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <DashboardLayout role="customer">
        <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#ECFDF5', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 36, margin: '0 auto 24px',
          }}>
            ✅
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: '#0F5C5E', marginBottom: 10 }}>
            Request Submitted!
          </h1>
          <p style={{ color: '#667085', fontSize: 15, lineHeight: 1.65, marginBottom: 8 }}>
            Your tailoring request has been broadcast to verified tailors.
            You'll receive quotations from tailors shortly.
          </p>
          {submitted.orderNumber && (
            <div style={{
              display: 'inline-block', background: '#DDEBE7', border: '1px solid #E3E8E6',
              borderRadius: 8, padding: '10px 20px', marginBottom: 28, fontSize: 14, fontWeight: 600, color: '#0F5C5E',
            }}>
              📋 Request ID: {submitted.orderNumber}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/customer/orders')}
              style={{ background: '#0F5C5E', color: '#FFFFFF', border: 'none', padding: '11px 26px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              View My Requests
            </button>
            <button
              onClick={() => navigate('/customer/quotations')}
              style={{ background: '#FFFFFF', color: '#0F5C5E', border: '1.5px solid #0F5C5E', padding: '11px 26px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              View Quotations
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <div className="page-header">
        <div>
          <h1 style={{ color: '#0F5C5E' }}>New Tailoring Request</h1>
          <p>Describe your design requirements — share a reference image and let tailors quote for your project.</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32, alignItems: 'center' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.step}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8, flex: 1,
                padding: '10px 14px', borderRadius: 10,
                background: currentStep === s.step ? '#0F5C5E' : currentStep > s.step ? '#ECFDF5' : '#FCFBF7',
                border: `1.5px solid ${currentStep === s.step ? '#0F5C5E' : currentStep > s.step ? '#A7F3D0' : '#E3E8E6'}`,
                transition: 'all 0.2s', cursor: currentStep > s.step ? 'pointer' : 'default',
              }}
              onClick={() => { if (currentStep > s.step) setCurrentStep(s.step) }}
            >
              <span style={{ fontSize: 16 }}>{currentStep > s.step ? '✅' : s.icon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: currentStep === s.step ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}>
                  Step {s.step}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: currentStep === s.step ? '#FFFFFF' : currentStep > s.step ? '#065F46' : '#667085' }}>
                  {s.title}
                </div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 20, flexShrink: 0, height: 2, background: currentStep > s.step ? '#A7F3D0' : '#E3E8E6', borderRadius: 1 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '12px 16px', marginBottom: 20, color: '#991B1B', fontSize: 13.5, display: 'flex', gap: 8 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ background: '#FFFFFF', border: '1.5px solid #E3E8E6', borderRadius: 14, padding: 28 }}>

        {/* ═══════════ STEP 1: Service Type ═══════════ */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F5C5E', marginBottom: 6 }}>What service do you need?</h2>
            <p style={{ color: '#667085', fontSize: 14, marginBottom: 24 }}>Select the type of tailoring service you're looking for.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
              {DRESS_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setDressCategory(cat.id); setCustomName(cat.title) }}
                  style={{
                    padding: '16px 18px', borderRadius: 12, border: `2px solid ${dressCategory === cat.id ? '#0F5C5E' : '#E3E8E6'}`,
                    background: dressCategory === cat.id ? '#DDEBE7' : '#FFFFFF',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { if (dressCategory !== cat.id) e.currentTarget.style.borderColor = '#0F5C5E' }}
                  onMouseLeave={e => { if (dressCategory !== cat.id) e.currentTarget.style.borderColor = '#E3E8E6' }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F5C5E', marginBottom: 4 }}>{cat.title}</div>
                  <div style={{ fontSize: 12, color: '#667085', lineHeight: 1.45, marginBottom: 8 }}>{cat.desc}</div>
                  <div style={{ fontSize: 11.5, color: '#C9A66B', fontWeight: 600 }}>⏱ Avg: {cat.avgDays}</div>
                  {dressCategory === cat.id && (
                    <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#0F5C5E' }}>✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <label style={labelStyle}>Custom Request Name (optional)</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="e.g., Silk Bridal Blouse with Aari Work"
                style={inputStyle}
              />
              <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Give your request a name — this helps tailors understand your requirement at a glance.</div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 2: Design Details ═══════════ */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F5C5E', marginBottom: 6 }}>Describe your design</h2>
            <p style={{ color: '#667085', fontSize: 14, marginBottom: 24 }}>
              Share your design vision — upload reference photos and describe exactly what you want.
              <strong style={{ color: '#0F5C5E' }}> Measurements are optional</strong> — you can share them at the appointment with the tailor.
            </p>

            {/* Reference Images */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>📸 Reference Design Photos (optional, up to 3)</label>
              <div
                style={{
                  border: '2px dashed #E3E8E6', borderRadius: 12, padding: 24,
                  textAlign: 'center', cursor: 'pointer', background: '#FCFBF7',
                  transition: 'all 0.2s', marginBottom: 12,
                }}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0F5C5E'; e.currentTarget.style.background = '#DDEBE7' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E3E8E6'; e.currentTarget.style.background = '#FCFBF7' }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F5C5E', marginBottom: 4 }}>
                  Upload reference photos
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                  Share photos of designs you like — from Pinterest, Instagram, or your own photos.
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              {referenceImagePreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {referenceImagePreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={src} alt={`Reference ${i + 1}`} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, border: '2px solid #E3E8E6' }} />
                      <button
                        onClick={() => removeImage(i)}
                        style={{
                          position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                          borderRadius: '50%', background: '#B45353', color: '#FFFFFF',
                          border: 'none', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>📝 Design Description *</label>
              <textarea
                value={designDescription}
                onChange={e => setDesignDescription(e.target.value)}
                rows={4}
                placeholder="Describe your design in detail: colors, embroidery style, neckline, patterns, special features...

Example: 'Deep U-neck back design with gold zari Aari embroidery, potli button detailing, dual-tone gold piping, and padded inner lining.'"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            {/* Neck & Sleeve */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Neck Design (optional)</label>
                <input
                  type="text"
                  value={neckPattern}
                  onChange={e => setNeckPattern(e.target.value)}
                  placeholder="e.g. Deep U-neck, Boat neck, Sweetheart"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Sleeve Style (optional)</label>
                <input
                  type="text"
                  value={sleeveStyle}
                  onChange={e => setSleeveStyle(e.target.value)}
                  placeholder="e.g. Sleeveless, Elbow length 11 inch"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Optional Measurements */}
            <div style={{ background: '#FCFBF7', border: '1.5px solid #E3E8E6', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  id="provide-measurements"
                  checked={provideMeasurements}
                  onChange={e => setProvideMeasurements(e.target.checked)}
                  style={{ marginTop: 3, accentColor: '#0F5C5E', width: 16, height: 16, cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <label htmlFor="provide-measurements" style={{ fontSize: 14, fontWeight: 700, color: '#0F5C5E', cursor: 'pointer' }}>
                    📏 I want to provide measurements now (optional)
                  </label>
                  <p style={{ fontSize: 12.5, color: '#667085', margin: '4px 0 0' }}>
                    You can skip this — measurements will be taken at the tailor's studio or sent later. Providing measurements upfront helps tailors quote more accurately.
                  </p>
                </div>
              </div>
              {provideMeasurements && (
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                  {Object.keys(measurements).map(key => (
                    <div key={key}>
                      <label style={{ ...labelStyle, textTransform: 'capitalize' }}>{key} (inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={measurements[key]}
                        onChange={e => setMeasurements(m => ({ ...m, [key]: e.target.value }))}
                        placeholder="0.0"
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Measurement Notes (optional)</label>
                <input
                  type="text"
                  value={measurementsNotes}
                  onChange={e => setMeasurementsNotes(e.target.value)}
                  placeholder="Any additional measurement notes for the tailor"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 3: Budget & Delivery ═══════════ */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F5C5E', marginBottom: 6 }}>Budget & Delivery Timeline</h2>
            <p style={{ color: '#667085', fontSize: 14, marginBottom: 24 }}>Set your expected budget and when you need the garment ready.</p>

            {/* Urgency */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>⚡ Urgency Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {URGENCY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setUrgency(opt.id)}
                    style={{
                      padding: '14px 16px', borderRadius: 10, border: `2px solid ${urgency === opt.id ? '#0F5C5E' : '#E3E8E6'}`,
                      background: urgency === opt.id ? '#DDEBE7' : '#FFFFFF',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{opt.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F5C5E', marginBottom: 3 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: '#667085', marginBottom: 6 }}>{opt.desc}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: opt.id === 'standard' ? '#3F7D5A' : '#C9A66B' }}>{opt.extra}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Required By Date */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>📅 Required Delivery Date *</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                style={inputStyle}
              />
              <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Select the date by which you need your garment delivered.</div>
            </div>

            {/* Budget */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>💰 Your Maximum Budget (₹)</label>
              <input
                type="number"
                min="0"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="e.g. 2500"
                style={inputStyle}
              />
              <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>
                Tailors will use this as a guide when quoting. Leave blank if you're open to any price.
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>📍 Your Location / Preferred Delivery Area</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Chennai, Madurai, Coimbatore"
                style={inputStyle}
              />
            </div>

            {/* Special Notes */}
            <div>
              <label style={labelStyle}>📝 Additional Instructions (optional)</label>
              <textarea
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                rows={3}
                placeholder="Any other details for the tailor — fabric preferences, color, special requirements…"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {/* ═══════════ STEP 4: Review & Submit ═══════════ */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F5C5E', marginBottom: 6 }}>Review Your Request</h2>
            <p style={{ color: '#667085', fontSize: 14, marginBottom: 24 }}>
              Review your tailoring request before broadcasting to verified tailors.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                ['Service Type', dressCategory],
                ['Request Name', customName || dressCategory],
                ['Design Description', designDescription],
                ['Neck Design', neckPattern || '(to be discussed)'],
                ['Sleeve Style', sleeveStyle || '(to be discussed)'],
                ['Urgency', URGENCY_OPTIONS.find(o => o.id === urgency)?.label || urgency],
                ['Required By', deadline ? new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                ['Budget', budget ? `₹${budget}` : 'Flexible (open to quotes)'],
                ['Location', location || '(not specified)'],
                ['Measurements', provideMeasurements ? 'Provided' : 'Will share at appointment'],
              ].map(([label, value]) => value && (
                <div key={label} style={{ borderBottom: '1px solid #E8EFF7', paddingBottom: 12 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13.5, color: '#1F2937', lineHeight: 1.5 }}>{value}</div>
                </div>
              ))}
            </div>

            {referenceImagePreviews.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Reference Photos</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {referenceImagePreviews.map((src, i) => (
                    <img key={i} src={src} alt={`Ref ${i + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #E3E8E6' }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{
              marginTop: 24, background: '#DDEBE7', border: '1px solid #E3E8E6',
              borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>📢</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F5C5E', marginBottom: 3 }}>Broadcasting to Verified Tailors</div>
                <div style={{ fontSize: 13, color: '#667085' }}>
                  Your request will be shared with all verified tailors matching your location and service. You'll receive quotations and can choose the best tailor.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid #E8EFF7' }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            style={{
              background: '#FFFFFF', color: currentStep === 1 ? '#E3E8E6' : '#0F5C5E',
              border: `1.5px solid ${currentStep === 1 ? '#E8EFF7' : '#0F5C5E'}`,
              padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              style={{
                background: '#0F5C5E', color: '#FFFFFF', border: 'none',
                padding: '10px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                background: submitting ? '#9CA3AF' : '#0F5C5E',
                color: '#FFFFFF', border: 'none',
                padding: '11px 30px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {submitting ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Submitting…
                </>
              ) : '🚀 Submit Tailoring Request'}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 6 }
const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #E3E8E6',
  borderRadius: 8, fontSize: 13.5, color: '#1F2937', background: '#FFFFFF', outline: 'none',
  transition: 'border-color 0.15s',
}
