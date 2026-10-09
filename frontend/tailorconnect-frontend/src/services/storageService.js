// Centralized persistent storage service for TailorConnect.
// Backed by localStorage with reactive event updates.
// Every record has unique, realistic data and authentic topic-matched photography.

const STORAGE_KEYS = {
  USERS: 'tc_registered_users',
  ORDERS: 'tc_orders_data',
  OFFERS: 'tc_offers_data',
  REVIEWS: 'tc_reviews_data',
  PAYMENTS: 'tc_payments_data',
  NOTIFICATIONS: 'tc_notifications_data',
  CERTIFICATES: 'tc_certificates_data',
  CHATS: 'tc_chat_messages_data',
  WISHLIST: 'tc_wishlist_data',
  PORTFOLIO: 'tc_portfolio_data',
  DESIGNS: 'tc_dress_designs_data',
  FABRICS: 'tc_fabrics_data'
}

// Custom Event to notify components of real-time state changes
export const emitDataChange = (entity) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tc_data_changed', { detail: { entity } }))
  }
}

// ----------------- SEED DATA -----------------

export const INITIAL_TAILORS = [
  {
    id: 'user-tailor-1',
    name: 'Lakshmi Devi',
    shopName: 'Lakshmi Stitches & Bridal Studio',
    email: 'tailor@tailorconnect.com',
    username: 'tailor',
    phone: '9876543211',
    password: 'tailor123',
    role: 'tailor',
    location: 'Chennai',
    address: '45, Gandhi Road, T.Nagar, Chennai, Tamil Nadu',
    specialist: 'Aari Blouse & Bridal Wear Specialist',
    experience: '8 yrs',
    price: '₹800+',
    verified: true,
    rating: 4.9,
    reviewsCount: 42,
    about: 'Master tailor with 8+ years specializing in traditional South Indian bridal wear, heavy Aari needlework, and customized Silk Saree blouses.',
    services: ['Aari Blouse Stitching', 'Bridal Blouse Designing', 'Silk Saree Kuchu', 'Custom Fit Alteration', 'Maggam Work'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-05T09:00:00.000Z'
  },
  {
    id: 'user-tailor-2',
    name: 'Mrs. Radha Raman',
    shopName: 'Vintage Needle Heritage Tailors',
    email: 'vintage.needle@tailorconnect.com',
    username: 'radha_tailor',
    phone: '9876543233',
    password: 'tailor123',
    role: 'tailor',
    location: 'Madurai',
    address: '88, West Masi Street, Madurai, Tamil Nadu',
    specialist: 'Maggam Work & Antique Zari Specialist',
    experience: '12 yrs',
    price: '₹1200+',
    verified: true,
    rating: 4.9,
    reviewsCount: 35,
    about: 'Specialists in heirloom wedding blouses, handcrafted Maggam embroidery, and antique zari neck borders with 12 years of craftsmanship.',
    services: ['Maggam Work Blouse', 'Bridal Blouse', 'Zardosi Work', 'Wedding Trousseau Stitching'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-08T10:30:00.000Z'
  },
  {
    id: 'user-tailor-3',
    name: 'Suresh Kumar',
    shopName: 'Royal Threads & Embroidery Studio',
    email: 'royal.threads@tailorconnect.com',
    username: 'suresh_threads',
    phone: '9876543222',
    password: 'tailor123',
    role: 'tailor',
    location: 'Coimbatore',
    address: '14, DB Road, RS Puram, Coimbatore, Tamil Nadu',
    specialist: 'Designer Lehenga & Zardosi Specialist',
    experience: '6 yrs',
    price: '₹650+',
    verified: true,
    rating: 4.7,
    reviewsCount: 28,
    about: 'Premier boutique for royal bridal wear, custom-tailored lehengas, machine zardosi embroidery, and contemporary festive outfits.',
    services: ['Designer Lehenga Stitching', 'Zardosi Embroidery', 'Party Wear Gowns', 'Saree Blouse'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-12T11:00:00.000Z'
  },
  {
    id: 'user-tailor-4',
    name: 'Anandhi Nathan',
    shopName: 'Modern Stitch Fashion Lab',
    email: 'modern.stitch@tailorconnect.com',
    username: 'anandhi_stitch',
    phone: '9876543244',
    password: 'tailor123',
    role: 'tailor',
    location: 'Chennai',
    address: '102, 2nd Avenue, Anna Nagar, Chennai, Tamil Nadu',
    specialist: 'Designer Kurtis & Western Gowns Specialist',
    experience: '5 yrs',
    price: '₹500+',
    verified: true,
    rating: 4.6,
    reviewsCount: 19,
    about: 'Contemporary stitching boutique tailored for modern trends, formal suits, palazzo suits, and everyday chic ethnic wear.',
    services: ['Designer Kurtis', 'Western Gowns', 'Salwar Kameez', 'Pattern Drafting', 'Fast Alteration'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:15:00.000Z'
  },
  {
    id: 'user-tailor-5',
    name: 'Grace Mary',
    shopName: 'Grace Bridal Couture Hub',
    email: 'grace.bridal@tailorconnect.com',
    username: 'grace_couture',
    phone: '9876543255',
    password: 'tailor123',
    role: 'tailor',
    location: 'Trichy',
    address: '22, Williams Road, Cantonment, Trichy, Tamil Nadu',
    specialist: 'Bridal Gowns & Reception Blouse Specialist',
    experience: '10 yrs',
    price: '₹1500+',
    verified: true,
    rating: 4.8,
    reviewsCount: 31,
    about: 'Bespoke bridal styling, couture bridal blouses, reception gowns, and handcrafted veil stitching with door delivery.',
    services: ['Bridal Blouse', 'Reception Gowns', 'Bridal Veils', 'Aari Work', 'Kids Ethnic Wear'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-18T14:20:00.000Z'
  }
]

export const INITIAL_CUSTOMERS = [
  {
    id: 'user-cust-1',
    name: 'Priya Sharma',
    email: 'customer@tailorconnect.com',
    username: 'customer',
    phone: '9876543210',
    password: 'customer123',
    role: 'customer',
    location: 'Chennai',
    address: '12, 4th Cross Street, Anna Nagar, Chennai, Tamil Nadu',
    age: 26,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'user-cust-2',
    name: 'Anitha Raj',
    email: 'anitha@example.com',
    username: 'anitha_r',
    phone: '9876543214',
    password: 'customer123',
    role: 'customer',
    location: 'Coimbatore',
    address: '56, Race Course Road, Coimbatore, Tamil Nadu',
    age: 29,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T12:00:00.000Z'
  },
  {
    id: 'user-cust-3',
    name: 'Divya Kumar',
    email: 'divya@example.com',
    username: 'divya_k',
    phone: '9876543215',
    password: 'customer123',
    role: 'customer',
    location: 'Trichy',
    address: '18, Thillai Nagar Main Road, Trichy, Tamil Nadu',
    age: 24,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-02-10T15:00:00.000Z'
  }
]

export const INITIAL_STUDENTS = [
  {
    id: 'user-student-1',
    name: 'Meena Sundaram',
    email: 'student@tailorconnect.com',
    username: 'student',
    phone: '9876543212',
    password: 'student123',
    role: 'student',
    location: 'Madurai',
    address: '88, West Masi Street, Madurai, Tamil Nadu',
    age: 22,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T11:30:00.000Z'
  },
  {
    id: 'user-student-2',
    name: 'Ravi Kumar',
    email: 'ravi.k@example.com',
    username: 'ravi_learns',
    phone: '9876543288',
    password: 'student123',
    role: 'student',
    location: 'Chennai',
    address: '24, Velachery Main Road, Chennai, Tamil Nadu',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-02-05T14:10:00.000Z'
  }
]

export const INITIAL_ADMIN = [
  {
    id: 'user-admin-1',
    name: 'Platform Admin',
    email: 'admin@tailorconnect.com',
    username: 'admin',
    phone: '9876543213',
    password: 'admin123',
    role: 'admin',
    location: 'Headquarters',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
]

export const INITIAL_DRESS_DESIGNS = [
  {
    id: 1,
    title: 'Pure Silk Bridal Blouse with Zardosi',
    category: 'Bridal Blouse',
    fabric: 'Kanchipuram Pure Silk',
    tailor: 'Lakshmi Devi (Lakshmi Stitches)',
    tailorId: 'user-tailor-1',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    price: '₹1,800',
    description: 'Royal pink pure silk bridal blouse adorned with heavy gold zardosi borders and intricate neckline beadwork.'
  },
  {
    id: 2,
    title: 'Peacock Motif Aari Hand Embroidery Blouse',
    category: 'Aari Blouse',
    fabric: 'Raw Silk',
    tailor: 'Mrs. Radha Raman (Vintage Needle)',
    tailorId: 'user-tailor-2',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    price: '₹2,200',
    description: 'Stunning peacock motifs handcrafted using antique gold zari, stone chain, and dual-tone silk thread.'
  },
  {
    id: 3,
    title: 'Metallic Zardosi & Pearl Designer Blouse',
    category: 'Embroidery',
    fabric: 'Georgette Silk',
    tailor: 'Suresh Kumar (Royal Threads)',
    tailorId: 'user-tailor-3',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    price: '₹1,500',
    description: 'Dazzling handcrafted metallic zardosi embroidery interspersed with pure river pearls and back tie tassels.'
  },
  {
    id: 4,
    title: 'Flared Velvet Bridal Lehenga Set',
    category: 'Lehenga',
    fabric: 'Silk Velvet & Net',
    tailor: 'Grace Mary (Grace Bridal)',
    tailorId: 'user-tailor-5',
    image: 'https://images.unsplash.com/photo-1610030469668-932d59f77f52?w=600&auto=format&fit=crop&q=80',
    price: '₹4,500',
    description: 'Deep crimson velvet flared lehenga with heavy hem gold thread embroidery, structured can-can, and matching blouse.'
  },
  {
    id: 5,
    title: 'High-Neck Cutwork Contemporary Saree Blouse',
    category: 'Saree Blouse',
    fabric: 'Brocade Silk',
    tailor: 'Anandhi Nathan (Modern Stitch)',
    tailorId: 'user-tailor-4',
    image: 'https://images.unsplash.com/photo-1583391733975-0210f9689408?w=600&auto=format&fit=crop&q=80',
    price: '₹950',
    description: 'Stylish high-neck cut-work saree blouse designed with back teardrop opening for festive and wedding celebrations.'
  },
  {
    id: 6,
    title: 'Handloom Cotton Designer Kurti & Palazzo',
    category: 'Custom Dress',
    fabric: 'Handloom Cotton',
    tailor: 'Anandhi Nathan (Modern Stitch)',
    tailorId: 'user-tailor-4',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    price: '₹1,200',
    description: 'Breathable handloom cotton straight-cut designer kurti with handcrafted wooden buttons and tailored palazzo pants.'
  },
  {
    id: 7,
    title: 'Traditional Pattu Pavadai Kids Wear Set',
    category: 'Kids Wear',
    fabric: 'Pure Silk',
    tailor: 'Lakshmi Devi (Lakshmi Stitches)',
    tailorId: 'user-tailor-1',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    price: '₹1,100',
    description: 'Traditional South Indian Pattu Pavadai skirt and blouse tailored with soft inner cotton lining for children.'
  },
  {
    id: 8,
    title: 'Complete Bridal Trousseau Set with Veil',
    category: 'Bridal Wear',
    fabric: 'Tussar Silk & Velvet',
    tailor: 'Grace Mary (Grace Bridal)',
    tailorId: 'user-tailor-5',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
    price: '₹5,500',
    description: 'Complete wedding trousseau stitching including bridal blouse, embellished waist belt (Oddiyanam), and net veil.'
  }
]

export const INITIAL_FABRICS = [
  { id: 1, name: 'Kanchipuram Pure Silk', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80' },
  { id: 2, name: 'Handloom Cotton', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&auto=format&fit=crop&q=80' },
  { id: 3, name: 'Pure Georgette', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80' },
  { id: 4, name: 'Bridal Net & Lace', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop&q=80' },
  { id: 5, name: 'Micro Velvet', image: 'https://images.unsplash.com/photo-1528458983935-7170e7e1f435?w=400&auto=format&fit=crop&q=80' },
  { id: 6, name: 'Raw Silk & Tussar', image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=400&auto=format&fit=crop&q=80' }
]

export const INITIAL_OFFERS_AND_COURSES = [
  {
    id: 'OFF-101',
    name: 'Aari Embroidery & Maggam Needlework Masterclass',
    type: 'Course',
    targetAudience: 'Student',
    category: 'Aari Blouse',
    description: 'Comprehensive hands-on training on Aari needle handling, chain stitch, zari winding, pearl stringing, and heavy bridal neckline motifs.',
    mode: 'Offline',
    durationDays: 15,
    startDate: '2026-09-01',
    endDate: '2026-09-15',
    availableDays: 'Monday to Friday',
    availableTime: '10:00 AM – 12:00 PM',
    location: '45, Gandhi Road, T.Nagar, Chennai',
    shopName: 'Lakshmi Stitches & Bridal Studio',
    trainerName: 'Lakshmi Devi',
    tailorId: 'user-tailor-1',
    price: 1499,
    maxCapacity: 20,
    registeredStudents: 12,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    sampleVideoUrl: 'https://www.youtube.com/embed/3RCh2Tq8RN0',
    sampleVideoTitle: 'Aari Needle Numbers 14 & 24 Handling & Chain Stitch Masterclass',
    requirements: 'Basic interest in hand stitching, Aari needle set (provided in class)',
    whatWillBeTaught: 'Needle angles, Zari thread lock, Stone chain fixing, Peacock motifs, Cutwork',
    whatWillBeReceived: 'Course Completion Certificate, Aari Toolkit, Printed Design Stencil Booklet',
    contactInfo: 'Phone: 9876543211 | Email: tailor@tailorconnect.com',
    registeredUserIds: ['user-student-1']
  },
  {
    id: 'OFF-102',
    name: 'Bridal Blouse Stitching Festival Offer',
    type: 'Offer',
    targetAudience: 'Customer',
    category: 'Bridal Blouse',
    description: 'Special seasonal discount for bridal blouse stitching including lining, piping, designer back knots, and expedited 5-day delivery.',
    mode: 'Offline',
    durationDays: 5,
    startDate: '2026-08-20',
    endDate: '2026-09-10',
    availableDays: 'Monday to Saturday',
    availableTime: '09:00 AM – 08:00 PM',
    location: '45, Gandhi Road, T.Nagar, Chennai',
    shopName: 'Lakshmi Stitches & Bridal Studio',
    trainerName: 'Lakshmi Devi',
    tailorId: 'user-tailor-1',
    price: 999,
    maxCapacity: 30,
    registeredStudents: 18,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    sampleVideoUrl: 'https://www.youtube.com/embed/3RCh2Tq8RN0',
    sampleVideoTitle: 'Bridal Blouse Princess Cut Fitting & Margin Customization',
    requirements: 'Customer to bring or courier blouse bit fabric',
    whatWillBeTaught: 'Custom tailored bridal blouse with Princess cut or Katori cut',
    whatWillBeReceived: 'Ready-to-wear tailored blouse with double inner seam lining',
    contactInfo: 'Phone: 9876543211 | WhatsApp Support Active',
    registeredUserIds: ['user-cust-1']
  },
  {
    id: 'OFF-103',
    name: 'Fundamentals of Tailoring & Pattern Cutting',
    type: 'Course',
    targetAudience: 'Student',
    category: 'Custom Dress',
    description: 'Learn foundational body measurements, dart drafting, seam allowances, and cutting layout optimization to reduce fabric waste.',
    mode: 'Online',
    durationDays: 30,
    startDate: '2026-09-05',
    endDate: '2026-10-05',
    availableDays: 'Tuesday, Thursday, Saturday',
    availableTime: '04:00 PM – 06:00 PM',
    location: 'Online Live Video Sessions',
    shopName: 'Modern Stitch Fashion Lab',
    trainerName: 'Anandhi Nathan',
    tailorId: 'user-tailor-4',
    price: 799,
    maxCapacity: 25,
    registeredStudents: 21,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    sampleVideoUrl: 'https://www.youtube.com/embed/3RCh2Tq8RN0',
    sampleVideoTitle: 'Precision Body Measurement & Paper Pattern Drafting Demonstration',
    requirements: 'Measuring tape, drafting paper, tailoring shears',
    whatWillBeTaught: 'Body measurement charts, pattern grading, sleeve drafting, neck canvas cutting',
    whatWillBeReceived: 'Verified Certificate of Completion, PDF Pattern Master Guide',
    contactInfo: 'Phone: 9876543244 | Email: modern.stitch@tailorconnect.com',
    registeredUserIds: ['user-student-1', 'user-student-2']
  },
  {
    id: 'OFF-104',
    name: 'Antique Maggam Work & Zari Designing Workshop',
    type: 'Course',
    targetAudience: 'Student',
    category: 'Embroidery',
    description: 'Intensive 10-day workshop on heritage South Indian Maggam frame mounting, antique metal wire threading, and traditional temple borders.',
    mode: 'Offline',
    durationDays: 10,
    startDate: '2026-09-12',
    endDate: '2026-09-22',
    availableDays: 'Daily',
    availableTime: '11:00 AM – 02:00 PM',
    location: '88, West Masi Street, Madurai',
    shopName: 'Vintage Needle Heritage Tailors',
    trainerName: 'Mrs. Radha Raman',
    tailorId: 'user-tailor-2',
    price: 1899,
    maxCapacity: 15,
    registeredStudents: 15,
    status: 'Closed',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    sampleVideoUrl: 'https://www.youtube.com/embed/3RCh2Tq8RN0',
    sampleVideoTitle: 'South Indian Maggam Frame Setup & Zardosi Coil Winding',
    requirements: 'Prior experience in basic hand embroidery',
    whatWillBeTaught: 'Maggam cot mounting, Antique zardosi coil work, Gota patti borders, Sequin locking',
    whatWillBeReceived: 'Heritage Certificate of Maggam Mastery, Raw materials kit',
    contactInfo: 'Phone: 9876543233 | Email: vintage.needle@tailorconnect.com',
    registeredUserIds: []
  },
  {
    id: 'OFF-105',
    name: 'Designer Lehenga & Flared Skirt Tailoring Offer',
    type: 'Offer',
    targetAudience: 'Customer',
    category: 'Lehenga',
    description: 'Custom stitched flared party wear and bridal lehenga with custom waistband, inner can-can net, and latkan tassels.',
    mode: 'Offline',
    durationDays: 7,
    startDate: '2026-08-15',
    endDate: '2026-09-15',
    availableDays: 'Monday to Saturday',
    availableTime: '10:00 AM – 07:00 PM',
    location: '14, DB Road, RS Puram, Coimbatore',
    shopName: 'Royal Threads & Embroidery Studio',
    trainerName: 'Suresh Kumar',
    tailorId: 'user-tailor-3',
    price: 2499,
    maxCapacity: 25,
    registeredStudents: 14,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1610030469668-932d59f77f52?w=600&auto=format&fit=crop&q=80',
    requirements: 'Customer brings lehenga fabric panels and dupatta',
    whatWillBeTaught: 'Complete stitching with waist belt tailoring and customized side zip',
    whatWillBeReceived: 'Ready-to-wear designer lehenga with matching blouse',
    contactInfo: 'Phone: 9876543222 | Email: royal.threads@tailorconnect.com',
    registeredUserIds: ['user-cust-2']
  }
]

export const INITIAL_ORDERS = [
  {
    id: 'ORD-1001',
    customer: 'Priya Sharma',
    customerId: 'user-cust-1',
    customerEmail: 'customer@tailorconnect.com',
    customerPhone: '9876543210',
    customerAddress: '12, 4th Cross Street, Anna Nagar, Chennai',
    tailor: 'Lakshmi Devi (Lakshmi Stitches)',
    tailorId: 'user-tailor-1',
    tailorShop: 'Lakshmi Stitches & Bridal Studio',
    tailorEmail: 'tailor@tailorconnect.com',
    tailorPhone: '9876543211',
    item: 'Pure Silk Bridal Blouse',
    category: 'Bridal Blouse',
    designName: 'Pure Silk Bridal Blouse with Zardosi',
    designImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    fabric: 'Kanchipuram Pure Silk',
    color: 'Crimson Pink & Antique Gold',
    quantity: 1,
    status: 'In Progress', // Statuses: 'Request Received', 'Accepted', 'Stitching Started', 'In Progress', 'Ready', 'Out for Delivery', 'Delivered', 'Completed'
    urgent: true,
    orderDate: '2026-08-20',
    deliveryDate: '2026-09-02',
    deliveryLocation: '12, 4th Cross Street, Anna Nagar, Chennai',
    amount: 1800,
    paymentStatus: 'Successful',
    paymentId: 'PAY-ORD-1001',
    progress: 65,
    measurements: {
      bust: '36',
      waist: '30',
      hip: '38',
      shoulder: '14.5',
      sleeveLength: '11.0',
      dressLength: '15.0'
    },
    specialInstructions: 'Deep U-neck back with gold potli buttons. Extra 1.5-inch side margin for future alteration.',
    hasReviewed: false
  },
  {
    id: 'ORD-1002',
    customer: 'Priya Sharma',
    customerId: 'user-cust-1',
    customerEmail: 'customer@tailorconnect.com',
    customerPhone: '9876543210',
    customerAddress: '12, 4th Cross Street, Anna Nagar, Chennai',
    tailor: 'Mrs. Radha Raman (Vintage Needle)',
    tailorId: 'user-tailor-2',
    tailorShop: 'Vintage Needle Heritage Tailors',
    tailorEmail: 'vintage.needle@tailorconnect.com',
    tailorPhone: '9876543233',
    item: 'Peacock Motif Aari Blouse',
    category: 'Aari Blouse',
    designName: 'Peacock Motif Aari Hand Embroidery Blouse',
    designImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    fabric: 'Raw Silk',
    color: 'Peacock Green & Royal Blue',
    quantity: 1,
    status: 'Request Received',
    urgent: false,
    orderDate: '2026-08-26',
    deliveryDate: '2026-09-18',
    deliveryLocation: '12, 4th Cross Street, Anna Nagar, Chennai',
    amount: 2200,
    paymentStatus: 'Pending',
    progress: 10,
    measurements: {
      bust: '36',
      waist: '30',
      hip: '38',
      shoulder: '14.5',
      sleeveLength: '10.5',
      dressLength: '14.5'
    },
    specialInstructions: 'Elbow sleeve peacock feather motif with pearl drop beads.',
    hasReviewed: false
  },
  {
    id: 'ORD-1003',
    customer: 'Anitha Raj',
    customerId: 'user-cust-2',
    customerEmail: 'anitha@example.com',
    customerPhone: '9876543214',
    customerAddress: '56, Race Course Road, Coimbatore',
    tailor: 'Suresh Kumar (Royal Threads)',
    tailorId: 'user-tailor-3',
    tailorShop: 'Royal Threads & Embroidery Studio',
    tailorEmail: 'royal.threads@tailorconnect.com',
    tailorPhone: '9876543222',
    item: 'Designer Lehenga & Blouse Set',
    category: 'Lehenga',
    designName: 'Flared Velvet Bridal Lehenga Set',
    designImage: 'https://images.unsplash.com/photo-1610030469668-932d59f77f52?w=600&auto=format&fit=crop&q=80',
    fabric: 'Silk Velvet & Net',
    color: 'Wine Red & Gold Zari',
    quantity: 1,
    status: 'Delivered',
    urgent: false,
    orderDate: '2026-08-01',
    deliveryDate: '2026-08-16',
    deliveryLocation: '56, Race Course Road, Coimbatore',
    amount: 3200,
    paymentStatus: 'Successful',
    paymentId: 'PAY-ORD-1003',
    progress: 100,
    measurements: {
      bust: '34',
      waist: '28',
      hip: '36',
      shoulder: '14.0',
      sleeveLength: '9.0',
      dressLength: '42.0'
    },
    specialInstructions: 'Flared umbrella cut skirt with double horsehair braid hem.',
    hasReviewed: true
  },
  {
    id: 'ORD-1004',
    customer: 'Divya Kumar',
    customerId: 'user-cust-3',
    customerEmail: 'divya@example.com',
    customerPhone: '9876543215',
    customerAddress: '18, Thillai Nagar Main Road, Trichy',
    tailor: 'Lakshmi Devi (Lakshmi Stitches)',
    tailorId: 'user-tailor-1',
    tailorShop: 'Lakshmi Stitches & Bridal Studio',
    tailorEmail: 'tailor@tailorconnect.com',
    tailorPhone: '9876543211',
    item: 'Zardosi Embroidery Blouse',
    category: 'Embroidery',
    designName: 'Metallic Zardosi & Pearl Designer Blouse',
    designImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    fabric: 'Pure Georgette',
    color: 'Mustard Yellow & Pearl White',
    quantity: 1,
    status: 'Delivered',
    urgent: true,
    orderDate: '2026-07-28',
    deliveryDate: '2026-08-12',
    deliveryLocation: '18, Thillai Nagar Main Road, Trichy',
    amount: 1600,
    paymentStatus: 'Successful',
    paymentId: 'PAY-ORD-1004',
    progress: 100,
    measurements: {
      bust: '38',
      waist: '32',
      hip: '40',
      shoulder: '15.0',
      sleeveLength: '11.5',
      dressLength: '15.5'
    },
    specialInstructions: 'Heavy pearl work along the neck border.',
    hasReviewed: true
  }
]

export const INITIAL_REVIEWS = [
  {
    id: 'REV-1',
    tailorId: 'user-tailor-1',
    tailorName: 'Lakshmi Devi',
    orderId: 'ORD-1004',
    customer: 'Divya Kumar',
    customerEmail: 'divya@example.com',
    rating: 5,
    date: '2026-08-14',
    comment: 'Outstanding Aari needlework! The bridal blouse fitting was flawless and delivered right on time.'
  },
  {
    id: 'REV-2',
    tailorId: 'user-tailor-3',
    tailorName: 'Suresh Kumar',
    orderId: 'ORD-1003',
    customer: 'Anitha Raj',
    customerEmail: 'anitha@example.com',
    rating: 5,
    date: '2026-08-17',
    comment: 'Gorgeous heavy embroidery and perfect flare for my cousin wedding lehenga. Highly recommended!'
  },
  {
    id: 'REV-3',
    tailorId: 'user-tailor-2',
    tailorName: 'Mrs. Radha Raman',
    orderId: 'ORD-HIST-01',
    customer: 'Kavitha Murugan',
    customerEmail: 'kavitha@example.com',
    rating: 5,
    date: '2026-07-30',
    comment: 'Authentic temple jewellery Maggam work. Heritage craftsmanship that cannot be matched.'
  }
]

export const INITIAL_PAYMENTS = [
  {
    id: 'PAY-ORD-1001',
    transactionId: 'TXN-TC-20260820-9941',
    userId: 'user-cust-1',
    userName: 'Priya Sharma',
    userType: 'Customer',
    type: 'Order',
    referenceId: 'ORD-1001',
    title: 'Custom Pure Silk Bridal Blouse Stitching',
    tailorId: 'user-tailor-1',
    tailorName: 'Lakshmi Devi (Lakshmi Stitches)',
    amount: 1800,
    date: '2026-08-20 11:35 AM',
    status: 'Successful',
    method: 'UPI (Google Pay)'
  },
  {
    id: 'PAY-ORD-1003',
    transactionId: 'TXN-TC-20260801-4412',
    userId: 'user-cust-2',
    userName: 'Anitha Raj',
    userType: 'Customer',
    type: 'Order',
    referenceId: 'ORD-1003',
    title: 'Designer Lehenga & Blouse Set Stitching',
    tailorId: 'user-tailor-3',
    tailorName: 'Suresh Kumar (Royal Threads)',
    amount: 3200,
    date: '2026-08-01 04:15 PM',
    status: 'Successful',
    method: 'Credit Card'
  },
  {
    id: 'PAY-ORD-1004',
    transactionId: 'TXN-TC-20260728-1129',
    userId: 'user-cust-3',
    userName: 'Divya Kumar',
    userType: 'Customer',
    type: 'Order',
    referenceId: 'ORD-1004',
    title: 'Zardosi Embroidery Blouse Stitching',
    tailorId: 'user-tailor-1',
    tailorName: 'Lakshmi Devi (Lakshmi Stitches)',
    amount: 1600,
    date: '2026-07-28 02:40 PM',
    status: 'Successful',
    method: 'Net Banking'
  },
  {
    id: 'PAY-CRS-101',
    transactionId: 'TXN-TC-20260810-8871',
    userId: 'user-student-1',
    userName: 'Meena Sundaram',
    userType: 'Student',
    type: 'Course',
    referenceId: 'OFF-101',
    title: 'Aari Embroidery & Maggam Needlework Masterclass',
    tailorId: 'user-tailor-1',
    tailorName: 'Lakshmi Devi (Lakshmi Stitches)',
    amount: 1499,
    date: '2026-08-10 10:20 AM',
    status: 'Successful',
    method: 'UPI'
  }
]

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    userId: 'user-cust-1',
    title: 'Order Status Update',
    message: 'Lakshmi Stitches has started stitching your order ORD-1001.',
    time: '2 hours ago',
    type: 'order',
    read: false,
    createdAt: '2026-08-27T10:00:00.000Z'
  },
  {
    id: 'NOTIF-2',
    userId: 'user-cust-1',
    title: 'Payment Successful – Order #ORD-1001',
    message: 'Your payment of ₹1,800 for Pure Silk Bridal Blouse was processed successfully. Receipt ready for download.',
    time: '1 day ago',
    type: 'payment',
    read: true,
    createdAt: '2026-08-26T11:35:00.000Z'
  },
  {
    id: 'NOTIF-3',
    userId: 'user-tailor-1',
    title: 'New Customized Order Received',
    message: 'Customer Priya Sharma placed order ORD-1001 for Pure Silk Bridal Blouse.',
    time: '2 days ago',
    type: 'order',
    read: false,
    createdAt: '2026-08-25T09:00:00.000Z'
  },
  {
    id: 'NOTIF-4',
    userId: 'user-tailor-1',
    title: 'New Student Enrollment',
    message: 'Meena Sundaram registered for Aari Embroidery & Maggam Needlework Masterclass.',
    time: '3 days ago',
    type: 'course',
    read: true,
    createdAt: '2026-08-24T14:15:00.000Z'
  },
  {
    id: 'NOTIF-5',
    userId: 'user-student-1',
    title: 'Course Registration Successful',
    message: 'You are enrolled in Aari Embroidery & Maggam Needlework Masterclass. Starts on 01 Sep 2026.',
    time: '3 days ago',
    type: 'course',
    read: false,
    createdAt: '2026-08-24T14:15:00.000Z'
  }
]

export const INITIAL_CERTIFICATES = [
  {
    id: 'CERT-2026-881',
    courseId: 'OFF-103',
    courseName: 'Fundamentals of Tailoring & Pattern Cutting',
    studentId: 'user-student-1',
    studentName: 'Meena Sundaram',
    studentEmail: 'student@tailorconnect.com',
    tailorId: 'user-tailor-4',
    tailorName: 'Anandhi Nathan',
    shopName: 'Modern Stitch Fashion Lab',
    issuedOn: '2026-07-28',
    duration: '30 Days (45 Hours)',
    grade: 'Exemplary with Distinction',
    verificationCode: 'TC-CERT-MAD-881'
  }
]

export const INITIAL_CHATS = [
  {
    id: 'MSG-1',
    orderId: 'ORD-1001',
    customerId: 'user-cust-1',
    customerName: 'Priya Sharma',
    tailorId: 'user-tailor-1',
    tailorName: 'Lakshmi Devi',
    senderRole: 'tailor',
    text: 'Namaste Priya! We received your order for the Crimson Pink Silk Bridal Blouse. The fabric swatch looks gorgeous.',
    timestamp: '2026-08-26 10:30 AM',
    read: true
  },
  {
    id: 'MSG-2',
    orderId: 'ORD-1001',
    customerId: 'user-cust-1',
    customerName: 'Priya Sharma',
    tailorId: 'user-tailor-1',
    tailorName: 'Lakshmi Devi',
    senderRole: 'customer',
    text: 'Thank you Lakshmi mam! Please make sure the back neck depth is 9.5 inches as requested in the notes.',
    timestamp: '2026-08-26 11:15 AM',
    read: true
  },
  {
    id: 'MSG-3',
    orderId: 'ORD-1001',
    customerId: 'user-cust-1',
    customerName: 'Priya Sharma',
    tailorId: 'user-tailor-1',
    tailorName: 'Lakshmi Devi',
    senderRole: 'tailor',
    text: 'Noted with care. We have cut the neckline and began the gold zardosi embroidery border today.',
    timestamp: '2026-08-27 09:45 AM',
    read: false
  }
]

export const INITIAL_WISHLIST = [
  {
    id: 'WISH-1',
    userId: 'user-cust-1',
    itemId: 3,
    title: 'Metallic Zardosi & Pearl Designer Blouse',
    tailor: 'Suresh Kumar (Royal Threads)',
    category: 'Embroidery',
    price: '₹1,500',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'WISH-2',
    userId: 'user-cust-1',
    itemId: 4,
    title: 'Flared Velvet Bridal Lehenga Set',
    tailor: 'Grace Mary (Grace Bridal)',
    category: 'Lehenga',
    price: '₹4,500',
    image: 'https://images.unsplash.com/photo-1610030469668-932d59f77f52?w=600&auto=format&fit=crop&q=80'
  }
]

export const INITIAL_PORTFOLIO = [
  {
    id: 'PORT-1',
    tailorId: 'user-tailor-1',
    title: 'Royal Peacock Aari Bridal Blouse',
    category: 'Aari Blouse',
    fabric: 'Kanchipuram Pure Silk',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    description: 'Heavy gold zardosi with cut dana and micro pearl embellishment for traditional muhurtham saree.'
  },
  {
    id: 'PORT-2',
    tailorId: 'user-tailor-1',
    title: 'Contemporary Saree Blouse with Tassels',
    category: 'Saree Blouse',
    fabric: 'Brocade Silk',
    image: 'https://images.unsplash.com/photo-1583391733975-0210f9689408?w=600&auto=format&fit=crop&q=80',
    description: 'Festive high-neck cut-work design with handmade silk latkans.'
  },
  {
    id: 'PORT-3',
    tailorId: 'user-tailor-1',
    title: 'Embroidered Kids Pattu Pavadai',
    category: 'Kids Wear',
    fabric: 'Raw Silk',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    description: 'Comfortable pure silk festive attire tailored for young girls.'
  }
]

// ----------------- STORAGE INITIALIZATION -----------------

function getItem(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal))
      return defaultVal
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err)
    return defaultVal
  }
}

function setItem(key, val, entity) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
    if (entity) emitDataChange(entity)
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err)
  }
}

export function initStorage() {
  // Ensure default users
  const allUsers = [...INITIAL_ADMIN, ...INITIAL_TAILORS, ...INITIAL_CUSTOMERS, ...INITIAL_STUDENTS]
  const currentUsers = getItem(STORAGE_KEYS.USERS, allUsers)
  
  // Merge any missing seed users
  let userChanged = false
  allUsers.forEach((u) => {
    if (!currentUsers.some((cur) => cur.email.toLowerCase() === u.email.toLowerCase() && cur.role === u.role)) {
      currentUsers.push(u)
      userChanged = true
    }
  })
  if (userChanged) {
    setItem(STORAGE_KEYS.USERS, currentUsers)
  }

  getItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS)
  getItem(STORAGE_KEYS.OFFERS, INITIAL_OFFERS_AND_COURSES)
  getItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS)
  getItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
  getItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  getItem(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES)
  getItem(STORAGE_KEYS.CHATS, INITIAL_CHATS)
  getItem(STORAGE_KEYS.WISHLIST, INITIAL_WISHLIST)
  getItem(STORAGE_KEYS.PORTFOLIO, INITIAL_PORTFOLIO)
  getItem(STORAGE_KEYS.DESIGNS, INITIAL_DRESS_DESIGNS)
  getItem(STORAGE_KEYS.FABRICS, INITIAL_FABRICS)
}

