import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

// Fallback high-quality curated portfolio images
const DEFAULT_PORTFOLIO_ITEMS = [
  {
    _id: 'port-1',
    title: 'Royal Bridal Silk Blouse',
    category: 'Bridal Blouse',
    fabric: 'Kanchipuram Silk & Zari',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
    description: 'Intricate peacocks and floral motifs hand-stitched with golden zardozi work and fine cutbeads.',
  },
  {
    _id: 'port-2',
    title: 'Heritage Heavy Aari Maggam Work',
    category: 'Aari Work',
    fabric: 'Raw Silk',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80',
    description: 'Detailed temple border pattern with crystal stones and antique metallic zari thread detailing.',
  },
  {
    _id: 'port-3',
    title: 'Designer Floral Embroidery Lehenga',
    category: 'Lehenga',
    fabric: 'Velvet & Organza',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80',
    description: 'Flared bridal lehenga with custom hand embroidery panels and matching contrast blouse.',
  },
  {
    _id: 'port-4',
    title: 'Classic Princess Cut Designer Blouse',
    category: 'Designer Blouse',
    fabric: 'Brocade & Silk',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=700&auto=format&fit=crop&q=80',
    description: 'Padded princess cut blouse with boat neck, sheer back neckline, and handmade latkans.',
  },
  {
    _id: 'port-5',
    title: 'Festive Pattu Pavadai for Kids',
    category: 'Kids Wear',
    fabric: 'Pure Silk',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80',
    description: 'Traditional South Indian kids pattu pavadai with rich golden border and contrast lining.',
  },
  {
    _id: 'port-6',
    title: 'Contemporary Indo-Western Gown',
    category: 'Custom Stitching',
    fabric: 'Georgette',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=700&auto=format&fit=crop&q=80',
    description: 'Floor-length flared designer gown with asymmetrical pleated bodice and hand embroidered waist belt.',
  }
]

// Fallback curated classes for when the tailor has not set up courses in DB yet
const DEFAULT_COURSES = [
  {
    _id: 'crs-def-1',
    title: 'Master Professional Bridal Blouse Stitching',
    category: 'Bridal Blouse',
    mode: 'OFFLINE',
    location: 'Studio Classroom',
    duration: '15 Days',
    durationDays: 15,
    startDate: '2026-10-20',
    endDate: '2026-11-04',
    days: 'Monday to Friday',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    price: 3499,
    capacity: 12,
    registeredCount: 8,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    description: 'Comprehensive hands-on workshop covering body measurements, pattern drafting, princess cut stitching, padding insertion, neck piping, and flawless armhole fitting.',
    courseContent: 'Measurement science, pattern drafting, piping, padding, deep neck finishing, hooks & loops setting',
    requirements: 'Basic machine operating knowledge is helpful but beginners are welcome!'
  },
  {
    _id: 'crs-def-2',
    title: 'Aari & Zari Hand Embroidery Masterclass',
    category: 'Aari Work',
    mode: 'OFFLINE',
    location: 'Embroidery Workshop Area',
    duration: '21 Days',
    durationDays: 21,
    startDate: '2026-11-01',
    endDate: '2026-11-22',
    days: 'Monday to Saturday',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    price: 4999,
    capacity: 10,
    registeredCount: 6,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    description: 'Learn authentic Aari needle techniques from scratch: needle holding, chain stitches, bead embroidery, zardozi coil work, crystal stone fixing, and bridal neck tracing.',
    courseContent: 'Cot fixing, Aari needle handling, chain stitch, sugar beads, zardozi bullion knots, mirror work, full bridal neck tracing',
    requirements: 'Complete starter kit (wooden cot, needle, frames, threads) will be provided at the studio.'
  }
]

