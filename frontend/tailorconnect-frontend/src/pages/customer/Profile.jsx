import React, { useEffect, useState, useRef } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api, { SERVER_URL } from '../../services/api'

const CITIES = ['Chennai','Coimbatore','Madurai','Trichy','Salem','Tirunelveli','Vellore','Erode','Tiruppur','Thanjavur']
const STYLE_PREFS = ['Bridal','Casual','Formal','Fusion','Traditional','Indo-Western','Party Wear']
const FABRIC_PREFS = ['Cotton','Silk','Chiffon','Georgette','Linen','Velvet','Satin','Net']
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=0F5C5E&color=fff&size=200'

/* ── Small reusable pieces ─────────────────────────────────────── */
function InfoCard({ icon, label, value }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12, background: '#F8FFFE',
      border: '1.5px solid #E0EEEC', display: 'flex', flexDirection: 'column', gap: 3,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{value || '—'}</span>
    </div>
  )
}

function SectionCard({ icon, title, children, action }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E5E7EB', overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F5C5E', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{icon}</span>{title}
        </h3>
        {action}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function Chip({ label, color = '#0F5C5E', bg = '#DDEBE7', active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
      border: `1.5px solid ${active ? color : '#E5E7EB'}`,
      background: active ? color : (onClick ? '#fff' : bg),
      color: active ? '#fff' : (onClick ? '#6B7280' : color),
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.18s',
    }}>{label}</button>
  )
}

function MeasBox({ label, icon, unit, value, editing, onChange }) {
  return (
    <div style={{ padding: '14px', borderRadius: 12, background: '#F8FFFE', border: '1.5px solid #E0EEEC', textAlign: 'center' }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      {editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          <input type="number" value={value} onChange={e => onChange(e.target.value)}
            placeholder="0"
            style={{ width: 60, padding: '5px 6px', border: '1.5px solid #0F5C5E', borderRadius: 7, fontSize: 14, fontWeight: 700, textAlign: 'center', outline: 'none' }} />
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{unit}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'center' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: value ? '#0F5C5E' : '#D1D5DB' }}>{value || '—'}</span>
          {value && <span style={{ fontSize: 11, color: '#9CA3AF' }}>{unit}</span>}
        </div>
      )}
    </div>
  )
}

const TABS = [
  { id: 'personal',     label: 'Personal',     icon: '👤' },
  { id: 'measurements', label: 'Measurements', icon: '📏' },
  { id: 'style',        label: 'Style Prefs',  icon: '🎨' },
  { id: 'addresses',    label: 'Addresses',    icon: '📍' },
  { id: 'activity',     label: 'Activity',     icon: '📊' },
]