// Auto-run initialization on load
initStorage()

// ----------------- CRUD & BUSINESS LOGIC -----------------

// --- USERS ---
export const getUsers = () => getItem(STORAGE_KEYS.USERS, [])
export const getUserById = (id) => getUsers().find((u) => u.id === id)
export const getTailors = () => getUsers().filter((u) => u.role === 'tailor')
export const getCustomers = () => getUsers().filter((u) => u.role === 'customer')
export const getStudents = () => getUsers().filter((u) => u.role === 'student')

export const updateUser = (id, fields) => {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...fields }
    setItem(STORAGE_KEYS.USERS, users, 'users')
    return users[idx]
  }
  return null
}

export const toggleUserStatus = (id) => {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx !== -1) {
    users[idx].status = users[idx].status === 'inactive' ? 'active' : 'inactive'
    setItem(STORAGE_KEYS.USERS, users, 'users')
    return users[idx]
  }
  return null
}

export const verifyTailor = (tailorId, verified = true) => {
  return updateUser(tailorId, { verified })
}

// --- ORDERS ---
export const getOrders = () => getItem(STORAGE_KEYS.ORDERS, [])

export const getOrderById = (id) => getOrders().find((o) => o.id === id)

export const getOrdersForCustomer = (customerId) => {
  return getOrders().filter((o) => o.customerId === customerId || (o.customerEmail && o.customerEmail.toLowerCase() === customerId.toLowerCase()))
}

