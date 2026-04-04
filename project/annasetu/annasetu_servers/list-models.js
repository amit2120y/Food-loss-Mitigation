const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyBiw2zC6fqaEimT2cTv0NviCjbuHPtnbUQ';
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log('Listing available models...\n');
        const models = await genAI.listModels();

        let count = 0;
        for await (const model of models) {
            count++;
            console.log(`${count}. ${model.name}`);
            console.log(`   Display Name: ${model.displayName}`);
            console.log(`   Support: generateContent=${model.supportedGenerationMethods?.includes('generateContent')}`);
            console.log('');
        }

        console.log(`Total models: ${count}`);
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

listModels();
