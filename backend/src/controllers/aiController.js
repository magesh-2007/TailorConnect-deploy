import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'
import User from '../models/User.js'

const GEMINI_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-1.5-flash'

// ======================================================
// STITCH AI SYSTEM PROMPT
// ======================================================

const SYSTEM_PROMPT = `
You are "Stitch AI", the AI fashion and tailoring assistant for TailorConnect.

TailorConnect is a real-world tailoring services and learning platform in Tamil Nadu, India.

You help customers with:

- Blouse designs
- Bridal blouse designs
- Lehenga designs
- Saree styling
- Bridal wear
- Kids wear
- Designer dresses
- Fabric recommendations
- Aari embroidery
- Maggam embroidery
- Kasuti embroidery
- Zardosi embroidery
- Colour combinations
- Occasion-based outfit suggestions
- Tailoring instructions
- Measurement guidance
- Finding real tailors based on location and specialization
- Understanding uploaded dress/design images

You understand:
- English
- Tamil
- Tanglish

Reply naturally in the language used by the customer.

IMPORTANT:
When the user asks to FIND A REAL TAILOR, you MUST return JSON in this exact format:

{"action":"find_tailors","query":"<search terms>"}

Example:
User: "Kovilpatti-la Aari work panra tailor find pannu"

Return:
{"action":"find_tailors","query":"Kovilpatti Aari"}

When the user asks to GENERATE A DESIGN, return:

{"action":"generate_design","prompt":"<detailed image generation prompt>"}

Example:
User: "Generate a grand bridal blouse"

Return:
{"action":"generate_design","prompt":"A luxurious grand South Indian bridal blouse with rich red silk fabric, intricate golden Aari embroidery, Zardosi work, traditional bridal motifs, elegant neckline, premium fashion photography style"}

For normal fashion/tailoring questions, answer naturally.

Do NOT invent real tailor information.
Real tailor information must come from the TailorConnect database.
`

// ======================================================
// GEMINI CLIENT
// ======================================================

function getClient() {
  if (!GEMINI_KEY) {
    return null
  }

  return new GoogleGenerativeAI(GEMINI_KEY)
}

// ======================================================
// GEMINI RETRY HELPER
// Handles temporary 503 / high-demand errors
// ======================================================

async function sendGeminiMessage(chat, message) {
  let lastError = null

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await chat.sendMessage(message)

      return result
    } catch (error) {
      lastError = error

      const errorMessage = error?.message || ''

      const isTemporaryError =
        errorMessage.includes('503') ||
        errorMessage.includes('Service Unavailable') ||
        errorMessage.includes('high demand') ||
        errorMessage.includes('temporarily unavailable')

      if (!isTemporaryError) {
        throw error
      }

      console.log(
        `[Gemini] Temporary 503/high-demand error. Retry ${attempt}/3`
      )

      if (attempt < 3) {
        const delay = attempt * 2500

        console.log(
          `[Gemini] Waiting ${delay}ms before retry...`
        )

        await new Promise(resolve =>
          setTimeout(resolve, delay)
        )
      }
    }
  }

  throw lastError
}

// ======================================================
// GEMINI IMAGE ANALYSIS RETRY
// ======================================================

async function generateGeminiContent(model, content) {
  let lastError = null

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(content)

      return result
    } catch (error) {
      lastError = error

      const errorMessage = error?.message || ''

      const isTemporaryError =
        errorMessage.includes('503') ||
        errorMessage.includes('Service Unavailable') ||
        errorMessage.includes('high demand') ||
        errorMessage.includes('temporarily unavailable')

      if (!isTemporaryError) {
        throw error
      }

      console.log(
        `[Gemini Image] Temporary 503/high-demand error. Retry ${attempt}/3`
      )

      if (attempt < 3) {
        const delay = attempt * 2500

        await new Promise(resolve =>
          setTimeout(resolve, delay)
        )
      }
    }
  }

  throw lastError
}

// ======================================================
// POST /api/ai/chat
// ======================================================