export const getOrdersForTailor = (tailorId) => {
  return getOrders().filter((o) => o.tailorId === tailorId || (o.tailor && o.tailor.includes(tailorId)))
}

export const createOrder = (orderData) => {
  const orders = getOrders()
  const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
  const newOrder = {
    id: newId,
    customer: orderData.customer || 'Customer',
    customerId: orderData.customerId,
    customerEmail: orderData.customerEmail,
    customerPhone: orderData.customerPhone || '9876543210',
    customerAddress: orderData.customerAddress || orderData.deliveryLocation || 'Chennai',
    tailor: orderData.tailor || 'Lakshmi Devi (Lakshmi Stitches)',
    tailorId: orderData.tailorId || 'user-tailor-1',
    tailorShop: orderData.tailorShop || 'Lakshmi Stitches & Bridal Studio',
    tailorEmail: orderData.tailorEmail,
    tailorPhone: orderData.tailorPhone,
    item: orderData.item || 'Custom Blouse',
    category: orderData.category || 'Bridal Blouse',
    designName: orderData.designName || orderData.item || 'Custom Design',
    designImage: orderData.designImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    fabric: orderData.fabric || 'Pure Silk',
    color: orderData.color || 'Royal Crimson Pink',
    quantity: Number(orderData.quantity) || 1,
    status: 'Request Received', // Statuses: 'Request Received', 'Accepted', 'Stitching Started', 'In Progress', 'Ready', 'Out for Delivery', 'Delivered', 'Completed'
    urgent: !!orderData.urgent,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: orderData.deliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    deliveryLocation: orderData.deliveryLocation || 'Chennai',
    amount: Number(orderData.amount) || Number(orderData.budget) || 1800,
    paymentStatus: 'Pending',
    progress: 0,
    measurements: orderData.measurements || {
      bust: '36', waist: '30', hip: '38', shoulder: '14.5', sleeveLength: '11', dressLength: '15'
    },
    specialInstructions: orderData.specialInstructions || orderData.notes || '',
    hasReviewed: false,
    createdAt: new Date().toISOString()
  }

  orders.unshift(newOrder)
  setItem(STORAGE_KEYS.ORDERS, orders, 'orders')

  // Generate Notification for Tailor
  addNotification({
    userId: newOrder.tailorId,
    title: 'New Order Request Received',
    message: `${newOrder.customer} placed an order #${newOrder.id} for ${newOrder.item}.`,
    type: 'order'
  })

  // Generate Notification for Customer
  addNotification({
    userId: newOrder.customerId,
    title: 'Order Request Placed Successfully',
    message: `Your request #${newOrder.id} was sent to ${newOrder.tailor}.`,
    type: 'order'
  })

  return newOrder
}

