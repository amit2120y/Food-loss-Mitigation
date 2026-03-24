const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// REGISTER

exports.registerUser = async (req, res) => {

  try {

    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    console.log("User registered successfully:", user.email);
    res.status(201).json({ message: "User registered successfully", userId: user._id });

  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }

};



// LOGIN

exports.loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // check user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Ensure JWT secret exists
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined in environment variables.");
      return res.status(500).json({ message: "Server configuration error: JWT secret is missing" });
    }

    // create token
    const token = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: "7d" }
    );

    console.log("User logged in successfully:", user.email);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }

};


// GOOGLE OAUTH CALLBACK

exports.googleCallback = async (req, res) => {
  try {
    const { id, displayName, emails, photos } = req.user;
    const email = emails[0].value;
    const profilePicture = photos[0]?.value || null;

    // Check if user exists
    let user = await User.findOne({ googleId: id });

    if (!user) {
      // Check if email already exists (email/password user)
      let existingEmailUser = await User.findOne({ email });

      if (existingEmailUser) {
        // Update existing user with Google info
        user = await User.findByIdAndUpdate(
          existingEmailUser._id,
          {
            googleId: id,
            googleName: displayName,
            googleEmail: email,
            googleProfilePicture: profilePicture,
            authMethod: 'google'
          },
          { new: true }
        );
      } else {
        // Create new user
        user = await User.create({
          name: displayName,
          email,
          googleId: id,
          googleName: displayName,
          googleEmail: email,
          googleProfilePicture: profilePicture,
          authMethod: 'google'
        });
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("User logged in with Google:", email);

    // Redirect to frontend with token
    res.redirect(`http://localhost:5000/dashboard.html?token=${token}&userId=${user._id}&userName=${encodeURIComponent(user.name)}&userEmail=${encodeURIComponent(user.email)}`);

  } catch (error) {
    console.error("Google callback error:", error);
    res.status(500).json({ message: "Google authentication failed", error: error.message });
  }
};


// GOOGLE LOGIN SUCCESS - returns user data

exports.getGoogleLoginSuccess = async (req, res) => {
  try {
    // Extract token from query or headers
    const token = req.query.token || req.headers.authorization?.split(' ')[1];
    const userId = req.query.userId;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.googleProfilePicture
      }
    });

  } catch (error) {
    console.error("Error getting Google login success:", error);
    res.status(500).json({ message: "Failed to process login", error: error.message });
  }
};


// GET USER STATS - Donations made and received

exports.getUserStats = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`Fetching stats for user: ${user.email}`);

    res.status(200).json({
      message: "User stats retrieved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.googleProfilePicture || null,
        donationsMade: user.donationsMade || 0,
        donationsReceived: user.donationsReceived || 0,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(401).json({ message: "Invalid token or failed to fetch stats", error: error.message });
  }
};


// ANALYZE FOOD WITH AI

exports.analyzeFoodWithAI = async (req, res) => {
  try {
    // Get token and verify user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { images, description } = req.body;

    // Accept either images or text description
    if ((!images || (Array.isArray(images) && images.length === 0)) && (!description || description.trim() === '')) {
      return res.status(400).json({ message: "Please provide either images or a food description" });
    }

    console.log(`\n=== AI Food Analysis Request ===`);
    console.log(`User: ${user.email}`);

    let analysis;

    if (description && description.trim()) {
      console.log(`Analyzing text description: "${description.substring(0, 50)}..."`);
      analysis = await performTextAnalysis(description);
    } else {
      console.log(`Analyzing ${images.length} images`);
      analysis = await performAIAnalysis(images[0]);
    }

    console.log(`✓ AI analysis complete`);
    console.log(`Result: Human=${analysis.human}%, Cattle=${analysis.cattle}%, Fertilizer=${analysis.fertilizer}%\n`);

    res.status(200).json({
      message: "Food analysis successful",
      analysis: analysis
    });

  } catch (error) {
    console.error("Error in AI analysis:", error);
    res.status(500).json({ message: "AI analysis failed", error: error.message });
  }
};


// ==============================================
// AI ANALYSIS FUNCTION - BLUEPRINT
// ==============================================
// Replace this function with actual AI API calls
// This serves as a template for integration
// ==============================================

