const express = require('express');
const router = express.Router();
const { findResults, addRecipe, itemExists, addItem } = require('../databaseInteract');
const { requestLLM } = require('../aiAPI');
const { getPrompt } = require('../prompts');
const { allowedHosts } = require('../config');

// Allowed origins
const allowedOrigins = allowedHosts;

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
        return res.json({ result: 'Nothing', emoji: '', isNew: false });
    }

    // Neal case and trim inputs
    const first = nealCase(req.query.first.trim());
    const second = nealCase(req.query.second.trim());
    // Sort items alphabetically
    const [item1, item2] = first < second ? [first, second] : [second, first];
    // Alive check
    // Both need to be alive (in the sense of being in db) and have a length less than 30
    const bothAlive = (await itemExists(first)) && (await itemExists(second))
        && first.length <= 30 && second.length <= 30;
    // If either item is dead, return Nothing
    if (!bothAlive) {
        return res.json({ result: 'Nothing', emoji: '', isNew: false });
    }

    // Get the result and emoji
    let apiResult = await getCraftResponse('result', item1, item2);
    let emoji = await getCraftResponse('emoji', apiResult.value);

    res.json({ result: apiResult.value || 'Nothing', emoji: emoji.value || '', isNew: apiResult.isNew });
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
            if (args[0] === 'Nothing') return { value: '' };
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