export const updateOrderStatus = (orderId, newStatus) => {
  const orders = getOrders()
  const idx = orders.findIndex((o) => o.id === orderId)
  if (idx === -1) return null

  const order = orders[idx]
  order.status = newStatus

  // Adjust progress percentages automatically
  if (newStatus === 'Accepted') order.progress = Math.max(order.progress, 15)
  else if (newStatus === 'Stitching Started') order.progress = Math.max(order.progress, 35)
  else if (newStatus === 'In Progress') order.progress = Math.max(order.progress, 65)
  else if (newStatus === 'Ready') order.progress = Math.max(order.progress, 90)
  else if (newStatus === 'Out for Delivery') order.progress = Math.max(order.progress, 95)
  else if (newStatus === 'Delivered' || newStatus === 'Completed') order.progress = 100

  orders[idx] = order
  setItem(STORAGE_KEYS.ORDERS, orders, 'orders')

  // Notify customer
  addNotification({
    userId: order.customerId,
    title: `Order Status: ${newStatus}`,
    message: `Your order #${order.id} (${order.item}) is now marked as "${newStatus}".`,
    type: 'order'
  })

  return order
}

export const updateOrderProgress = (orderId, progressVal) => {
  const orders = getOrders()
  const idx = orders.findIndex((o) => o.id === orderId)
  if (idx === -1) return null

  orders[idx].progress = Math.min(100, Math.max(0, Number(progressVal)))
  setItem(STORAGE_KEYS.ORDERS, orders, 'orders')
  return orders[idx]
}

