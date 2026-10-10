import React, { useEffect, useState, useRef } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import * as storage from '../../services/storageService'
import api, { SERVER_URL } from '../../services/api'

const CITIES = ['Chennai','Coimbatore','Madurai','Trichy','Salem','Tirunelveli','Vellore','Erode','Tiruppur','Thanjavur','Kovilpatti','Tuticorin']
const SPECIALTIES = ['Aari Blouse','Bridal Wear','Churidar','Lehenga','Saree Blouse','Alteration','Embroidery','Kids Wear','Formal Wear','Fusion Wear']
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Tailor&background=0F5C5E&color=fff&size=200'

const TABS = [
  { id: 'about',     label: 'About',       icon: '👤' },
  { id: 'business',  label: 'Business',    icon: '🏪' },
  { id: 'reviews',   label: 'Reviews',     icon: '⭐' },
  { id: 'offers',    label: 'Offers',      icon: '🏷️' },
]

export default function TailorProfileSettings() {
  const { user, updateProfile } = useAuth()
  const avatarRef = useRef(null)
  const [offers, setOffers] = useState([])
  const [reviews, setReviews] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState('about')

  const [form, setForm] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    shopName: '',
    location: 'Chennai',
    address: '',
    pincode: '',
    specialist: 'Aari Blouse Specialist',
    experience: '',
    about: '',
    avatar: DEFAULT_AVATAR,
    dailyCapacity: 5,
    urgentOrders: true,
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        age: user.age || '',
        email: user.email || '',
        phone: user.phone || '',
        shopName: user.shopName || '',
        location: user.location || 'Chennai',
        address: user.address || '',
        pincode: user.pincode || '',
        specialist: user.specialist || 'Aari Blouse Specialist',
        experience: user.experience || '',
        about: user.about || '',
        avatar: user.avatar || DEFAULT_AVATAR,
        dailyCapacity: user.dailyCapacity || 5,
        urgentOrders: user.urgentOrders !== false,
      })
      setOffers(storage.getOffersForTailor ? storage.getOffersForTailor(user.id) : [])
      setReviews(storage.getReviewsForTailor ? storage.getReviewsForTailor(user.id) : [])
    }
  }, [user])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const setField = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const handleSave = async (e) => {
    e.preventDefault()
    await updateProfile(form)
    setIsEditing(false)
    showToast('Profile updated successfully!')
  }

  const handleAvatarPick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setField('avatar', preview)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url = res.data?.data?.url || res.data?.url
      if (url) setField('avatar', url.startsWith('http') ? url : `${SERVER_URL}${url}`)
      showToast('Photo uploaded!')
    } catch {
      showToast('Photo preview set (save to persist)')
    } finally {
      setUploading(false)
    }
  }

  const avgRating = storage.getTailorAverageRating ? storage.getTailorAverageRating(user?.id) : '4.8'
  const activeOffers = offers.filter(o => o.status === 'Active')
  const completedOffers = offers.filter(o => o.status === 'Closed' || o.status === 'Completed')
  const avatarSrc = form.avatar || DEFAULT_AVATAR

  return (
    <DashboardLayout role="tailor">
      <style>{`
        .ptab-btn { padding: 8px 16px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; }
        .ptab-btn:hover { opacity: 0.85; }
        .psave-btn { padding: 9px 22px; border-radius: 9px; border: none; background: #0F5C5E; color: #fff; font-size: 13.5px; font-weight: 700; cursor: pointer; }
        .pcancel-btn { padding: 9px 18px; border-radius: 9px; border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; font-size: 13.5px; font-weight: 600; cursor: pointer; }
        .pfield label { display: block; font-size: 12px; font-weight: 700; color: #6B7280; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.4px; }
        .pfield input, .pfield select, .pfield textarea { width: 100%; padding: 10px 12px; border-radius: 9px; border: 1.5px solid #E5E7EB; font-size: 13.5px; outline: none; transition: border 0.18s; box-sizing: border-box; font-family: inherit; }
        .pfield input:focus, .pfield select:focus, .pfield textarea:focus { border-color: #0F5C5E; box-shadow: 0 0 0 3px rgba(15,92,94,0.08); }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, background: '#0F5C5E', color: '#fff', padding: '12px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
          {toast}
        </div>
      )}

      {/* HERO BANNER */}
      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 24px rgba(15,92,94,0.12)', border: '1.5px solid #E0EEEC' }}>
        <div style={{ height: 140, background: 'linear-gradient(135deg, #0F5C5E 0%, #1A7D7F 40%, #C9A66B 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', top: 12, right: 16 }}>
            <button onClick={() => { setIsEditing(e => !e); setActiveTab('about') }}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.22)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '0 28px 24px' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: -52 }}>
            {/* Avatar with upload */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={avatarSrc}
                alt={form.name || 'Tailor'}
                onError={e => { e.target.src = DEFAULT_AVATAR }}
                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 16px rgba(0,0,0,0.14)', display: 'block' }}
              />
              <button onClick={() => avatarRef.current?.click()}
                style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: '#0F5C5E', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Change photo">
                {uploading ? '...' : 'P'}
              </button>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarPick} />
            </div>

            {/* Name + tags */}
            <div style={{ flex: 1, minWidth: 180, paddingTop: 56 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 21, fontWeight: 800, color: '#0F5C5E' }}>{form.name || 'Tailor Name'}</h2>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 10 }}>
                {form.shopName && <span>{form.shopName}</span>}
                {form.location && <span> • {form.location}</span>}
                {form.experience && <span> • {form.experience} exp</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ padding: '4px 12px', borderRadius: 999, background: '#DDEBE7', color: '#0F5C5E', fontSize: 12, fontWeight: 600 }}>{form.specialist}</span>
                <span style={{ padding: '4px 12px', borderRadius: 999, background: '#FEF3C7', color: '#D97706', fontSize: 12, fontWeight: 600 }}>Rating: {avgRating} / 5</span>
                {reviews.length > 0 && <span style={{ padding: '4px 12px', borderRadius: 999, background: '#F3F4F6', color: '#6B7280', fontSize: 12 }}>{reviews.length} Reviews</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: '#fff', padding: '10px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className="ptab-btn"
            style={{ background: activeTab === t.id ? '#0F5C5E' : 'transparent', color: activeTab === t.id ? '#fff' : '#6B7280', whiteSpace: 'nowrap' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── ABOUT TAB ── */}
      {activeTab === 'about' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E5E7EB', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F5C5E' }}>About &amp; Contact</h3>
          </div>
          <div style={{ padding: 20 }}>
            {isEditing ? (
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
                  <div className="pfield"><label>Full Name *</label><input value={form.name} onChange={e => setField('name', e.target.value)} required /></div>
                  <div className="pfield"><label>Age</label><input type="number" value={form.age} onChange={e => setField('age', e.target.value)} /></div>
                  <div className="pfield"><label>Email</label><input type="email" value={form.email} onChange={e => setField('email', e.target.value)} /></div>
                  <div className="pfield"><label>Phone</label><input value={form.phone} onChange={e => setField('phone', e.target.value)} /></div>
                  <div className="pfield">
                    <label>City</label>
                    <select value={form.location} onChange={e => setField('location', e.target.value)}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="pfield"><label>Pincode</label><input value={form.pincode} onChange={e => setField('pincode', e.target.value)} /></div>
                </div>
                <div className="pfield" style={{ marginBottom: 14 }}><label>Full Address</label><input value={form.address} onChange={e => setField('address', e.target.value)} /></div>
                <div className="pfield" style={{ marginBottom: 14 }}>
                  <label>About Your Craft</label>
                  <textarea rows="3" value={form.about} onChange={e => setField('about', e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="pcancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="psave-btn">Save Changes</button>
                </div>
              </form>
            ) : (
              <div>
                <p style={{ margin: '0 0 16px', lineHeight: 1.7, color: '#374151', fontSize: 14 }}>
                  {form.about || 'Master tailor specializing in bespoke bridal blouses, Aari needlework, and custom party wear.'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Phone', icon: '', value: form.phone },
                    { label: 'Email', icon: '', value: form.email },
                    { label: 'Address', icon: '', value: form.address || form.location },
                    { label: 'Age', icon: '', value: form.age ? form.age + ' yrs' : '' },
                  ].filter(i => i.value).map(item => (
                    <div key={item.label} style={{ padding: '12px 16px', borderRadius: 10, background: '#F8FFFE', border: '1.5px solid #E0EEEC' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BUSINESS TAB ── */}
      {activeTab === 'business' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E5E7EB', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F5C5E' }}>Business Details</h3>
          </div>
          <div style={{ padding: 20 }}>
            {isEditing ? (
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
                  <div className="pfield"><label>Shop / Boutique Name</label><input value={form.shopName} onChange={e => setField('shopName', e.target.value)} /></div>
                  <div className="pfield"><label>Experience (e.g. 8 yrs)</label><input value={form.experience} onChange={e => setField('experience', e.target.value)} /></div>
                  <div className="pfield">
                    <label>Specialist Title</label>
                    <select value={form.specialist} onChange={e => setField('specialist', e.target.value)}>
                      {SPECIALTIES.map(s => <option key={s}>{s} Specialist</option>)}
                    </select>
                  </div>
                  <div className="pfield"><label>Daily Order Capacity</label><input type="number" value={form.dailyCapacity} onChange={e => setField('dailyCapacity', parseInt(e.target.value))} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="pcancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="psave-btn">Save Changes</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Shop Name', value: form.shopName },
                  { label: 'Specialist', value: form.specialist },
                  { label: 'Experience', value: form.experience },
                  { label: 'Daily Capacity', value: form.dailyCapacity ? form.dailyCapacity + ' orders/day' : '' },
                ].filter(i => i.value).map(item => (
                  <div key={item.label} style={{ padding: '12px 16px', borderRadius: 10, background: '#F8FFFE', border: '1.5px solid #E0EEEC' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REVIEWS TAB ── */}
      {activeTab === 'reviews' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E5E7EB', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F5C5E' }}>Customer Reviews &amp; Ratings ({reviews.length})</h3>
          </div>
          <div style={{ padding: 20 }}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>No reviews yet</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Reviews will appear here when customers rate your delivered orders.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ padding: '16px', borderRadius: 12, background: '#F8FFFE', border: '1.5px solid #E0EEEC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong style={{ fontSize: 15, color: '#1F2937' }}>{r.customer}</strong>
                      <span style={{ color: '#D97706', fontWeight: 700 }}>★ {r.rating} / 5</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>{r.date} {r.orderId ? '• Order #' + r.orderId : ''}</div>
                    <p style={{ margin: 0, fontSize: 13.5, color: '#374151', lineHeight: 1.6 }}>"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── OFFERS TAB ── */}
      {activeTab === 'offers' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E5E7EB', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F5C5E' }}>Active &amp; Completed Offers</h3>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F5C5E', marginBottom: 10 }}>Active Offers ({activeOffers.length})</div>
              {activeOffers.length === 0 ? (
                <div style={{ color: '#9CA3AF', fontSize: 13 }}>No active offers currently.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeOffers.map(o => (
                    <div key={o.id} style={{ padding: '12px 16px', borderRadius: 10, background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
                      <strong style={{ fontSize: 14 }}>{o.name}</strong>
                      <span style={{ fontSize: 12.5, color: '#6B7280', marginLeft: 10 }}>{o.registeredStudents || 0}/{o.maxCapacity} registered • Rs.{o.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6B7280', marginBottom: 10 }}>Completed / Closed ({completedOffers.length})</div>
              {completedOffers.length === 0 ? (
                <div style={{ color: '#9CA3AF', fontSize: 13 }}>No closed offers.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {completedOffers.map(o => (
                    <div key={o.id} style={{ padding: '12px 16px', borderRadius: 10, background: '#F9FAFB', border: '1.5px solid #E5E7EB' }}>
                      <strong style={{ fontSize: 14 }}>{o.name}</strong>
                      <span style={{ fontSize: 12.5, color: '#9CA3AF', marginLeft: 10 }}>{o.registeredStudents} students trained</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