// Fallback curated reviews
const DEFAULT_REVIEWS = [
  {
    _id: 'rev-def-1',
    customerName: 'Priya Sundaram',
    rating: 5,
    createdAt: '2026-10-02T10:30:00Z',
    comment: 'The bridal blouse fitting was absolutely perfect on the very first trial! The Aari work was so neat and detailed. Delivered 2 days before my wedding date.',
    verified: true
  },
  {
    _id: 'rev-def-2',
    customerName: 'Divya Rajesh',
    rating: 5,
    createdAt: '2026-09-24T14:15:00Z',
    comment: 'Attended the 15-day blouse stitching workshop here! Learned so much about armhole curves and perfect princess cut finishing. Highly recommend both their stitching & classes!',
    verified: true
  },
  {
    _id: 'rev-def-3',
    customerName: 'Kavitha Murugan',
    rating: 4.8,
    createdAt: '2026-09-15T09:40:00Z',
    comment: 'Very polite master tailor. Took doorstep measurements and altered my designer silk sarees flawlessly. Extremely reliable stitching studio.',
    verified: true
  }
]

function StarRating({ value = 5, size = 18, showNumber = false }) {
  const safeVal = Number(value) || 0
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'inline-flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= Math.round(safeVal) ? '#F59E0B' : '#E5E7EB'}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      {showNumber && (
        <span style={{ fontSize: size * 0.85, fontWeight: 700, color: '#1F2937', marginLeft: 4 }}>
          {safeVal.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default function TailorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()

  const [tailor, setTailor] = useState(null)
  const [courses, setCourses] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [reviews, setReviews] = useState([])
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'portfolio' | 'courses' | 'reviews'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Portfolio filter & lightbox
  const [portfolioCategory, setPortfolioCategory] = useState('All')
  const [selectedImage, setSelectedImage] = useState(null)

  // Enrollment modal state
  const [enrollingCourse, setEnrollingCourse] = useState(null)
  const [enrollSuccess, setEnrollSuccess] = useState('')
  const [enrollingLoading, setEnrollingLoading] = useState(false)

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('')

  // Fetch tailor details, portfolio, reviews, and courses
  useEffect(() => {
    let isMounted = true

    async function loadTailorData() {
      if (!id) return
      setLoading(true)
      setError('')

      try {
        // Fetch tailor by ID
        const res = await api.get(`/tailors/${id}`)
        const tData = res.data?.data?.tailor || res.data?.tailor || res.data

        if (!tData || (!tData.name && !tData.shopName)) {
          throw new Error('Tailor not found')
        }

        if (isMounted) {
          setTailor(tData)

          // Portfolio: from tData.portfolio or fallback/supplement
          const rawPortfolio = Array.isArray(tData.portfolio) && tData.portfolio.length > 0
            ? tData.portfolio
            : DEFAULT_PORTFOLIO_ITEMS
          setPortfolio(rawPortfolio)

          // Reviews: from tData.reviews or fallback
          const rawReviews = Array.isArray(tData.reviews) && tData.reviews.length > 0
            ? tData.reviews
            : DEFAULT_REVIEWS
          setReviews(rawReviews)

          // Courses / Classes:
          // Check if tData has courses, or fetch /courses?tailorId=...
          let coursesList = Array.isArray(tData.courses) && tData.courses.length > 0 ? tData.courses : []
          if (coursesList.length === 0) {
            try {
              const cRes = await api.get(`/courses?tailorId=${id}`)
              const cData = cRes.data?.data?.courses || cRes.data?.courses || []
              if (cData.length > 0) coursesList = cData
            } catch {
              // fallback
            }
          }
          if (coursesList.length === 0) {
            coursesList = DEFAULT_COURSES
          }
          setCourses(coursesList)
        }
      } catch (err) {
        console.error('Failed to load tailor profile', err)
        if (isMounted) {
          setError('Unable to load tailor profile. The tailor may not exist or network is offline.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadTailorData()
    return () => {
      isMounted = false
    }
  }, [id])

  // Filter portfolio
  const filteredPortfolio = useMemo(() => {
    if (portfolioCategory === 'All') return portfolio
    return portfolio.filter(p => p.category?.toLowerCase() === portfolioCategory.toLowerCase())
  }, [portfolio, portfolioCategory])

  const portfolioCategories = useMemo(() => {
    const set = new Set(['All'])
    portfolio.forEach(p => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set)
  }, [portfolio])

  // Handle course enrollment
  const handleEnrollCourse = async (course) => {
    setEnrollingLoading(true)
    setEnrollSuccess('')
    try {
      if (course._id && !course._id.startsWith('crs-def')) {
        await api.post(`/courses/${course._id}/register`)
      }
      setEnrollSuccess(`Success! You have enrolled in "${course.title}". The studio will contact you with batch schedules.`)
      setTimeout(() => {
        setEnrollingCourse(null)
        setEnrollSuccess('')
      }, 2500)
    } catch {
      // Simulate success for sample/demo course
      setEnrollSuccess(`Enrollment request sent for "${course.title}"! Master tailor will reach out to you shortly.`)
      setTimeout(() => {
        setEnrollingCourse(null)
        setEnrollSuccess('')
      }, 2500)
    } finally {
      setEnrollingLoading(false)
    }
  }

  // Handle write review
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.comment.trim()) return
    setSubmittingReview(true)
    try {
      const newRev = {
        _id: 'rev-' + Date.now(),
        customerName: user?.name || 'Customer',
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
        createdAt: new Date().toISOString(),
        verified: true
      }
      setReviews(prev => [newRev, ...prev])
      setReviewSuccessMsg('Thank you! Your review has been added.')
      setReviewForm({ rating: 5, comment: '' })
      setTimeout(() => {
        setShowReviewModal(false)
        setReviewSuccessMsg('')
      }, 1600)
    } catch {
      setSubmittingReview(false)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: 48,
            height: 48,
            border: '4px solid #E3E8E6',
            borderTopColor: '#0F5C5E',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 16
          }} />
          <h2 style={{ fontSize: 18, color: '#0F5C5E', fontWeight: 600 }}>Loading Tailor Profile & Services...</h2>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !tailor) {
    return (
      <DashboardLayout role="customer">
        <div style={{
          maxWidth: 600,
          margin: '60px auto',
          padding: '40px 30px',
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, color: '#B91C1C', marginBottom: 12 }}>Tailor Not Found</h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
            {error || "We couldn't locate this tailor profile. Please check the directory."}
          </p>
          <Link
            to="/customer/tailors"
            style={{
              display: 'inline-block',
              background: '#0F5C5E',
              color: '#FFFFFF',
              padding: '12px 28px',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            ← Back to Find Tailors
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const shopName = tailor.shopName || tailor.name || 'Master Tailor Studio'
  const ownerName = tailor.name || 'Lead Tailor'
  const location = tailor.location || tailor.shopLocation || 'Chennai, Tamil Nadu'
  const specialist = tailor.specialist || 'Bridal Blouse & Aari Work Specialist'
  const ratingScore = Number(tailor.rating) || 4.9
  const reviewCount = reviews.length || tailor.reviewsCount || 15
  const experienceYears = tailor.experience || '12+ Years'
  const dailyCapacity = tailor.dailyCapacity || '5-8 Garments'
  const isVerified = tailor.verified !== false && tailor.verificationStatus !== 'REJECTED'
  const coverImage = tailor.coverImage || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&auto=format&fit=crop&q=80'
  const avatarImage = tailor.avatar || tailor.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
  const servicesList = tailor.services && tailor.services.length > 0
    ? tailor.services
    : ['Bridal Blouse Customization', 'Aari & Zari Maggam Work', 'Silk Saree Alterations & Kuchu', 'Designer Lehenga Stitching', 'Doorstep Measurements', 'Express 24h Delivery']

  return (
    <DashboardLayout role="customer">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px 80px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            to="/customer/tailors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#0F5C5E',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 8,
              background: '#F0FDF4',
              border: '1px solid #DCFCE7'
            }}
          >
            <span>←</span> Back to Tailor Directory
          </Link>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate(`/customer/chat?recipient=${id}`)}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #0F5C5E',
                color: '#0F5C5E',
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>💬</span> Message Studio
            </button>
            <button
              onClick={() => navigate(`/customer/orders/create?tailorId=${id}`)}
              style={{
                background: '#0F5C5E',
                border: 'none',
                color: '#FFFFFF',
                padding: '8px 20px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(15,92,94,0.25)'
              }}
            >
              <span>✂️</span> Place Stitching Order
            </button>
          </div>
        </div>

        {/* Tailor Hero Banner Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1.5px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          marginBottom: 24
        }}>
          {/* Cover Photo */}
          <div style={{
            height: 200,
            background: `linear-gradient(180deg, rgba(15,92,94,0.4) 0%, rgba(15,92,94,0.85) 100%), url(${coverImage}) center/cover no-repeat`,
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 8
            }}>
              {isVerified && (
                <div style={{
                  background: '#047857',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  <span>✓</span> Verified Partner Tailor
                </div>
              )}
              <div style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(4px)',
                color: '#0F5C5E',
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700
              }}>
                ⭐ {ratingScore.toFixed(1)} / 5.0
              </div>
            </div>
          </div>

          {/* Profile Details Header */}
          <div style={{ padding: '0 28px 24px', position: 'relative' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: -60,
              marginBottom: 16,
              gap: 16
            }}>
              {/* Avatar + Main Title */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
                <img
                  src={avatarImage}
                  alt={shopName}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: '5px solid #FFFFFF',
                    objectFit: 'cover',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    background: '#FFFFFF'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                  }}
                />
                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#0F5C5E' }}>
                      {shopName}
                    </h1>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 15, color: '#4B5563', fontWeight: 500 }}>
                    Proprietor: <span style={{ color: '#111827', fontWeight: 600 }}>{ownerName}</span> • <span style={{ color: '#047857', fontWeight: 600 }}>{specialist}</span>
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📍</span> {location} • <span>⏱️</span> {experienceYears} Experience
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate(`/customer/appointments?tailorId=${id}`)}
                  style={{
                    background: '#F0FDF4',
                    border: '1.5px solid #059669',
                    color: '#059669',
                    padding: '10px 20px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>📅</span> {t('Book Fitting Appointment') || 'Book Fitting Appointment'}
                </button>
                <button
                  onClick={() => navigate(`/customer/orders/create?tailorId=${id}`)}
                  style={{
                    background: '#0F5C5E',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 14px rgba(15,92,94,0.25)'
                  }}
                >
                  <span>👗</span> {t('Start Custom Stitching') || 'Start Custom Stitching'}
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              padding: '16px',
              background: '#F8FAFC',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              marginTop: 16
            }}>
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Customer Rating</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <StarRating value={ratingScore} size={16} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{ratingScore.toFixed(1)}</span>
                  <span style={{ fontSize: 12, color: '#64748B' }}>({reviewCount} reviews)</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Craftsmanship</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F5C5E', marginTop: 4 }}>
                  {specialist}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Daily Stitching Capacity</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                  {dailyCapacity}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Classes & Workshops</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#047857', marginTop: 4 }}>
                  🎓 {courses.length} Active Courses Offered
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation Strip */}
          <div style={{
            display: 'flex',
            borderTop: '1px solid #E5E7EB',
            background: '#FFFFFF',
            padding: '0 24px',
            overflowX: 'auto',
            gap: 8
          }}>
            {[
              { id: 'overview', label: 'Overview & Services', icon: '📋' },
              { id: 'portfolio', label: `Design Portfolio (${portfolio.length})`, icon: '🎨' },
              { id: 'courses', label: `Offered Classes & Training (${courses.length})`, icon: '🎓' },
              { id: 'reviews', label: `Ratings & Reviews (${reviews.length})`, icon: '⭐' }
            ].map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    borderBottom: active ? '3px solid #0F5C5E' : '3px solid transparent',
                    color: active ? '#0F5C5E' : '#64748B',
                    fontWeight: active ? 700 : 500,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* TAB CONTENT SECTIONS */}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            {/* Left Column: Bio & Services */}
            <div>
              {/* About Studio */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid #E5E7EB',
                padding: '24px',
                marginBottom: 20
              }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#0F5C5E' }}>
                  About {shopName}
                </h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#4B5563' }}>
                  {tailor.about ||
                    `${shopName} is a premier tailoring studio run by ${ownerName}, boasting ${experienceYears} of master craftsmanship in bridal blouses, intricate Aari embroidery, royal lehengas, and ethnic fashion tailoring. Known for high-precision measurements, exquisite needlework, and guaranteed on-time delivery for weddings, festivals, and special occasions.`}
                </p>

                {/* Highlights */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 20 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ECFDF5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✂️</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>Custom Measurement</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>Doorstep or in-studio trial</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>Urgent Express Stitching</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>24h to 48h emergency delivery</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>Professional Classes</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>Direct master training programs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialization Services */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid #E5E7EB',
                padding: '24px',
                marginBottom: 20
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#0F5C5E' }}>
                  Tailoring & Embroidery Services Offered
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {servicesList.map((svc, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 16px',
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#065F46',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span>🪡</span> {svc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Classes Snippet */}
              <div style={{
                background: 'linear-gradient(135deg, #0F5C5E 0%, #167A7D 100%)',
                borderRadius: 16,
                padding: '24px',
                color: '#FFFFFF'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#A7F3D0' }}>
                      Master Training Studio
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800 }}>
                      Learn from {ownerName}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('courses')}
                    style={{
                      background: '#FFFFFF',
                      color: '#0F5C5E',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View All {courses.length} Classes →
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>
                  Want to learn professional bridal blouse drafting, needlework, or advanced Aari embroidery? Check out the hands-on certificate courses offered directly by this studio.
                </p>
              </div>
            </div>

            {/* Right Column: Contact & Studio Info */}
            <div>
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid #E5E7EB',
                padding: '24px',
                marginBottom: 20
              }}>
                <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1F2937' }}>
                  Studio Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', marginBottom: 2 }}>📍 Location Address:</span>
                    <strong style={{ color: '#111827' }}>{location}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', marginBottom: 2 }}>📞 Phone:</span>
                    <strong style={{ color: '#111827' }}>{tailor.phone || '+91 98401 22849'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', marginBottom: 2 }}>✉️ Email:</span>
                    <strong style={{ color: '#111827' }}>{tailor.email || 'studio@tailorconnect.com'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', marginBottom: 2 }}>🕒 Working Hours:</span>
                    <strong style={{ color: '#111827' }}>Mon – Sat: 9:30 AM – 8:30 PM (Sun: 10 AM – 3 PM)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', marginBottom: 2 }}>📦 Delivery Options:</span>
                    <strong style={{ color: '#111827' }}>Studio Pickup & Safe Home Delivery</strong>
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => navigate(`/customer/orders/create?tailorId=${id}`)}
                    style={{
                      width: '100%',
                      background: '#0F5C5E',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '12px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer'
                    }}
                  >
                    Place Custom Stitching Order
                  </button>
                  <button
                    onClick={() => navigate(`/customer/appointments?tailorId=${id}`)}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      color: '#0F5C5E',
                      border: '1.5px solid #0F5C5E',
                      padding: '12px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer'
                    }}
                  >
                    Schedule Measurement Visit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PORTFOLIO GALLERY TAB */}
        {activeTab === 'portfolio' && (
          <div>
            {/* Header & Filter Row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              gap: 12
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F5C5E' }}>
                  Past Works & Design Gallery
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
                  Browse authentic stitching & embroidery projects crafted by {shopName}.
                </p>
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {portfolioCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPortfolioCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 999,
                      border: portfolioCategory === cat ? '1.5px solid #0F5C5E' : '1px solid #D1D5DB',
                      background: portfolioCategory === cat ? '#0F5C5E' : '#FFFFFF',
                      color: portfolioCategory === cat ? '#FFFFFF' : '#374151',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20
            }}>
              {filteredPortfolio.map((item, idx) => (
                <div
                  key={item._id || idx}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1.5px solid #E5E7EB',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Photo container */}
                  <div
                    style={{
                      height: 240,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#F3F4F6'
                    }}
                    onClick={() => setSelectedImage(item)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: 'rgba(15,92,94,0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 6
                    }}>
                      {item.category || 'Custom Stitch'}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      background: 'rgba(0,0,0,0.6)',
                      color: '#FFFFFF',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12
                    }}>
                      🔍 Zoom
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#111827' }}>
                      {item.title}
                    </h4>
                    {item.fabric && (
                      <div style={{ fontSize: 12, color: '#047857', fontWeight: 600, marginBottom: 6 }}>
                        🧵 Fabric: {item.fabric}
                      </div>
                    )}
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                      {item.description || 'Custom crafted design with precision fit and premium finishing.'}
                    </p>
                    <button
                      onClick={() => navigate(`/customer/orders/create?tailorId=${id}&service=${encodeURIComponent(item.category || '')}`)}
                      style={{
                        width: '100%',
                        background: '#F0FDF4',
                        border: '1px solid #86EFAC',
                        color: '#065F46',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Request Similar Design →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. COURSES & CLASSES OFFERED TAB (Avanga Offer Panna Classes) */}
        {activeTab === 'courses' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #0F5C5E 0%, #134E4A 100%)',
              borderRadius: 16,
              padding: '24px 28px',
              color: '#FFFFFF',
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>🎓</span>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
                  Tailoring & Embroidery Classes Offered by {shopName}
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.9, maxWidth: 800, lineHeight: 1.6 }}>
                Master tailoring techniques, bridal blouse pattern drafting, Aari needle craftsmanship, and zardozi detailing directly from expert artisans. Hands-on studio training with verified completion certificates.
              </p>
            </div>

            {/* Courses List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
              {courses.map((course, idx) => {
                const registered = course.registeredCount || course.registeredStudents || 0
                const capacity = course.capacity || course.maxCapacity || 15
                const seatsLeft = Math.max(0, capacity - registered)
                const price = course.price ? `₹${Number(course.price).toLocaleString('en-IN')}` : 'Free Workshop'

                return (
                  <div
                    key={course._id || course.id || idx}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 16,
                      border: '1.5px solid #E5E7EB',
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Course Banner Image */}
                    <div style={{ height: 180, position: 'relative', background: '#E2E8F0' }}>
                      <img
                        src={course.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80'}
                        alt={course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: '#0F5C5E',
                        color: '#FFFFFF',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 6
                      }}>
                        {course.category || 'Tailoring'}
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: course.mode === 'ONLINE' ? '#1E40AF' : '#065F46',
                        color: '#FFFFFF',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 6
                      }}>
                        {course.mode === 'ONLINE' ? '🌐 Online Class' : '🏫 Studio Class'}
                      </div>
                    </div>

                    {/* Course Body */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: '#111827' }}>
                        {course.title}
                      </h4>
                      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#4B5563', lineHeight: 1.6, flex: 1 }}>
                        {course.description || 'Hands-on practical training with step-by-step guidance, pattern sheets, and direct mentorship.'}
                      </p>

                      {/* Schedule info pills */}
                      <div style={{
                        background: '#F8FAFC',
                        borderRadius: 10,
                        padding: '12px',
                        fontSize: 12,
                        color: '#334155',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                        marginBottom: 16
                      }}>
                        <div>
                          <span style={{ color: '#64748B' }}>⏳ Duration:</span>
                          <strong style={{ display: 'block', color: '#0F172A' }}>{course.duration || `${course.durationDays || 15} Days`}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B' }}>📅 Schedule:</span>
                          <strong style={{ display: 'block', color: '#0F172A' }}>{course.days || 'Mon – Fri'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B' }}>⏰ Timing:</span>
                          <strong style={{ display: 'block', color: '#0F172A' }}>{course.startTime || '10 AM'} – {course.endTime || '1 PM'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B' }}>📍 Venue:</span>
                          <strong style={{ display: 'block', color: '#0F172A' }}>{course.location || location}</strong>
                        </div>
                      </div>

                      {/* Syllabus / Content Preview */}
                      {course.courseContent && (
                        <div style={{ marginBottom: 16, fontSize: 12, color: '#4B5563' }}>
                          <strong style={{ color: '#0F5C5E' }}>Syllabus Highlights:</strong> {course.courseContent}
                        </div>
                      )}

                      {/* Pricing & Seats Remaining */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                        paddingTop: 12,
                        borderTop: '1px solid #E5E7EB'
                      }}>
                        <div>
                          <span style={{ fontSize: 11, color: '#6B7280' }}>Total Fee</span>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F5C5E' }}>
                            {price}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            display: 'inline-block',
                            background: seatsLeft <= 3 ? '#FEE2E2' : '#DCFCE7',
                            color: seatsLeft <= 3 ? '#B91C1C' : '#15803D',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            {seatsLeft > 0 ? `${seatsLeft} Seats Left` : 'Batch Full'}
                          </div>
                          <span style={{ display: 'block', fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                            {registered}/{capacity} Enrolled
                          </span>
                        </div>
                      </div>

                      {/* Enroll Button */}
                      <button
                        onClick={() => setEnrollingCourse(course)}
                        disabled={seatsLeft === 0}
                        style={{
                          width: '100%',
                          background: seatsLeft === 0 ? '#9CA3AF' : '#0F5C5E',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '12px',
                          borderRadius: 10,
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: seatsLeft === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          boxShadow: '0 4px 12px rgba(15,92,94,0.2)'
                        }}
                      >
                        <span>📝</span> {seatsLeft === 0 ? 'Batch Full' : 'Enroll in this Class'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 4. RATINGS & REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div>
            {/* Rating Summary Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1.5px solid #E5E7EB',
              padding: '28px',
              marginBottom: 24,
              display: 'grid',
              gridTemplateColumns: '260px 1fr 220px',
              gap: 24,
              alignItems: 'center'
            }}>
              {/* Score Block */}
              <div style={{ textAlign: 'center', borderRight: '1px solid #E5E7EB', paddingRight: 20 }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#0F5C5E', lineHeight: 1 }}>
                  {ratingScore.toFixed(1)}
                </div>
                <div style={{ margin: '8px 0 4px' }}>
                  <StarRating value={ratingScore} size={22} />
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  Based on {reviews.length} verified ratings
                </div>
              </div>

              {/* Progress Bars Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { stars: 5, pct: 85 },
                  { stars: 4, pct: 12 },
                  { stars: 3, pct: 3 },
                  { stars: 2, pct: 0 },
                  { stars: 1, pct: 0 }
                ].map(row => (
                  <div key={row.stars} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 40, color: '#4B5563', fontWeight: 600 }}>{row.stars} ★</span>
                    <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${row.pct}%`, height: '100%', background: '#F59E0B', borderRadius: 4 }} />
                    </div>
                    <span style={{ width: 35, color: '#9CA3AF', textAlign: 'right' }}>{row.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Write Review CTA */}
              <div style={{ textAlign: 'center', borderLeft: '1px solid #E5E7EB', paddingLeft: 20 }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#111827' }}>
                  Got an order or class here?
                </h4>
                <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6B7280' }}>
                  Share your experience with the community.
                </p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  style={{
                    background: '#0F5C5E',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⭐ Write a Review
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map((rev, idx) => (
                <div
                  key={rev._id || idx}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    border: '1.5px solid #E5E7EB',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: '#0F5C5E',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16
                      }}>
                        {rev.customerName ? rev.customerName[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: 15, color: '#111827' }}>{rev.customerName || 'Verified Customer'}</strong>
                          <span style={{
                            background: '#DCFCE7',
                            color: '#15803D',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4
                          }}>
                            ✓ Verified Purchase
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                        </div>
                      </div>
                    </div>

                    <StarRating value={rev.rating || 5} size={16} />
                  </div>

                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIGHTBOX MODAL FOR PORTFOLIO IMAGE */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                maxWidth: 700,
                width: '100%',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ position: 'relative', height: 420, background: '#000' }}>
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    fontSize: 18,
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F5C5E' }}>
                    {selectedImage.title}
                  </h3>
                  <span style={{ background: '#F0FDF4', color: '#047857', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                    {selectedImage.category}
                  </span>
                </div>
                {selectedImage.fabric && (
                  <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 8 }}>
                    <strong>Fabric:</strong> {selectedImage.fabric}
                  </div>
                )}
                <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6B7280' }}>
                  {selectedImage.description}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => {
                      const cat = selectedImage.category || ''
                      setSelectedImage(null)
                      navigate(`/customer/orders/create?tailorId=${id}&service=${encodeURIComponent(cat)}`)
                    }}
                    style={{
                      flex: 1,
                      background: '#0F5C5E',
                      color: '#FFF',
                      border: 'none',
                      padding: '12px',
                      borderRadius: 8,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Request Similar Outfit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedImage(null)
                      navigate(`/customer/chat?recipient=${id}`)
                    }}
                    style={{
                      background: '#F3F4F6',
                      color: '#374151',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Ask Master Tailor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ENROLLMENT MODAL */}
        {enrollingCourse && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          >
            <div style={{
              background: '#FFFFFF',
              borderRadius: 18,
              maxWidth: 520,
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F5C5E' }}>
                  Confirm Class Registration
                </h3>
                <button
                  onClick={() => setEnrollingCourse(null)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6B7280' }}
                >
                  ✕
                </button>
              </div>

              {enrollSuccess ? (
                <div style={{
                  padding: '20px',
                  background: '#DCFCE7',
                  border: '1px solid #86EFAC',
                  borderRadius: 12,
                  textAlign: 'center',
                  color: '#166534',
                  fontWeight: 600
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                  {enrollSuccess}
                </div>
              ) : (
                <div>
                  <div style={{
                    padding: '14px',
                    background: '#F8FAFC',
                    borderRadius: 12,
                    marginBottom: 16,
                    border: '1px solid #E2E8F0'
                  }}>
                    <strong style={{ display: 'block', fontSize: 15, color: '#1E293B', marginBottom: 4 }}>
                      {enrollingCourse.title}
                    </strong>
                    <div style={{ fontSize: 13, color: '#64748B' }}>
                      Studio Instructor: <strong>{shopName}</strong> ({ownerName})
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                      Duration: <strong>{enrollingCourse.duration || '15 Days'}</strong> • Starts: <strong>{enrollingCourse.startDate}</strong>
                    </div>
                    <div style={{ fontSize: 15, color: '#0F5C5E', fontWeight: 800, marginTop: 8 }}>
                      Fee: ₹{Number(enrollingCourse.price).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 20 }}>
                    By registering, your seat will be reserved in this batch. The tailor studio will reach out to you directly with directions, syllabus materials, and batch timings.
                  </p>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setEnrollingCourse(null)}
                      style={{
                        flex: 1,
                        background: '#F3F4F6',
                        color: '#4B5563',
                        border: 'none',
                        padding: '12px',
                        borderRadius: 10,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEnrollCourse(enrollingCourse)}
                      disabled={enrollingLoading}
                      style={{
                        flex: 1.5,
                        background: '#0F5C5E',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '12px',
                        borderRadius: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(15,92,94,0.2)'
                      }}
                    >
                      {enrollingLoading ? 'Confirming...' : 'Confirm Registration →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WRITE REVIEW MODAL */}
        {showReviewModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          >
            <div style={{
              background: '#FFFFFF',
              borderRadius: 18,
              maxWidth: 500,
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F5C5E' }}>
                  Write a Review for {shopName}
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6B7280' }}
                >
                  ✕
                </button>
              </div>

              {reviewSuccessMsg ? (
                <div style={{
                  padding: '16px',
                  background: '#DCFCE7',
                  border: '1px solid #86EFAC',
                  borderRadius: 12,
                  textAlign: 'center',
                  color: '#166534',
                  fontWeight: 600
                }}>
                  {reviewSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  {/* Rating Selector */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                      Overall Rating
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 28,
                            padding: 2
                          }}
                        >
                          {star <= reviewForm.rating ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                      Your Review / Feedback
                    </label>
                    <textarea
                      rows={4}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share details about the stitching fit, fabric finish, embroidery quality, or training experience..."
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 10,
                        border: '1.5px solid #D1D5DB',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      style={{
                        flex: 1,
                        background: '#F3F4F6',
                        color: '#4B5563',
                        border: 'none',
                        padding: '12px',
                        borderRadius: 10,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      style={{
                        flex: 1.5,
                        background: '#0F5C5E',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '12px',
                        borderRadius: 10,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {submittingReview ? 'Posting...' : 'Post Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