async function performTextAnalysis(description) {
  try {
    console.log("Analyzing food text description...");

    // Convert to lowercase for keyword matching
    const text = description.toLowerCase();

    // Define food quality indicators
    const indicators = {
      fresh_keywords: ['fresh', 'cooked today', 'new', 'today', 'just made', 'clean', 'good condition', 'perfect', 'excellent'],
      spoiled_keywords: ['moldy', 'rotten', 'decomposed', 'spoiled', 'bad', 'off', 'smell', 'sour', 'green mold', 'black mold', 'fungus', 'decaying', 'old'],
      slightly_bad_keywords: ['old', 'few days', 'slightly', 'dark spots', 'minor', 'small mold', 'wrinkled', 'soft', '3 days old', '4 days old'],
      cooked_keywords: ['cooked', 'prepared', 'rice', 'curry', 'bread', 'meal', 'fried', 'boiled', 'grilled', 'baked'],
      raw_keywords: ['raw', 'vegetable', 'fruit', 'fresh produce', 'uncooked']
    };

    let humanScore = 50;
    let cattleScore = 30;
    let fertilizerScore = 20;
    let recommendation = "";
    let reasoning = [];

    // Check for spoilage indicators (most important)
    let hasSpoiled = indicators.spoiled_keywords.some(keyword => text.includes(keyword));
    let hasSlightlyBad = indicators.slightly_bad_keywords.some(keyword => text.includes(keyword));

    if (hasSpoiled) {
      humanScore = 5;
      cattleScore = 10;
      fertilizerScore = 85;
      recommendation = "⚠️ This food shows signs of significant spoilage and decomposition. It's unsuitable for human or animal consumption but excellent for composting and fertilizer production. Send to fertilizer firms.";
      reasoning.push("Spoilage detected");
    } else if (hasSlightlyBad) {
      humanScore = 20;
      cattleScore = 40;
      fertilizerScore = 40;
      recommendation = "⚠️ This food shows minor spoilage signs. Not recommended for humans but can be used as animal feed. Can also be composted.";
      reasoning.push("Minor spoilage detected");
    } else {
      // Check freshness
      let hasFresh = indicators.fresh_keywords.some(keyword => text.includes(keyword));

      if (hasFresh) {
        humanScore = 85;
        cattleScore = 10;
        fertilizerScore = 5;
        recommendation = "✅ Excellent! This food is fresh and safe for human consumption. Highly recommended for donation to those in need.";
        reasoning.push("Fresh and clean");
      } else {
        // Check if cooked or raw
        let isCooked = indicators.cooked_keywords.some(keyword => text.includes(keyword));
        let isRaw = indicators.raw_keywords.some(keyword => text.includes(keyword));

        if (isCooked) {
          humanScore = 70;
          cattleScore = 20;
          fertilizerScore = 10;
          recommendation = "✅ This cooked food appears suitable for human consumption. Safe to donate for immediate distribution.";
          reasoning.push("Cooked food detected");
        } else if (isRaw) {
          humanScore = 75;
          cattleScore = 15;
          fertilizerScore = 10;
          recommendation = "✅ This fresh produce is suitable for human consumption. Can be distributed to those in need.";
          reasoning.push("Fresh produce detected");
        } else {
          humanScore = 65;
          cattleScore = 25;
          fertilizerScore = 10;
          recommendation = "✓ This food appears to be in acceptable condition. Suitable for human consumption with proper handling.";
          reasoning.push("General assessment");
        }
      }
    }

    console.log(`Analysis reasoning: ${reasoning.join(', ')}`);

    return {
      human: humanScore,
      cattle: cattleScore,
      fertilizer: fertilizerScore,
      recommendation: recommendation,
      confidence: "high",
      details: {
        freshness: hasSpoiled ? "spoiled" : hasSlightlyBad ? "degraded" : "good",
        condition: hasSpoiled ? "unsafe" : hasSlightlyBad ? "questionable" : "safe",
        estimated_shelf_life: hasSpoiled ? "0 days" : hasSlightlyBad ? "1 day" : "3-5 days",
        warnings: hasSpoiled ? ["Serious spoilage detected", "Not for human/animal consumption"] : hasSlightlyBad ? ["Minor spoilage present"] : [],
        category: indicators.cooked_keywords.some(k => text.includes(k)) ? "Cooked Food" : "Raw/Fresh"
      }
    };

  } catch (error) {
    console.error("Error in text analysis:", error);
    return getPlaceholderAnalysis();
  }
}