export async function aiChat(req, res) {
  const message = req.body?.message || ''
  const history = req.body?.history || []

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message is required.'
    })
  }

  try {
    const genAI = getClient()
    if (!GEMINI_KEY || !genAI) {
      throw new Error('GEMINI_KEY not configured or client uninitialized')
    }

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL
    })

    const safeHistory = Array.isArray(history)
      ? history
        .filter(h => h && h.content)
        .slice(-20)
      : []

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [
            {
              text: SYSTEM_PROMPT
            }
          ]
        },
        {
          role: 'model',
          parts: [
            {
              text:
                'Understood! I am Stitch AI, your TailorConnect fashion assistant. How can I help you today?'
            }
          ]
        },

        ...safeHistory.map(h => ({
          role:
            h.role === 'assistant'
              ? 'model'
              : 'user',
          parts: [
            {
              text: String(h.content)
            }
          ]
        }))
      ]
    })

    // Retry automatically if Gemini temporarily returns 503
    const result = await sendGeminiMessage(
      chat,
      message.trim()
    )

    const text = result.response.text()

    // ==================================================
    // FIND JSON ACTION
    // ==================================================

    const actionMatch = text.match(
      /\{[\s\S]*?"action"\s*:\s*"([^"]+)"[\s\S]*?\}/
    )

    if (actionMatch) {
      try {
        const actionObj = JSON.parse(
          actionMatch[0]
        )

        // ==================================================
        // FIND TAILORS
        // ==================================================

        if (
          actionObj.action === 'find_tailors'
        ) {
          const tailors =
            await searchTailors(
              actionObj.query || message
            )

          const cleanReply =
            text
              .replace(actionMatch[0], '')
              .trim()

          return res.json({
            success: true,

            reply:
              cleanReply ||
              (
                tailors.length > 0
                  ? `Found ${tailors.length} tailors matching your request.`
                  : 'No tailors found in the database matching that request.'
              ),

            action: 'find_tailors',

            tailors,

            count: tailors.length,

            query:
              actionObj.query || message
          })
        }

        // ==================================================
        // GENERATE DESIGN
        // ==================================================

        if (
          actionObj.action === 'generate_design'
        ) {
          return res.json({
            success: true,

            reply:
              'I created the design concept based on your requirements.',

            action: 'generate_design',

            designPrompt:
              actionObj.prompt || message,

            // Image generation API is not connected yet
            noImageKey: true
          })
        }

      } catch (jsonError) {
        console.log(
          '[AI Action JSON Parse Error]',
          jsonError.message
        )
      }
    }

    // ==================================================
    // NORMAL AI RESPONSE
    // ==================================================

    return res.json({
      success: true,
      reply: text
    })

  } catch (err) {
    console.warn('[AI Chat Fallback]', err?.message)

    // Graceful intelligent fallback so the assistant never crashes or returns 500 error
    try {
      const q = (message || '').toLowerCase()
      let tailors = []
      let action = null
      let reply = ''

      if (q.includes('tailor') || q.includes('chennai') || q.includes('madurai') || q.includes('coimbatore') || q.includes('kovilpatti') || q.includes('aari') || q.includes('find') || q.includes('thedu')) {
        tailors = await searchTailors(message)
        action = 'find_tailors'
        reply = tailors.length > 0
          ? `Found ${tailors.length} verified tailor${tailors.length > 1 ? 's' : ''} matching your search in Tamil Nadu. Check their profiles and ratings below:`
          : `No specific tailors found matching that term. You can browse all verified boutiques in Chennai and Madurai!`
      } else if (q.includes('price') || q.includes('rate') || q.includes('cost') || q.includes('evlo') || q.includes('charges')) {
        reply = `💰 **TailorConnect Stitching Price Guide:**\n\n• **Simple Cotton Blouse:** ₹350 – ₹500 (1-2 days)\n• **Princess Cut Lined Blouse:** ₹600 – ₹950 (2-3 days)\n• **Bridal Aari Work Blouse:** ₹2,500 – ₹8,500+ (5-10 days)\n• **Maggam / Zardosi Work:** ₹3,500 – ₹12,000 (7-14 days)\n• **Designer Lehenga:** ₹3,000 – ₹9,000\n• **Salwar Kameez / Kurti:** ₹500 – ₹1,200\n• **Alterations:** ₹100 – ₹300`
      } else if (q.includes('blouse') || q.includes('design') || q.includes('neck') || q.includes('saree') || q.includes('pattern')) {
        action = 'generate_design'
        reply = `✨ **Design Suggestion:** For traditional silk sarees, a deep pot neck with antique zari work and elbow-length sleeves with temple motifs is the top bridal trend in Tamil Nadu. For contemporary lightweight sarees, try a boat neck or sweetheart neckline!`
      } else if (q.includes('measurement') || q.includes('measure') || q.includes('alavu') || q.includes('size')) {
        reply = `📏 **Measurement Guide:** Measure bust, underbust waist, shoulder width, armhole, sleeve length, and blouse height. Or choose "Send Sample Blouse" when placing your order!`
      } else {
        reply = `Vanakkam! I'm your TailorConnect assistant. I can help you find verified master tailors across Chennai and Madurai, recommend blouse designs & Aari needlework, and estimate stitching charges. What would you like to know?`
      }

      return res.json({
        success: true,
        reply,
        tailors,
        action,
        count: tailors.length
      })
    } catch (fallbackErr) {
      return res.json({
        success: true,
        reply: `Vanakkam! Welcome to TailorConnect. You can search for tailors in Chennai, Madurai & Coimbatore, explore blouse designs, and track your orders.`,
        tailors: []
      })
    }
  }
}