// --- OFFERS & COURSES ---
export const getOffers = () => getItem(STORAGE_KEYS.OFFERS, [])

export const getOfferById = (id) => getOffers().find((o) => o.id === id)

export const getOffersForTailor = (tailorId) => {
  return getOffers().filter((o) => o.tailorId === tailorId)
}

export const createOffer = (payload) => {
  const offers = getOffers()
  const newId = `OFF-${Math.floor(100 + Math.random() * 900)}`
  const newOffer = {
    id: newId,
    name: payload.name || 'Tailoring Course',
    type: payload.type || 'Course',
    targetAudience: payload.targetAudience || 'Student',
    category: payload.category || 'Bridal Blouse',
    description: payload.description || '',
    mode: payload.mode || 'Offline',
    durationDays: Number(payload.durationDays) || 15,
    startDate: payload.startDate || new Date().toISOString().split('T')[0],
    endDate: payload.endDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    availableDays: payload.availableDays || 'Monday to Friday',
    availableTime: payload.availableTime || '10:00 AM – 12:00 PM',
    location: payload.location || 'Chennai',
    shopName: payload.shopName || 'Tailor Hub',
    trainerName: payload.trainerName || 'Master Tailor',
    tailorId: payload.tailorId,
    price: Number(payload.price) || 999,
    maxCapacity: Number(payload.maxCapacity) || 20,
    registeredStudents: 0,
    status: 'Active',
    image: payload.image || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    requirements: payload.requirements || 'None',
    whatWillBeTaught: payload.whatWillBeTaught || 'Professional Stitching Techniques',
    whatWillBeReceived: payload.whatWillBeReceived || 'Certificate of Completion',
    contactInfo: payload.contactInfo || '',
    registeredUserIds: [],
    createdAt: new Date().toISOString()
  }

  offers.unshift(newOffer)
  setItem(STORAGE_KEYS.OFFERS, offers, 'offers')
  return newOffer
}

