require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        console.log("Testing Gemini API...");
        console.log("API Key exists:", !!process.env.GEMINI_API_KEY);

        // Try to list models
        try {
            console.log("\nAttempting to list models...");
            const models = await genAI.listModels();
            console.log("Available models:");
            for await (const model of models) {
                console.log(`  - ${model.name}`);
            }
        } catch (error) {
            console.log("listModels error:", error.message);
        }

        // Try different model names
        const modelNames = ["gemini-pro", "gemini-pro-vision", "gemini-1.5-pro", "gemini-1.5-pro-latest"];

        for (const modelName of modelNames) {
            try {
                console.log(`\nTesting model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`  ✓ ${modelName} works!`);
            } catch (error) {
                console.log(`  ✗ ${modelName} error: ${error.message.substring(0, 100)}`);
            }
        }

    } catch (error) {
        console.error("Test error:", error.message);
    }
}

testGemini();