// ======================================================
// POST /api/ai/chat-image
// ======================================================

export async function aiChatWithImage(req, res) {
  try {
    const {
      message =
      'Describe this dress and suggest improvements.'
    } = req.body

    const imageFile = req.file

    if (!GEMINI_KEY) {
      return res.status(503).json({
        success: false,
        message:
          'GEMINI_API_KEY not configured.',
        setupRequired: true
      })
    }

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message:
          'Image file is required.'
      })
    }

    const genAI = getClient()

    if (!genAI) {
      return res.status(503).json({
        success: false,
        message:
          'Gemini AI client could not be initialized.'
      })
    }

    const model =
      genAI.getGenerativeModel({
        model: GEMINI_MODEL
      })

    const imagePart = {
      inlineData: {
        data:
          imageFile.buffer.toString(
            'base64'
          ),

        mimeType:
          imageFile.mimetype
      }
    }

    const prompt = `
${SYSTEM_PROMPT}

User question:
${message}
`

    // Retry automatically for temporary 503
    const result =
      await generateGeminiContent(
        model,
        [
          prompt,
          imagePart
        ]
      )

    const text =
      result.response.text()

    return res.json({
      success: true,
      reply: text
    })

  } catch (err) {
    console.error(
      '[AI Image Chat Error]',
      err?.message
    )

    const errorMessage =
      err?.message ||
      'Unknown Gemini image error.'

    if (
      errorMessage.includes('503') ||
      errorMessage.includes('high demand') ||
      errorMessage.includes('Service Unavailable')
    ) {
      return res.status(503).json({
        success: false,
        message:
          'Gemini AI is temporarily busy. Please try the image again in a few seconds.',
        temporary: true,
        model: GEMINI_MODEL
      })
    }

    return res.status(500).json({
      success: false,
      message: errorMessage
    })
  }
}

// ======================================================
// POST /api/ai/find-tailors
// ======================================================

export async function aiFindTailors(
  req,
  res
) {
  try {
    const {
      query
    } = req.body

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message:
          'Query is required.'
      })
    }

    const tailors =
      await searchTailors(query)

    return res.json({
      success: true,
      tailors,
      count: tailors.length,
      query
    })

  } catch (err) {
    console.error(
      '[AI Find Tailors Error]',
      err?.message
    )

    return res.status(500).json({
      success: false,
      message:
        err?.message ||
        'Unable to search tailors.'
    })
  }
}

// ======================================================
// SEARCH REAL TAILOR DATA FROM MONGODB
// ======================================================