export default function CustomerProfile() {
  const { user, updateProfile } = useAuth()
  const avatarRef = useRef(null)

  const [activeTab, setActiveTab]   = useState('personal')
  const [isEditing, setIsEditing]   = useState(false)
  const [isMeasEdit, setIsMeasEdit] = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [toast, setToast]           = useState('')
  const [orders, setOrders]         = useState([])

  const blank = {
    name: '', age: '', email: '', phone: '', alternatPhone: '',
    location: 'Chennai', address: '', pincode: '', bio: '',
    avatar: DEFAULT_AVATAR,
  }

  const [form, setForm]               = useState(blank)
  const [measurements, setMeasurements] = useState({ bust:'', waist:'', hips:'', shoulder:'', sleeveLength:'', blouseLength:'', skirtLength:'', height:'', weight:'' })
  const [stylePrefs, setStylePrefs]   = useState([])
  const [fabricPrefs, setFabricPrefs] = useState([])

  /* populate from user context */
  useEffect(() => {
    if (!user) return
    setForm({
      name:         user.name         || '',
      age:          user.age          || '',
      email:        user.email        || '',
      phone:        user.phone        || '',
      alternatPhone:user.alternatPhone|| '',
      location:     user.location     || 'Chennai',
      address:      user.address      || '',
      pincode:      user.pincode      || '',
      bio:          user.bio          || '',
      avatar:       user.avatar       || DEFAULT_AVATAR,
    })
    if (user.measurements)  setMeasurements({ bust:'', waist:'', hips:'', shoulder:'', sleeveLength:'', blouseLength:'', skirtLength:'', height:'', weight:'', ...user.measurements })
    if (user.stylePrefs)    setStylePrefs(user.stylePrefs)
    if (user.fabricPrefs)   setFabricPrefs(user.fabricPrefs)
  }, [user])

  /* fetch orders */
  useEffect(() => {
    api.get('/orders/my')
      .then(r => setOrders(r.data?.data?.orders || r.data?.orders || []))
      .catch(() => {})
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const setField = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const setMeas  = (key, val) => setMeasurements(p => ({ ...p, [key]: val }))
  const togglePref = (arr, set, val) => set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const saveAll = async (e) => {
    e?.preventDefault()
    await updateProfile({ ...form, measurements, stylePrefs, fabricPrefs })
    setIsEditing(false)
    setIsMeasEdit(false)
    showToast('✅ Profile saved!')
  }

  const handleAvatarPick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Immediately preview
    const preview = URL.createObjectURL(file)
    setField('avatar', preview)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url = res.data?.data?.url || res.data?.url
      if (url) setField('avatar', url.startsWith('http') ? url : `${SERVER_URL}${url}`)
      showToast('✅ Photo uploaded!')
    } catch {
      showToast('📷 Photo preview set (save to persist)')
    } finally {
      setUploading(false)
    }
  }

  const completedOrders = orders.filter(o => ['COMPLETED','DELIVERED'].includes(o.orderStatus)).length
  const activeOrders    = orders.filter(o => !['COMPLETED','DELIVERED','CANCELLED','REJECTED'].includes(o.orderStatus)).length

  const BADGES = [
    { icon: '🌟', label: 'Early Adopter',    earned: true,                     desc: 'Joined at launch' },
    { icon: '✂️', label: 'First Order',       earned: orders.length >= 1,       desc: '1+ order placed' },
    { icon: '🏅', label: 'Loyal Client',      earned: completedOrders >= 3,     desc: '3+ orders done' },
    { icon: '📐', label: 'Measurements Pro',  earned: !!measurements.bust,      desc: 'Saved measurements' },
    { icon: '🎨', label: 'Style Guru',        earned: stylePrefs.length >= 3,   desc: '3+ style preferences' },
    { icon: '💎', label: 'Premium Member',    earned: completedOrders >= 10,    desc: '10+ orders done' },
  ]

  const MEAS = [
    { key:'bust',        label:'Bust/Chest',    icon:'👗', unit:'in' },
    { key:'waist',       label:'Waist',         icon:'📐', unit:'in' },
    { key:'hips',        label:'Hips',          icon:'📏', unit:'in' },
    { key:'shoulder',    label:'Shoulder',      icon:'🧥', unit:'in' },
    { key:'sleeveLength',label:'Sleeve Length', icon:'💪', unit:'in' },
    { key:'blouseLength',label:'Blouse Length', icon:'✂️', unit:'in' },
    { key:'skirtLength', label:'Skirt Length',  icon:'👘', unit:'in' },
    { key:'height',      label:'Height',        icon:'📊', unit:'cm' },
    { key:'weight',      label:'Weight',        icon:'⚖️', unit:'kg' },
  ]

  const avatarSrc = form.avatar || DEFAULT_AVATAR

  return (
    <DashboardLayout role="customer">
      <style>{`
        .ptab-btn { padding: 8px 16px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; }
        .ptab-btn:hover { opacity: 0.85; }
        .psave-btn { padding: 9px 22px; border-radius: 9px; border: none; background: #0F5C5E; color: #fff; font-size: 13.5px; font-weight: 700; cursor: pointer; }
        .pcancel-btn { padding: 9px 18px; border-radius: 9px; border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; font-size: 13.5px; font-weight: 600; cursor: pointer; }
        .pfield label { display: block; font-size: 12px; font-weight: 700; color: #6B7280; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.4px; }
        .pfield input, .pfield select, .pfield textarea { width: 100%; padding: 10px 12px; border-radius: 9px; border: 1.5px solid #E5E7EB; font-size: 13.5px; outline: none; transition: border 0.18s; box-sizing: border-box; font-family: inherit; }
        .pfield input:focus, .pfield select:focus, .pfield textarea:focus { border-color: #0F5C5E; box-shadow: 0 0 0 3px rgba(15,92,94,0.08); }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, background: '#0F5C5E', color: '#fff', padding: '12px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.18)', animation: 'fadeIn 0.3s' }}>
          {toast}
        </div>
      )}

      {/* ── HERO BANNER ── */}
      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 24px rgba(15,92,94,0.12)', border: '1.5px solid #E0EEEC' }}>
        {/* Gradient cover */}
        <div style={{ height: 140, background: 'linear-gradient(135deg, #0F5C5E 0%, #1A7D7F 40%, #C9A66B 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', top: 12, right: 16, display: 'flex', gap: 8 }}>
            <button onClick={() => { setIsEditing(e => !e); setActiveTab('personal') }}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.22)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
              {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
            </button>
          </div>
        </div>

        {/* Avatar + Info */}
        <div style={{ background: '#fff', padding: '0 28px 24px' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: -52 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={avatarSrc}
                alt={form.name || 'Profile'}
                onError={e => { e.target.src = DEFAULT_AVATAR }}
                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 16px rgba(0,0,0,0.14)', display: 'block' }}
              />
              {/* Upload overlay */}
              <button onClick={() => avatarRef.current?.click()}
                style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: '#0F5C5E', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Change photo">
                {uploading ? '⏳' : '📷'}
              </button>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarPick} />
            </div>

            {/* Name + tags */}
            <div style={{ flex: 1, minWidth: 180, paddingTop: 56 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 21, fontWeight: 800, color: '#0F5C5E' }}>{form.name || 'Your Name'}</h2>
              <p style={{ margin: '0 0 10px', fontSize: 13, color: '#9CA3AF' }}>
                📍 {form.location}{form.pincode ? ` – ${form.pincode}` : ''}&nbsp;&nbsp;
                {form.age ? `🎂 Age ${form.age}` : ''}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={pill('#DDEBE7','#0F5C5E')}>👗 TailorConnect Client</span>
                <span style={pill('#F0F4FF','#3B5BDB')}>✂️ {completedOrders} Orders Done</span>
                {stylePrefs.slice(0,2).map(s => <span key={s} style={pill('#FFF8F0','#C9A66B')}>{s}</span>)}
              </div>
              {form.bio && <p style={{ margin: '10px 0 0', fontSize: 13, color: '#6B7280', fontStyle: 'italic', maxWidth: 500 }}>"{form.bio}"</p>}
            </div>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: 20, paddingTop: 52, flexWrap: 'wrap' }}>
              {[
                { n: orders.length,    l: 'Total',     c: '#0F5C5E', e: '✂️' },
                { n: activeOrders,     l: 'Active',    c: '#C9A66B', e: '🔄' },
                { n: completedOrders,  l: 'Done',      c: '#3F7D5A', e: '✅' },
              ].map(s => (
                <div key={s.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.c }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{s.e} {s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} className="ptab-btn" onClick={() => setActiveTab(t.id)}
            style={{ background: activeTab === t.id ? '#0F5C5E' : '#F3F4F6', color: activeTab === t.id ? '#fff' : '#4B5563' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════
           TAB: PERSONAL INFO
         ════════════════════════════════════ */}
      {activeTab === 'personal' && (
        <SectionCard icon="👤" title="Personal Details">
          {isEditing ? (
            <form onSubmit={saveAll}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 14 }}>
                {[
                  { label:'Full Name',       key:'name',         type:'text',   required:true },
                  { label:'Age',             key:'age',          type:'number' },
                  { label:'Email',           key:'email',        type:'email' },
                  { label:'Phone',           key:'phone',        type:'tel' },
                  { label:'Alternate Phone', key:'alternatPhone',type:'tel' },
                  { label:'Pincode',         key:'pincode',      type:'text' },
                ].map(f => (
                  <div key={f.key} className="pfield">
                    <label>{f.label}{f.required ? ' *' : ''}</label>
                    <input type={f.type} value={form[f.key]} required={f.required}
                      onChange={e => setField(f.key, e.target.value)} />
                  </div>
                ))}
                <div className="pfield">
                  <label>City / Location</label>
                  <select value={form.location} onChange={e => setField('location', e.target.value)}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Photo upload inside edit form too */}
              <div className="pfield" style={{ marginBottom: 14 }}>
                <label>Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={avatarSrc} alt="avatar" onError={e => { e.target.src = DEFAULT_AVATAR }}
                    style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB', flexShrink: 0 }} />
                  <button type="button" onClick={() => avatarRef.current?.click()}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #0F5C5E', background: '#fff', color: '#0F5C5E', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    {uploading ? '⏳ Uploading…' : '📷 Choose Photo'}
                  </button>
                  <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>JPG / PNG / WEBP · max 5 MB</span>
                </div>
              </div>

              <div className="pfield" style={{ marginBottom: 18 }}>
                <label>Short Bio</label>
                <textarea rows={3} value={form.bio} onChange={e => setField('bio', e.target.value)}
                  placeholder="A little about your style..." style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="pcancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="psave-btn">💾 Save Changes</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              <InfoCard icon="👤" label="Full Name"      value={form.name} />
              <InfoCard icon="🎂" label="Age"            value={form.age ? `${form.age} years` : ''} />
              <InfoCard icon="✉️" label="Email"          value={form.email} />
              <InfoCard icon="📞" label="Phone"          value={form.phone} />
              <InfoCard icon="📱" label="Alt. Phone"     value={form.alternatPhone} />
              <InfoCard icon="🏙️" label="City"           value={form.location} />
              <InfoCard icon="📮" label="Pincode"        value={form.pincode} />
              {form.bio && (
                <div style={{ gridColumn: '1/-1', padding: '14px 16px', borderRadius: 12, background: '#F8FFFE', border: '1.5px solid #E0EEEC' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>💬 Bio</span>
                  <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#374151', fontStyle: 'italic', lineHeight: 1.6 }}>"{form.bio}"</p>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      )}

      {/* ════════════════════════════════════
           TAB: MEASUREMENTS
         ════════════════════════════════════ */}
      {activeTab === 'measurements' && (
        <SectionCard icon="📏" title="Body Measurements"
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              {isMeasEdit && <button className="psave-btn" onClick={saveAll} style={{ fontSize: 12.5, padding: '6px 14px' }}>💾 Save</button>}
              <button className="pcancel-btn" onClick={() => setIsMeasEdit(e => !e)} style={{ fontSize: 12.5, padding: '6px 14px' }}>
                {isMeasEdit ? 'Cancel' : '✏️ Edit'}
              </button>
            </div>
          }>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 16px' }}>
            Saved measurements are shared with tailors automatically when you place an order.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {MEAS.map(m => (
              <MeasBox key={m.key} {...m} value={measurements[m.key]} editing={isMeasEdit}
                onChange={val => setMeas(m.key, val)} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* ════════════════════════════════════
           TAB: STYLE PREFS
         ════════════════════════════════════ */}
      {activeTab === 'style' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <SectionCard icon="🎨" title="Style Preferences">
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 14px' }}>Select styles you love — tailors use these to suggest designs.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {STYLE_PREFS.map(s => (
                <Chip key={s} label={s} active={stylePrefs.includes(s)} color="#0F5C5E" bg="#DDEBE7"
                  onClick={() => togglePref(stylePrefs, setStylePrefs, s)} />
              ))}
            </div>
            {stylePrefs.length > 0 && (
              <button className="psave-btn" onClick={saveAll} style={{ fontSize: 12.5, padding: '7px 16px' }}>💾 Save Preferences</button>
            )}
          </SectionCard>

          <SectionCard icon="🧵" title="Fabric Preferences">
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 14px' }}>Tell tailors which fabrics you prefer to work with.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {FABRIC_PREFS.map(f => (
                <Chip key={f} label={f} active={fabricPrefs.includes(f)} color="#C9A66B" bg="#FFF8F0"
                  onClick={() => togglePref(fabricPrefs, setFabricPrefs, f)} />
              ))}
            </div>
            {fabricPrefs.length > 0 && (
              <button className="psave-btn" onClick={saveAll} style={{ fontSize: 12.5, padding: '7px 16px', background: '#C9A66B' }}>💾 Save Fabrics</button>
            )}
          </SectionCard>
        </div>
      )}

      {/* ════════════════════════════════════
           TAB: ADDRESSES
         ════════════════════════════════════ */}
      {activeTab === 'addresses' && (
        <SectionCard icon="📍" title="Delivery Addresses">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
            {/* Default address */}
            <div style={{ padding: 18, borderRadius: 14, border: '2px solid #0F5C5E', background: '#F0FDF9', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 10, fontWeight: 800, background: '#0F5C5E', color: '#fff', padding: '2px 10px', borderRadius: 999 }}>DEFAULT</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F5C5E', marginBottom: 8 }}>🏠 Home Address</div>
              <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6 }}>{form.address || <span style={{ color: '#D1D5DB' }}>No address saved yet</span>}</div>
              <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 6 }}>
                {form.location}{form.pincode ? ` – ${form.pincode}` : ''}, Tamil Nadu
              </div>
              {form.phone && <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>📞 {form.phone}</div>}
              <button onClick={() => { setIsEditing(true); setActiveTab('personal') }}
                style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: '#0F5C5E', background: 'transparent', border: '1px solid #0F5C5E', borderRadius: 7, padding: '5px 12px', cursor: 'pointer' }}>
                ✏️ Edit Address
              </button>
            </div>

            {/* Add new */}
            <div onClick={() => { setIsEditing(true); setActiveTab('personal') }}
              style={{ padding: 18, borderRadius: 14, border: '2px dashed #D1D5DB', background: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 130, cursor: 'pointer' }}>
              <div style={{ fontSize: 32 }}>➕</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>Add Another Address</div>
              <div style={{ fontSize: 12, color: '#C4C9D4' }}>Office, parents' home, etc.</div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ════════════════════════════════════
           TAB: ACTIVITY
         ════════════════════════════════════ */}
      {activeTab === 'activity' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Order stats */}
          <SectionCard icon="📊" title="Order Activity">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label:'Total Orders Placed',    val: orders.length,       color:'#0F5C5E', bg:'#DDEBE7' },
                { label:'Active / In Progress',   val: activeOrders,        color:'#C9A66B', bg:'#FFF8F0' },
                { label:'Completed & Delivered',  val: completedOrders,     color:'#3F7D5A', bg:'#ECFDF5' },
                { label:'Cancelled',              val: orders.filter(o => o.orderStatus === 'CANCELLED').length, color:'#9CA3AF', bg:'#F1F5F9' },
              ].map(s => (
                <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 16px', borderRadius:10, background:s.bg }}>
                  <span style={{ fontSize:13.5, color:'#374151', fontWeight:500 }}>{s.label}</span>
                  <span style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Badges */}
          <SectionCard icon="🏆" title="My Badges">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {BADGES.map(b => (
                <div key={b.label} style={{
                  padding:'14px', borderRadius:12, textAlign:'center',
                  border:`1.5px solid ${b.earned ? '#C9A66B' : '#E5E7EB'}`,
                  background: b.earned ? '#FFFBF0' : '#F9FAFB',
                  opacity: b.earned ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize:26, marginBottom:6 }}>{b.icon}</div>
                  <div style={{ fontSize:12.5, fontWeight:700, color: b.earned ? '#92400E' : '#9CA3AF' }}>{b.label}</div>
                  <div style={{ fontSize:11, color:'#9CA3AF', marginTop:3 }}>{b.desc}</div>
                  {b.earned && <div style={{ fontSize:10, color:'#C9A66B', fontWeight:700, marginTop:4 }}>EARNED ✓</div>}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

    </DashboardLayout>
  )
}

/* helper */
const pill = (bg, color) => ({
  display:'inline-block', padding:'3px 10px', borderRadius:999,
  fontSize:11.5, fontWeight:700, background:bg, color,
  border:`1px solid ${color}22`,
})
