require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiAPI() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("API Key format check:");
        console.log("  - Key exists:", !!apiKey);
        console.log("  - Key length:", apiKey?.length);
        console.log("  - Starts with 'AIza':", apiKey?.startsWith("AIza"));

        const genAI = new GoogleGenerativeAI(apiKey);

        // Try with explicit API version
        const model = genAI.getGenerativeModel({
            model: "gemini-pro",
            apiVersion: "v1"  // Try v1 instead of v1beta
        });

        console.log("\nTrying to generate content with gemini-pro...");
        const result = await model.generateContent("Test");
        console.log("Success!");
        console.log(result.response.text());

    } catch (error) {
        console.error("Error:", error.message);
        console.error("Full error:", error);
    }
}

testGeminiAPI();