async function searchTailors(query) {
  const q =
    String(query || '')
      .toLowerCase()
      .trim()

  if (!q) {
    return []
  }

  // ====================================================
  // LOCATION KEYWORDS
  // ====================================================

  const locationWords = [
    'kovilpatti',
    'chennai',
    'coimbatore',
    'madurai',
    'trichy',
    'tiruchirappalli',
    'salem',
    'tirunelveli',
    'vellore',
    'erode',
    'tiruppur',
    'thanjavur',
    'nagercoil',
    'kanchipuram',
    'ambur',
    'tenkasi',
    'thoothukudi',
    'tuticorin',
    'virudhunagar',
    'sivakasi',
    'rajapalayam'
  ]

  // ====================================================
  // SPECIALIZATION KEYWORDS
  // ====================================================

  const specWords = [
    'aari',
    'aari work',
    'maggam',
    'bridal',
    'bridal blouse',
    'embroidery',
    'blouse',
    'lehenga',
    'saree',
    'kids',
    'alteration',
    'designer',
    'silk',
    'kasuti',
    'zardosi',
    'custom',
    'stitching',
    'tailoring',
    'dress',
    'gown',
    'churidar',
    'salwar',
    'wedding'
  ]

  const foundLocation =
    locationWords.find(
      location =>
        q.includes(location)
    )

  const foundSpec =
    specWords.find(
      specialization =>
        q.includes(specialization)
    )

  // ====================================================
  // BASE FILTER
  // ====================================================

  const filter = {
    role: {
      $in: [
        'tailor',
        'TAILOR',
        'Tailor'
      ]
    },

    isActive: {
      $ne: false
    }
  }

  // ====================================================
  // IMPORTANT:
  // If both location + specialization exist,
  // require BOTH instead of matching either one.
  // ====================================================

  const andConditions = []

  // ====================================================
  // LOCATION SEARCH
  // ====================================================

  if (foundLocation) {
    andConditions.push({
      $or: [
        {
          'location.city': {
            $regex:
              foundLocation,
            $options: 'i'
          }
        },

        {
          location: {
            $regex:
              foundLocation,
            $options: 'i'
          }
        },

        {
          city: {
            $regex:
              foundLocation,
            $options: 'i'
          }
        },

        {
          address: {
            $regex:
              foundLocation,
            $options: 'i'
          }
        }
      ]
    })
  }

  // ====================================================
  // SPECIALIZATION SEARCH
  // ====================================================

  if (foundSpec) {
    andConditions.push({
      $or: [
        {
          specializations: {
            $regex:
              foundSpec,
            $options: 'i'
          }
        },

        {
          specialization: {
            $regex:
              foundSpec,
            $options: 'i'
          }
        },

        {
          services: {
            $regex:
              foundSpec,
            $options: 'i'
          }
        },

        {
          expertise: {
            $regex:
              foundSpec,
            $options: 'i'
          }
        },

        {
          bio: {
            $regex:
              foundSpec,
            $options: 'i'
          }
        }
      ]
    })
  }

  // ====================================================
  // GENERAL KEYWORD SEARCH
  // ====================================================

  if (
    !foundLocation &&
    !foundSpec
  ) {
    const keywords =
      q
        .split(/\s+/)
        .filter(
          word =>
            word.length > 2
        )

    if (keywords.length > 0) {
      const keywordConditions = []

      keywords.forEach(
        keyword => {
          keywordConditions.push(
            {
              name: {
                $regex:
                  keyword,
                $options: 'i'
              }
            },

            {
              shopName: {
                $regex:
                  keyword,
                $options: 'i'
              }
            },

            {
              bio: {
                $regex:
                  keyword,
                $options: 'i'
              }
            },

            {
              specializations: {
                $regex:
                  keyword,
                $options: 'i'
              }
            },

            {
              specialization: {
                $regex:
                  keyword,
                $options: 'i'
              }
            },

            {
              services: {
                $regex:
                  keyword,
                $options: 'i'
              }
            }
          )
        }
      )

      andConditions.push({
        $or:
          keywordConditions
      })
    }
  }

  // ====================================================
  // APPLY SEARCH CONDITIONS
  // ====================================================

  if (andConditions.length > 0) {
    filter.$and =
      andConditions
  }

  // ====================================================
  // DATABASE QUERY
  // ====================================================

  const tailors =
    await User.find(filter)
      .select(
        `
        name
        email
        phone
        location
        city
        address
        shopName
        specializations
        specialization
        services
        expertise
        bio
        avatar
        profileImage
        rating
        reviewCount
        experience
        isActive
        `
      )
      .limit(10)
      .lean()

  // ====================================================
  // FORMAT RESPONSE
  // ====================================================

  return tailors.map(
    tailor => ({
      _id:
        tailor._id,

      name:
        tailor.name,

      shopName:
        tailor.shopName ||
        (
          tailor.name
            ? `${tailor.name}'s Studio`
            : 'Tailor Studio'
        ),

      location:
        tailor.city ||
        (
          typeof tailor.location ===
            'string'
            ? tailor.location
            : tailor.location?.city
        ) ||
        'Tamil Nadu',

      specializations:
        Array.isArray(
          tailor.specializations
        )
          ? tailor.specializations
          : (
            tailor.specialization
              ? [tailor.specialization]
              : []
          ),

      rating:
        tailor.rating ||
        0,

      reviewCount:
        tailor.reviewCount ||
        0,

      experience:
        tailor.experience ||
        'Not specified',

      avatar:
        tailor.avatar ||
        tailor.profileImage ||
        null,

      bio:
        tailor.bio ||
        '',

      phone:
        tailor.phone ||
        '',

      email:
        tailor.email ||
        ''
    })
  )
}

// ======================================================
// GET /api/ai/status
// ======================================================

export async function aiStatus(
  req,
  res
) {
  const configured =
    !!GEMINI_KEY

  return res.json({
    success: true,

    configured,

    model:
      configured
        ? GEMINI_MODEL
        : null,

    message:
      configured
        ? 'Gemini AI is ready.'
        : 'GEMINI_API_KEY not set. Add it to backend/.env to enable AI features.',

    getKeyUrl:
      'https://aistudio.google.com/app/apikey'
  })
}