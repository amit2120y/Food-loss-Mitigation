// Test the decision category function
const analysis1 = { human: 85, cattle: 10, fertilizer: 5 };
const analysis2 = { human: 10, cattle: 45, fertilizer: 45 };
const analysis3 = { human: 5, cattle: 10, fertilizer: 85 };

function determineCategory(analysis) {
    const { human, cattle, fertilizer } = analysis;
    const maxScore = Math.max(human, cattle, fertilizer);

    if (human === maxScore && human >= 60) {
        return {
            category: "human",
            emoji: "🧑",
            label: "Human Consumption",
            description: "BEST FOR: Human food donation and consumption",
            color: "green"
        };
    } else if (cattle === maxScore && cattle >= 40 && cattle > human) {
        return {
            category: "cattle",
            emoji: "🐄",
            label: "Animal Feed",
            description: "BEST FOR: Animal feed and livestock nutrition",
            color: "blue"
        };
    } else if (fertilizer === maxScore && fertilizer >= 50) {
        return {
            category: "compost",
            emoji: "🌱",
            label: "Organic Compost",
            description: "BEST FOR: Composting and organic fertilizer production",
            color: "brown"
        };
    } else if (human > 50) {
        return {
            category: "human",
            emoji: "🧑",
            label: "Human Consumption",
            description: "Can be used for human consumption with proper handling",
            color: "green"
        };
    } else if (cattle > 30 && human < 50) {
        return {
            category: "cattle",
            emoji: "🐄",
            label: "Animal Feed",
            description: "Suitable for animal feed after proper processing",
            color: "blue"
        };
    } else {
        return {
            category: "compost",
            emoji: "🌱",
            label: "Organic Compost",
            description: "Best used for composting and waste management",
            color: "brown"
        };
    }
}

console.log("Testing Category Decision Function:\n");

console.log("Test 1 - Fresh Food (Human: 85%, Cattle: 10%, Fertilizer: 5%):");
console.log(determineCategory(analysis1));
console.log("");

console.log("Test 2 - Aging Food (Human: 10%, Cattle: 45%, Fertilizer: 45%):");
console.log(determineCategory(analysis2));
console.log("");

console.log("Test 3 - Spoiled Food (Human: 5%, Cattle: 10%, Fertilizer: 85%):");
console.log(determineCategory(analysis3));
