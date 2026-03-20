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
password: hashedPassword,
authMethod: 'email'
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

// create token
const token = jwt.sign(
{ id: user._id },
process.env.JWT_SECRET,
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