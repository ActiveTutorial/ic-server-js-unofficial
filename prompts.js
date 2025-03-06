function getPrompt(type, ...args) {
    switch (type) {
        case "normal": // Most confirmed prompt, see IC discord, probably the real one
            return `Fire + Water = Steam
Human + Robe = Judge
Earth + Water = Plant
Cow + Fire = Steak
King + Ocean = Poseidon
${args[0]} + ${args[1]} =`;
        case "self": // Only Boulder is confirmed, but the first two are from Adam and seem real.
            return `Wind + Wind = Tornado
Water + Water = Lake
Earth + Earth = Mountain
Rock + Rock = Boulder
${args[0]} + ${args[1]} =`;
        case "emoji": // This one is entirely made up; Neal doesn’t use together.ai for emojis.
            return `Hat = 🎩
Key = 🔑
Bicycle = 🚲
Spicy = 🌶️
Clean = 🧼
Glasses = 💶
Eat = 🍽️
${args[0]} =`;
        default:
            return null;
    }
}

module.exports = { getPrompt };
