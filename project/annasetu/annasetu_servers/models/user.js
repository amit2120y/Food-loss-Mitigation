const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

name: {
type: String,
required: true
},

email: {
type: String,
required: true,
unique: true
},

phone: String,

password: {
type: String,
required: false
},

// Google OAuth fields
googleId: {
type: String,
unique: true,
sparse: true
},

googleEmail: String,
googleName: String,
googleProfilePicture: String,

// Authentication method
authMethod: {
type: String,
enum: ['email', 'google'],
default: 'email'
},

createdAt: {
type: Date,
default: Date.now
}

});

module.exports = mongoose.model("User", userSchema);