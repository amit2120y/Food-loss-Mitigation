const apiKey = 'AIzaSyBiw2zC6fqaEimT2cTv0NviCjbuHPtnbUQ';

async function listModels() {
    try {
        console.log('Fetching available models...\n');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        console.log('Available Models:\n');
        data.models.forEach((model, i) => {
            const modelName = model.name.replace('models/', '');
            const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
            console.log(`${i + 1}. ${modelName}`);
            console.log(`   Status: ${model.lifecycleStage}`);
            console.log(`   Supports generateContent: ${supportsGenerate}`);
            if (model.inputTokenLimit) console.log(`   Max Input: ${model.inputTokenLimit} tokens`);
            console.log('');
        });

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

listModels();
