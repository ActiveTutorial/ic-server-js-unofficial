// Dependency
const express = require('express');
const router = express.Router();
// Functions
const {
    findResults,
    addRecipe,
    itemExists,
    addItem 
} = require('../logic/databaseInteract');
const { requestLLM } = require('../logic/aiAPI');
const { getPrompt } = require('../logic/prompts');
// Config
const { allowedHosts } = require('../logic/config');

// Allowed origins
const allowedOrigins = allowedHosts;

// Default response
const nothing = { result: 'Nothing', emoji: '', isNew: false };

router.get('/', async (req, res) => {
    const origin = req.get('Origin');
    if (req.query.ref === 'app') {
        // Bypass CORS with ref=app
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.includes(origin)) {
        // Allow only specific origins
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // Block all other origins
        return res.status(403).send('Not allowed');
    }

    // Set headers
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Check if first and second are provided
    if (!req.query.first || !req.query.second) {
        return res.json(nothing);
    }

    // Neal case and trim inputs
    let first = nealCase(req.query.first.trim());
    let second = nealCase(req.query.second.trim());
    // Sort items alphabetically
    [first, second] = first < second ? [first, second] : [second, first];
    // Alive check
    // Both need to be alive (in the sense of being in db) and have a length less than 30
    const bothAlive = (await itemExists(first)) && (await itemExists(second))
        && first.length <= 30 && second.length <= 30;
    // If either item is dead, return Nothing
    if (!bothAlive) {
        return res.json(nothing);
    }

    // Get the result and emoji
    let apiResult = await getCraftResponse('result', first, second);
    let emoji = await getCraftResponse('emoji', apiResult.value);

    res.json({ result: apiResult.value || nothing.result, emoji: emoji.value || nothing.emoji, isNew: apiResult.isNew });
});

function nealCase(input) {
    return input.toLowerCase() // Handle "İ" incorrectly (it will neal case to "I")
        .split(' ')
        .map(word =>
             word[0] // Handle double spaces incorrectly (it will error)
             .toUpperCase() + word.slice(1)
        ).join(' ');
}

async function getCraftResponse(type, ...args) {
    switch (type) {
        case 'result':
            // Search db
            let apiResult = await findResults('result', args[0], args[1]);
            if (!apiResult) {
                // If not found, request from AI and add to db
                apiResult = await newRecipe(args[0], args[1]);
                return { value: apiResult.value, isNew: apiResult.isNew };
            }
            return { value: apiResult, isNew: false };
        case 'emoji':
            // 'Nothing' has no emoji
            if (args[0] === nothing.result) return { value: nothing.emoji };
            // Search db
            let emoji = await findResults('emoji', args[0]);
            if (!emoji) { // Means it's either not there or an empty string
                // If not found, request from AI and add to db
                emoji = await newEmoji(args[0]);
            }
            return { value: emoji };
        default:
            return null;
    }
}

async function newRecipe(first, second) {
    // Request from AI, diffrent prompt for self combinations
    let result = first === second ?
        await requestLLM(getPrompt('self', first, second)) :
        await requestLLM(getPrompt('normal', first, second)) ||
        'Nothing';
    let isNew = !(await itemExists(result)); // Dead means it's new
    // Only get everything after the last '='
    result = result.split('=')?.pop()?.trim() || 'Nothing'; 
    // Add to db if new
    if (isNew) await addRecipe(first, second, result);
    return { value: result, isNew: isNew };
}

async function newEmoji(item) {
    // Request from AI
    let newEmoji = await requestLLM(getPrompt('emoji', item));
    // Add to db
    await addItem(item, newEmoji);
    return newEmoji;
}

module.exports = router;
