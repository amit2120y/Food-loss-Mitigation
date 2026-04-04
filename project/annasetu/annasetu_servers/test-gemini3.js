require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testAllModelVariants() {
    const variants = [
        "gemini-pro",
        "models/gemini-pro",
        "gemini-pro-vision",
        "models/gemini-pro-vision",
        "gemini-1.5-pro",
        "models/gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "models/gemini-1.5-pro-latest",
        "gemini-1.5-flash",
        "models/gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "models/gemini-1.5-flash-latest"
    ];

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    console.log("Testing model variants...\n");

    for (const modelName of variants) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`✓ ${modelName.padEnd(30)} - SUCCESS!`);
            return modelName;  // Return first working model
        } catch (error) {
            const msg = error.message.substring(0, 80);
            console.log(`✗ ${modelName.padEnd(30)} - Failed`);
        }
    }

    console.log("\n⚠️  None of the standard models work. Your API key might have limited access.");
}

testAllModelVariants();