async function performAIAnalysis(imageDataUrl) {
  try {
    console.log("Analyzing food image...");

    // ==========================================
    // OPTION 1: OPENAI VISION API
    // ==========================================
    // Uncomment and implement when ready:
    /*
    if (process.env.OPENAI_API_KEY) {
      return await analyzeWithOpenAI(imageDataUrl);
    }
    */

    // ==========================================
    // OPTION 2: GOOGLE GEMINI API
    // ==========================================
    // Uncomment and implement when ready:
    /*
    if (process.env.GEMINI_API_KEY) {
      return await analyzeWithGemini(imageDataUrl);
    }
    */

    // ==========================================
    // OPTION 3: GOOGLE VISION API
    // ==========================================
    // Uncomment and implement when ready:
    /*
    if (process.env.GOOGLE_CLOUD_VISION_KEY) {
      return await analyzeWithGoogleVision(imageDataUrl);
    }
    */

    // Default placeholder analysis (for development)
    console.log("⚠️  Using placeholder analysis - No AI API configured");
    return getPlaceholderAnalysis();

  } catch (error) {
    console.error("Error in AI analysis:", error);
    return getPlaceholderAnalysis(); // Fallback to default
  }
}


// ==============================================
// PLACEHOLDER ANALYSIS (Development Mode)
// ==============================================
// This shows sample output format for future implementations
// ==============================================

function getPlaceholderAnalysis() {
  return {
    human: 70,        // 70% suitable for human consumption
    cattle: 20,       // 20% suitable as animal feed
    fertilizer: 10,   // 10% decomposable to fertilizer
    recommendation: "✓ This food appears to be in good condition. It's suitable for human consumption. You can donate it to those in need. When real AI integration is active, this will provide detailed analysis of freshness, food type, and safety concerns.",
    confidence: "medium",
    details: {
      freshness: "good",
      condition: "safe",
      estimated_shelf_life: "2-3 days",
      warnings: ["AI backend not configured - Using placeholder analysis"],
      note: "Integrate real AI (OpenAI, Gemini, or Google Vision) in production"
    }
  };
}


// ==============================================
// FUTURE API IMPLEMENTATIONS (Templates)
// ==============================================
// Copy these templates when ready to integrate APIs
// ==============================================

/*
// TEMPLATE 1: OPENAI VISION INTEGRATION
async function analyzeWithOpenAI(imageDataUrl) {
  const OpenAI = require('openai');
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const response = await client.vision.analyze({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageDataUrl }
            },
            {
              type: "text",
              text: `Analyze this food image and categorize it:
              
              Respond in JSON format:
              {
                "human": <percentage 0-100>,
                "cattle": <percentage 0-100>,
                "fertilizer": <percentage 0-100>,
                "recommendation": "<text description>",
                "freshness": "<fresh/okay/spoiled>",
                "warnings": [<array of concerns>]
              }
              
              Consider:
              - Food freshness and quality
              - Signs of mold or spoilage
              - Safety for human consumption
              - Suitability as animal feed
              - Decomposability for fertilizer`
            }
          ]
        }
      ]
    });

    const analysisText = response.choices[0].message.content;
    return JSON.parse(analysisText); // Parse JSON response
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    throw error;
  }
}
*/

/*
// TEMPLATE 2: GOOGLE GEMINI INTEGRATION
async function analyzeWithGemini(imageDataUrl) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const imageBuffer = Buffer.from(imageDataUrl.split(',')[1], 'base64');
    
    const response = await model.generateContent([
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: "image/jpeg"
        }
      },
      // Detailed prompt for food analysis
      \`Analyze this food image and provide a JSON response:
      {
        "human": <percentage>,
        "cattle": <percentage>,
        "fertilizer": <percentage>,
        "recommendation": "<description>",
        "confidence": "<high/medium/low>"
      }\`
    ]);

    const text = await response.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
}
*/

/*
// TEMPLATE 3: GOOGLE VISION API INTEGRATION
async function analyzeWithGoogleVision(imageDataUrl) {
  const vision = require('@google-cloud/vision');
  const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_CLOUD_VISION_KEY
  });

  try {
    const imageRequest = {
      image: { content: imageDataUrl.split(',')[1] },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'SAFE_SEARCH_DETECTION' }
      ]
    };

    const [result] = await client.annotateImage(imageRequest);
    
    // Parse labels and determine food suitability
    const labels = result.labelAnnotations;
    
    // Custom logic to analyze labels and determine percentages
    const analysis = categorizeFromLabels(labels);
    return analysis;
  } catch (error) {
    console.error("Google Vision analysis error:", error);
    throw error;
  }
}
*/