import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'

const SPECIALIZATIONS = [
  'All',
  'Bridal Blouse',
  'Aari Work',
  'Embroidery',
  'Lehenga',
  'Designer Blouse',
  'Saree Alteration',
  'Kids Wear',
  'Custom Stitching',
  'Traditional Wear',
  'Alterations',
]

const LOCATIONS = [
  'All',
  'Chennai',
  'Madurai',
  'Coimbatore',
  'Trichy',
  'Salem',
  'Tirunelveli',
  'Kovilpatti',
  'Vellore',
  'Erode',
]

export default function FindTailors() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialLocation = searchParams.get('location') || 'All'
  const initialSpecialist = searchParams.get('specialist') || 'All'
  const initialShop = searchParams.get('shop') || ''

  const [location, setLocation] = useState(initialLocation)
  const [specialist, setSpecialist] = useState(initialSpecialist)
  const [shopName, setShopName] = useState(initialShop)
  const [service, setService] = useState('')
  const [userCoords, setUserCoords] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'map'
  const [radiusFilter, setRadiusFilter] = useState('50') // km

  const [tailors, setTailors] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [page, setPage] = useState(1)

  const calcDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return parseFloat((R * c).toFixed(1))
  }

  const fetchTailors = useCallback(async (params = {}) => {
    setLoading(true)
    setSearched(true)
    try {
      const query = new URLSearchParams()
      const loc = params.location ?? location
      const spec = params.specialist ?? specialist
      const shop = params.shopName ?? shopName

      if (loc && loc !== 'All') query.set('location', loc)
      if (spec && spec !== 'All') query.set('specialist', spec)
      if (shop) query.set('q', shop)
      query.set('page', params.page ?? page)
      query.set('limit', 24)

      const res = await api.get(`/tailors?${query.toString()}`)
      const data = res.data?.data || res.data
      let rawList = data?.tailors || []

      // If user provided coords, compute distance to each tailor
      if (userCoords) {
        rawList = rawList.map(t => {
          const lat = t.locationCoords?.lat || (t.location === 'Chennai' ? 13.0827 : 9.1732)
          const lng = t.locationCoords?.lng || (t.location === 'Chennai' ? 80.2707 : 77.8765)
          const dist = calcDistance(userCoords.lat, userCoords.lng, lat, lng)
          return { ...t, computedDistance: dist }
        }).sort((a, b) => (a.computedDistance || 999) - (b.computedDistance || 999))
      }

      setTailors(rawList)
      setTotal(data?.total || rawList.length)
    } catch (err) {
      console.error('Failed to load tailors', err)
      setTailors([])
    } finally {
      setLoading(false)
    }
  }, [location, specialist, shopName, page, userCoords])

  useEffect(() => {
    fetchTailors()
  }, []) // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchTailors({ page: 1 })
    const p = {}
    if (location !== 'All') p.location = location
    if (specialist !== 'All') p.specialist = specialist
    if (shopName) p.shop = shopName
    setSearchParams(p)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserCoords(coords)
        fetchTailors()
      },
      () => alert('Unable to detect location. Please check browser location permissions.')
    )
  }

  const clearFilters = () => {
    setLocation('All')
    setSpecialist('All')
    setShopName('')
    setService('')
    setUserCoords(null)
    setSearchParams({})
    setPage(1)
    fetchTailors({ location: 'All', specialist: 'All', shopName: '' })
  }

  const hasFilters = location !== 'All' || specialist !== 'All' || shopName || userCoords

  return (
    <DashboardLayout role="customer">
      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F5C5E' }}>{t('Find Tailors')}</h1>
          <p>{t('Search by location, shop name, or specialization to discover verified tailors near you.') || 'Search by location, shop name, or specialization to discover verified tailors near you.'}</p>
        </div>
        {/* List / Map View Toggle */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '10px', border: '1px solid #E3E8E6' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 16px', borderRadius: '7px', border: 'none',
              backgroundColor: viewMode === 'list' ? '#0F5C5E' : 'transparent',
              color: viewMode === 'list' ? '#FFFFFF' : '#667085',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer'
            }}
          >
            📋 {t('List View') || 'List View'}
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '6px 16px', borderRadius: '7px', border: 'none',
              backgroundColor: viewMode === 'map' ? '#0F5C5E' : 'transparent',
              color: viewMode === 'map' ? '#FFFFFF' : '#667085',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer'
            }}
          >
            🗺️ {t('Map View') || 'Map View'}
          </button>
        </div>
      </div>

      {/* ── Search Panel ── */}
      <div style={{
        background: '#FFFFFF', border: '1.5px solid #E3E8E6',
        borderRadius: 14, padding: '24px', marginBottom: 24,
        boxShadow: '0 2px 12px rgba(15,92,94,0.06)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F5C5E', marginBottom: 20 }}>
          🔍 Smart Search for Tailors
        </h2>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 18 }}>
            {/* Location */}
            <div>
              <label style={labelStyle}>📍 Location</label>
              <select value={location} onChange={e => setLocation(e.target.value)} style={selectStyle}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l === 'All' ? 'All Locations' : l}</option>)}
              </select>
            </div>

            {/* Specialization */}
            <div>
              <label style={labelStyle}>🧵 Specialization</label>
              <select value={specialist} onChange={e => setSpecialist(e.target.value)} style={selectStyle}>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Specializations' : s}</option>)}
              </select>
            </div>

            {/* Shop Name */}
            <div>
              <label style={labelStyle}>🏪 Shop Name (optional)</label>
              <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="e.g. Lakshmi Studio" style={inputStyle} />
            </div>

            {/* Radius Filter */}
            <div>
              <label style={labelStyle}>📏 Search Radius</label>
              <select value={radiusFilter} onChange={e => setRadiusFilter(e.target.value)} style={selectStyle}>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#0F5C5E', color: '#FFFFFF', border: 'none',
                padding: '10px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {loading ? <Spinner /> : '🔍'} Find Tailors
            </button>

            <button
              type="button"
              onClick={handleUseMyLocation}
              style={{
                background: userCoords ? '#246040' : '#DDEBE7',
                color: userCoords ? '#FFFFFF' : '#0F5C5E',
                border: '1.5px solid #E3E8E6',
                padding: '9px 20px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📍 {userCoords ? 'Location Active ✓' : 'Use My Location'}
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  background: 'transparent', color: '#667085',
                  border: '1.5px solid #E3E8E6',
                  padding: '9px 18px', borderRadius: 8, fontSize: 13.5,
                  cursor: 'pointer',
                }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── MAP VIEW ── */}
      {viewMode === 'map' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E3E8E6', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#0F5C5E', fontFamily: 'var(--font-heading)' }}>Interactive Map View</h3>
            <span style={{ fontSize: '13px', color: '#667085' }}>Showing {tailors.length} studio pins in Tamil Nadu</span>
          </div>
          {/* Canvas Interactive Map simulation */}
          <div style={{
            height: '380px',
            backgroundColor: '#EAEFEF',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #C8D5D2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'radial-gradient(#0F5C5E 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}>
            <div style={{ position: 'absolute', top: 16, left: 16, backgroundColor: '#FFFFFF', padding: '8px 14px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: 600, color: '#0F5C5E' }}>
              📍 Region: {location === 'All' ? 'Tamil Nadu' : location}
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', padding: '20px', zIndex: 1 }}>
              {tailors.slice(0, 6).map((t) => (
                <div
                  key={t.id || t._id}
                  onClick={() => navigate(`/customer/tailors/${t.id || t._id}`)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #0F5C5E',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 16px rgba(15,92,94,0.15)',
                    cursor: 'pointer',
                    minWidth: '180px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#C9A66B', textTransform: 'uppercase' }}>
                    {t.verificationStatus === 'VERIFIED' ? '✓ Verified Studio' : 'Tailor Studio'}
                  </div>
                  <div style={{ fontWeight: 700, color: '#0F5C5E', fontSize: '14px', margin: '4px 0' }}>
                    {t.shopName || t.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#667085' }}>
                    ⭐ {t.rating || 4.8} • {t.computedDistance ? `${t.computedDistance} km` : t.location || 'Chennai'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {searched && viewMode === 'list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#667085' }}>
              {loading ? 'Searching…' : (
                <>
                  <strong style={{ color: '#0F5C5E' }}>{tailors.length}</strong> tailor{tailors.length !== 1 ? 's' : ''} found
                  {location !== 'All' && ` in ${location}`}
                  {specialist !== 'All' && ` specializing in ${specialist}`}
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : tailors.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              background: '#FFFFFF', border: '1.5px solid #E3E8E6', borderRadius: 14,
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F5C5E', marginBottom: 8 }}>No tailors found</h2>
              <p style={{ color: '#667085', fontSize: 14, marginBottom: 20 }}>
                Try adjusting your search filters or expanding the location.
              </p>
              <button
                onClick={clearFilters}
                style={{
                  background: '#0F5C5E', color: '#FFFFFF', border: 'none',
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Clear Filters & Show All
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
              {tailors.map(tailor => (
                <TailorCard key={tailor.id || tailor._id} tailor={tailor} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}

function TailorCard({ tailor, navigate }) {
  const [hovered, setHovered] = useState(false)
  const id = tailor.id || tailor._id
  const isVerified = tailor.verificationStatus === 'VERIFIED' || tailor.verification_status === 'VERIFIED'

  return (
    <div
      style={{
        background: '#FFFFFF', border: `1.5px solid ${hovered ? '#0F5C5E' : '#E3E8E6'}`,
        borderRadius: 14, overflow: 'hidden', transition: 'all 0.2s',
        boxShadow: hovered ? '0 8px 24px rgba(15,92,94,0.12)' : 'none',
        transform: hovered ? 'translateY(-3px)' : 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/customer/tailors/${id}`)}
    >
      {/* Cover */}
      <div style={{
        height: 110,
        background: tailor.coverImage
          ? `url(${tailor.coverImage}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0F5C5E 0%, #167A7D 100%)',
        position: 'relative',
        display: 'flex', alignItems: 'flex-end', padding: '0 16px 12px',
      }}>
        {isVerified && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: '#3F7D5A', color: '#FFFFFF',
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            ✓ Verified Tailor
          </div>
        )}
      </div>
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#0F5C5E' }}>
          {tailor.shopName || tailor.name}
        </h3>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#667085' }}>
          📍 {tailor.location || 'Chennai'} {tailor.computedDistance ? `• ${tailor.computedDistance} km away` : ''}
        </p>
        <div style={{ fontSize: '12px', color: '#3F7D5A', fontWeight: 600 }}>
          ⭐ {tailor.rating || 4.8} ({tailor.reviewCount || 12} reviews)
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid #E3E8E6', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ height: 110, background: 'linear-gradient(90deg, #F2F6F5 25%, #E8EFF7 50%, #F2F6F5 75%)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: '14px 16px' }}>
        {[80, 60, 40].map(w => (
          <div key={w} style={{ height: 12, background: '#F2F6F5', borderRadius: 6, marginBottom: 10, width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF',
      animation: 'spin 0.8s linear infinite', display: 'inline-block',
    }} />
  )
}

const labelStyle = {
  display: 'block', fontSize: 12.5, fontWeight: 600, color: '#1F2937', marginBottom: 6,
}
const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #E3E8E6',
  borderRadius: 8, fontSize: 13.5, color: '#1F2937', background: '#FFFFFF', outline: 'none',
}
const selectStyle = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #E3E8E6',
  borderRadius: 8, fontSize: 13.5, color: '#1F2937', background: '#FFFFFF', outline: 'none',
  appearance: 'auto',
}
const pageBtn = {
  background: '#FFFFFF', color: '#0F5C5E', border: '1.5px solid #E3E8E6',
  padding: '8px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
}