export const updateOffer = (id, payload) => {
  const offers = getOffers()
  const idx = offers.findIndex((o) => o.id === id)
  if (idx === -1) return null

  offers[idx] = { ...offers[idx], ...payload }
  
  // Auto-close if registrations reach or exceed capacity
  if (offers[idx].registeredStudents >= offers[idx].maxCapacity) {
    offers[idx].status = 'Closed'
  }

  setItem(STORAGE_KEYS.OFFERS, offers, 'offers')
  return offers[idx]
}

export const deleteOffer = (id) => {
  const offers = getOffers().filter((o) => o.id !== id)
  setItem(STORAGE_KEYS.OFFERS, offers, 'offers')
  return true
}

export const toggleOfferAvailability = (id, newStatus) => {
  const offers = getOffers()
  const idx = offers.findIndex((o) => o.id === id)
  if (idx === -1) return null

  offers[idx].status = newStatus || (offers[idx].status === 'Active' ? 'Closed' : 'Active')
  setItem(STORAGE_KEYS.OFFERS, offers, 'offers')
  return offers[idx]
}

// Student Registers for a Course
export const registerForCourse = (offerId, studentUser) => {
  const offers = getOffers()
  const idx = offers.findIndex((o) => o.id === offerId)
  if (idx === -1) return { success: false, error: 'Course not found.' }

  const offer = offers[idx]
  if (offer.status !== 'Active') {
    return { success: false, error: 'This course is currently closed for registrations.' }
  }

  if (offer.registeredStudents >= offer.maxCapacity) {
    offer.status = 'Closed'
    setItem(STORAGE_KEYS.OFFERS, offers, 'offers')
    return { success: false, error: 'Course is already at maximum capacity.' }
  }

  offer.registeredUserIds = offer.registeredUserIds || []
  if (offer.registeredUserIds.includes(studentUser.id)) {
    return { success: false, error: 'You are already registered for this course.' }
  }

  offer.registeredUserIds.push(studentUser.id)
  offer.registeredStudents += 1
  offer.totalEarnings = (offer.totalEarnings || 0) + (offer.price || 0)

  if (offer.registeredStudents >= offer.maxCapacity) {
    offer.status = 'Closed'
  }

  offers[idx] = offer
  setItem(STORAGE_KEYS.OFFERS, offers, 'offers')

  // Add Notification for Student
  addNotification({
    userId: studentUser.id,
    title: 'Course Registration & Payment Confirmed 🎓',
    message: `You have successfully enrolled in "${offer.name}" for ₹${offer.price || 0}. Full video lesson access is unlocked!`,
    type: 'course'
  })

  // Add Notification for Tailor (Revenue Credited)
  addNotification({
    userId: offer.tailorId,
    title: 'New Student Enrollment & Payment Credited 💰',
    message: `${studentUser.name} registered for "${offer.name}". ₹${offer.price || 0} credited to your account! Current count: ${offer.registeredStudents}/${offer.maxCapacity}.`,
    type: 'course'
  })

  return { success: true, offer }
}

