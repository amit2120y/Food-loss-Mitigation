// Test the improved validation logic

function analyzeFood(geminResponse) {
    let human = Math.max(0, Math.min(100, geminResponse.human || 50));
    let cattle = Math.max(0, Math.min(100, geminResponse.cattle || 30));
    let fertilizer = Math.max(0, Math.min(100, geminResponse.fertilizer || 20));

    console.log(`Raw Gemini scores: Human=${human}%, Cattle=${cattle}%, Fertilizer=${fertilizer}%`);

    // If food is spoiled (high fertilizer), ensure human is very low
    if (fertilizer > 70 && human > 20) {
        console.log(`⚠️ Spoilage detected (fertilizer=${fertilizer}%), reducing human score from ${human} to ${Math.max(5, human * 0.3)}`);
        human = Math.max(5, human * 0.3); // Reduce human score significantly
        cattle = Math.min(cattle, 30);
    }

    // If food is fresh (low fertilizer), ensure human is high
    if (fertilizer < 20 && human < 70) {
        console.log(`✅ Fresh food detected (fertilizer=${fertilizer}%), boosting human score from ${human} to 75`);
        human = Math.max(human, 75);
    }

    console.log(`Final scores: Human=${Math.round(human)}%, Cattle=${Math.round(cattle)}%, Fertilizer=${Math.round(fertilizer)}%\n`);

    return {
        human: Math.round(human),
        cattle: Math.round(cattle),
        fertilizer: Math.round(fertilizer)
    };
}

console.log("Test 1: Spoiled Food (Gemini returned Human=50%, Cattle=30%, Fertilizer=100%)");
analyzeFood({ human: 50, cattle: 30, fertilizer: 100 });

console.log("Test 2: Fresh Food (Gemini returned Human=85%, Cattle=5%, Fertilizer=10%)");
analyzeFood({ human: 85, cattle: 5, fertilizer: 10 });

console.log("Test 3: Old Food (Gemini returned Human=40%, Cattle=50%, Fertilizer=30%)");
analyzeFood({ human: 40, cattle: 50, fertilizer: 30 });

console.log("Test 4: Severely Spoiled (Gemini returned Human=20%, Cattle=10%, Fertilizer=95%)");
analyzeFood({ human: 20, cattle: 10, fertilizer: 95 });
