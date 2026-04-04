const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyBiw2zC6fqaEimT2cTv0NviCjbuHPtnbUQ';
const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
    try {
        console.log('Testing Gemini 2.5 Flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Say: Gemini AI is working');
        console.log('✅ Success:', result.response.text());
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testGemini();