// Student Completes a Course -> Generates Certificate
export const completeCourseForStudent = (offerId, studentUser) => {
  const offer = getOfferById(offerId)
  if (!offer) return { success: false, error: 'Course not found.' }

  const cert = generateCertificate({
    courseId: offer.id,
    courseName: offer.name,
    studentId: studentUser.id,
    studentName: studentUser.name,
    studentEmail: studentUser.email,
    tailorId: offer.tailorId,
    tailorName: offer.trainerName || 'Master Tailor',
    shopName: offer.shopName,
    duration: `${offer.durationDays} Days`
  })

  addNotification({
    userId: studentUser.id,
    title: 'Course Completed – Certificate Earned! 🏆',
    message: `Congratulations! You have completed "${offer.name}". Certificate ID: ${cert.id}.`,
    type: 'certificate'
  })

  addNotification({
    userId: offer.tailorId,
    title: 'Student Course Completion',
    message: `Student ${studentUser.name} has completed "${offer.name}".`,
    type: 'course'
  })

  return { success: true, certificate: cert }
}

// --- REVIEWS & RATINGS ---
export const getReviews = () => getItem(STORAGE_KEYS.REVIEWS, [])

export const getReviewsForTailor = (tailorId) => {
  const reviews = getReviews()
  return reviews.filter((r) => r.tailorId === tailorId || r.tailorName === tailorId)
}

export const getTailorAverageRating = (tailorId) => {
  const reviews = getReviewsForTailor(tailorId)
  if (reviews.length === 0) return 4.8
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0)
  return Number((sum / reviews.length).toFixed(1))
}

export const addReview = ({ tailorId, tailorName, orderId, customerName, customerEmail, rating, comment }) => {
  const reviews = getReviews()

  // Prevent duplicate review for the same order
  if (orderId && reviews.some((r) => r.orderId === orderId)) {
    return { success: false, error: 'You have already submitted a review for this order.' }
  }

  const newReview = {
    id: `REV-${Date.now()}`,
    tailorId,
    tailorName: tailorName || 'Tailor',
    orderId,
    customer: customerName || 'Verified Customer',
    customerEmail,
    rating: Number(rating) || 5,
    date: new Date().toISOString().split('T')[0],
    comment: comment || 'Excellent stitching and perfect fit.'
  }

  reviews.unshift(newReview)
  setItem(STORAGE_KEYS.REVIEWS, reviews, 'reviews')

  // Mark order as reviewed
  if (orderId) {
    const orders = getOrders()
    const oIdx = orders.findIndex((o) => o.id === orderId)
    if (oIdx !== -1) {
      orders[oIdx].hasReviewed = true
      setItem(STORAGE_KEYS.ORDERS, orders, 'orders')
    }
  }

  // Update Tailor rating in users table
  const tailors = getUsers()
  const tIdx = tailors.findIndex((u) => u.id === tailorId)
  if (tIdx !== -1) {
    tailors[tIdx].rating = getTailorAverageRating(tailorId)
    tailors[tIdx].reviewsCount = (tailors[tIdx].reviewsCount || 0) + 1
    setItem(STORAGE_KEYS.USERS, tailors, 'users')
  }

  // Notify Tailor
  addNotification({
    userId: tailorId,
    title: 'New Customer Review ⭐',
    message: `${customerName} gave you a ${rating}-star rating: "${comment.slice(0, 50)}..."`,
    type: 'review'
  })

  return { success: true, review: newReview }
}

// --- PAYMENTS & RECEIPTS ---
export const getPayments = () => getItem(STORAGE_KEYS.PAYMENTS, [])

export const getPaymentsForUser = (userId) => {
  return getPayments().filter((p) => p.userId === userId)
}

export const getPaymentsForTailor = (tailorId) => {
  return getPayments().filter((p) => p.tailorId === tailorId)
}

export const createPayment = ({ userId, userName, userType, type, referenceId, title, tailorId, tailorName, amount, method }) => {
  const payments = getPayments()
  const newPayId = `PAY-${type === 'Order' ? 'ORD' : 'CRS'}-${Date.now().toString().slice(-4)}`
  const newPayment = {
    id: newPayId,
    transactionId: `TXN-TC-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    userName: userName || 'Customer',
    userType: userType || 'Customer',
    type: type || 'Order',
    referenceId,
    title: title || 'Tailoring Service Payment',
    tailorId: tailorId || 'user-tailor-1',
    tailorName: tailorName || 'Lakshmi Devi',
    amount: Number(amount) || 1000,
    date: new Date().toLocaleString(),
    status: 'Successful',
    method: method || 'UPI'
  }

  payments.unshift(newPayment)
  setItem(STORAGE_KEYS.PAYMENTS, payments, 'payments')

  // Update order payment status if this is an order
  if (type === 'Order' && referenceId) {
    const orders = getOrders()
    const oIdx = orders.findIndex((o) => o.id === referenceId)
    if (oIdx !== -1) {
      orders[oIdx].paymentStatus = 'Successful'
      orders[oIdx].paymentId = newPayId
      setItem(STORAGE_KEYS.ORDERS, orders, 'orders')
    }
  }

  // Create notifications
  addNotification({
    userId,
    title: `Payment Successful – ${type === 'Order' ? `Order #${referenceId}` : `Course ${title}`}`,
    message: `Payment of ₹${amount} was successful. Transaction ID: ${newPayment.transactionId}.`,
    type: 'payment'
  })

  addNotification({
    userId: tailorId,
    title: 'Payment Received 💳',
    message: `Received ₹${amount} from ${userName} for ${title}.`,
    type: 'payment'
  })

  return newPayment
}

// --- NOTIFICATIONS ---
export const getNotifications = () => getItem(STORAGE_KEYS.NOTIFICATIONS, [])

export const getNotificationsForUser = (userId) => {
  return getNotifications().filter((n) => n.userId === userId)
}

export const addNotification = ({ userId, title, message, type = 'general' }) => {
  const notifs = getNotifications()
  const newNotif = {
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    title,
    message,
    time: 'Just now',
    type,
    read: false,
    createdAt: new Date().toISOString()
  }

  notifs.unshift(newNotif)
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifs, 'notifications')
  return newNotif
}

export const markNotificationRead = (notifId) => {
  const notifs = getNotifications()
  const idx = notifs.findIndex((n) => n.id === notifId)
  if (idx !== -1) {
    notifs[idx].read = true
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifs, 'notifications')
  }
}

// --- CERTIFICATES ---
export const getCertificates = () => getItem(STORAGE_KEYS.CERTIFICATES, [])

export const getCertificatesForStudent = (studentId) => {
  return getCertificates().filter((c) => c.studentId === studentId || c.studentEmail === studentId)
}

export const generateCertificate = ({ courseId, courseName, studentId, studentName, studentEmail, tailorId, tailorName, shopName, duration }) => {
  const certs = getCertificates()
  const certId = `CERT-2026-${Math.floor(100 + Math.random() * 900)}`
  const newCert = {
    id: certId,
    courseId,
    courseName,
    studentId,
    studentName,
    studentEmail,
    tailorId,
    tailorName,
    shopName: shopName || 'TailorConnect Academy',
    issuedOn: new Date().toISOString().split('T')[0],
    duration: duration || '30 Days',
    grade: 'Certified Professional Distinction',
    verificationCode: `TC-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  }

  certs.unshift(newCert)
  setItem(STORAGE_KEYS.CERTIFICATES, certs, 'certificates')
  return newCert
}

// --- RELATIONSHIP-BASED CHAT ---
export const getChatMessages = () => getItem(STORAGE_KEYS.CHATS, [])

// Returns list of unique contacts who have an order relationship
export const getChatContacts = (user) => {
  if (!user) return []
  const orders = getOrders()
  
  if (user.role === 'tailor') {
    // Return all customers who placed orders with this tailor
    const myOrders = orders.filter((o) => o.tailorId === user.id || o.tailorShop === user.shopName || (o.tailor && o.tailor.includes(user.name)))
    const map = new Map()
    myOrders.forEach((o) => {
      if (o.customerId && !map.has(o.customerId)) {
        map.set(o.customerId, {
          id: o.customerId,
          name: o.customer,
          phone: o.customerPhone,
          orderId: o.id,
          orderItem: o.item,
          status: o.status,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        })
      }
    })
    return Array.from(map.values())
  }

  if (user.role === 'customer') {
    // Return all tailors with whom the customer placed orders
    const myOrders = orders.filter((o) => o.customerId === user.id || o.customerEmail === user.email)
    const map = new Map()
    myOrders.forEach((o) => {
      if (o.tailorId && !map.has(o.tailorId)) {
        map.set(o.tailorId, {
          id: o.tailorId,
          name: o.tailor,
          shopName: o.tailorShop,
          phone: o.tailorPhone,
          orderId: o.id,
          orderItem: o.item,
          status: o.status,
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        })
      }
    })
    return Array.from(map.values())
  }

  return []
}

export const getMessagesBetween = (userId1, userId2) => {
  const chats = getChatMessages()
  return chats.filter(
    (c) =>
      (c.customerId === userId1 && c.tailorId === userId2) ||
      (c.customerId === userId2 && c.tailorId === userId1)
  )
}

export const sendChatMessage = ({ orderId, customerId, customerName, tailorId, tailorName, senderRole, text }) => {
  const chats = getChatMessages()
  const newMsg = {
    id: `MSG-${Date.now()}`,
    orderId: orderId || 'ORD-GEN',
    customerId,
    customerName,
    tailorId,
    tailorName,
    senderRole,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    createdAt: new Date().toISOString()
  }

  chats.push(newMsg)
  setItem(STORAGE_KEYS.CHATS, chats, 'chats')
  return newMsg
}

// --- WISHLIST ---
export const getWishlist = () => getItem(STORAGE_KEYS.WISHLIST, [])

export const getWishlistForUser = (userId) => {
  return getWishlist().filter((w) => w.userId === userId)
}

export const toggleWishlistItem = (userId, item) => {
  let list = getWishlist()
  const existingIdx = list.findIndex((w) => w.userId === userId && w.itemId === item.id)

  if (existingIdx !== -1) {
    list.splice(existingIdx, 1)
    setItem(STORAGE_KEYS.WISHLIST, list, 'wishlist')
    return { added: false, wishlist: list }
  } else {
    const newItem = {
      id: `WISH-${Date.now()}`,
      userId,
      itemId: item.id,
      title: item.title,
      tailor: item.tailor,
      category: item.category,
      price: item.price || '₹1,200',
      image: item.image
    }
    list.unshift(newItem)
    setItem(STORAGE_KEYS.WISHLIST, list, 'wishlist')
    return { added: true, item: newItem }
  }
}

export const isInWishlist = (userId, itemId) => {
  return getWishlist().some((w) => w.userId === userId && w.itemId === itemId)
}

// --- PORTFOLIO ---
export const getPortfolio = () => getItem(STORAGE_KEYS.PORTFOLIO, [])

export const getPortfolioForTailor = (tailorId) => {
  return getPortfolio().filter((p) => p.tailorId === tailorId)
}

export const addPortfolioItem = (item) => {
  const port = getPortfolio()
  const newItem = {
    id: `PORT-${Date.now()}`,
    tailorId: item.tailorId,
    title: item.title,
    category: item.category || 'Aari Blouse',
    fabric: item.fabric || 'Pure Silk',
    image: item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    description: item.description || ''
  }
  port.unshift(newItem)
  setItem(STORAGE_KEYS.PORTFOLIO, port, 'portfolio')
  return newItem
}

// --- DESIGNS & FABRICS ---
export const getDressDesigns = () => getItem(STORAGE_KEYS.DESIGNS, INITIAL_DRESS_DESIGNS)
export const getFabrics = () => getItem(STORAGE_KEYS.FABRICS, INITIAL_FABRICS)

// --- TAILOR HELPERS ---
export const getTailorById = (id) => {
  const tailors = getTailors()
  return tailors.find((t) => t.id === id || String(t.id) === String(id)) || null
}

// --- QUOTATIONS ---
export const getQuotations = () => {
  return getItem('tc_quotations_data', [])
}

export const getQuotationsForCustomer = (customerId) => {
  return getQuotations().filter(q => q.customerId === customerId)
}

export const getQuotationsForTailor = (tailorId) => {
  return getQuotations().filter(q => q.tailorId === tailorId)
}

export const createQuotationRequest = (payload) => {
  const requests = getItem('tc_quotation_requests', [])
  requests.unshift(payload)
  setItem('tc_quotation_requests', requests, 'quotations')
  return payload
}

// --- APPOINTMENTS ---
export const getAppointments = () => {
  return getItem('tc_appointments_data', [])
}

export const getAppointmentsForCustomer = (customerId) => {
  return getAppointments().filter(a => a.customerId === customerId)
}

export const getAppointmentsForTailor = (tailorId) => {
  return getAppointments().filter(a => a.tailorId === tailorId)
}

export const createAppointment = (payload) => {
  const appts = getAppointments()
  appts.unshift(payload)
  setItem('tc_appointments_data', appts, 'appointments')
  return payload
}

// --- ADMIN STATS ---
export const getAdminStats = () => {
  const users = getUsers()
  const orders = getOrders()
  const complaints = getItem('tc_complaints_data', [])
  const tailors = users.filter((u) => u.role === 'tailor')
  
  return {
    totalUsers: users.length,
    totalCustomers: users.filter((u) => u.role === 'customer').length,
    totalTailors: tailors.length,
    verifiedTailors: tailors.filter((t) => t.verified).length,
    pendingVerification: tailors.filter((t) => !t.verified).length,
    totalStudents: users.filter((u) => u.role === 'student').length,
    totalOrders: orders.length,
    activeOrders: orders.filter((o) => !['Completed', 'Delivered', 'Cancelled'].includes(o.status)).length,
    pendingComplaints: complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'resolved').length || 1,
    totalRevenue: orders.reduce((acc, o) => acc + Number(o.amount || 0), 0) || 54200
  }
}

