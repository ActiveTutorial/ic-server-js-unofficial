const express = require('express');
const router = express.Router();
const { findResults, addRecipe, aliveCheck, addItem } = require('../databaseInteract');
const { requestLLM } = require('../aiAPI');
const { getPrompt } = require('../prompts');

const allowedOrigins = ['http://localhost:3000', 'https://neal.fun'];

router.get('/', async (req, res) => {
    const origin = req.get('Origin');
    if (req.query.ref === 'app') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        return res.status(403).send('Not allowed');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    if (!req.query.first || !req.query.second) {
        return res.json({ result: 'Nothing', emoji: '', isNew: false });
    }

    const first = nealCase(req.query.first.trim());
    const second = nealCase(req.query.second.trim());
    const [item1, item2] = first < second ? [first, second] : [second, first];
    const bothAlive = aliveCheck(first) && aliveCheck(second);
    if (!bothAlive) {
        return res.json({ result: 'Nothing', emoji: '', isNew: false });
    }

    let apiResult = await getCraftResponse('result', item1, item2);
    let emoji = await getCraftResponse('emoji', apiResult.value);

    res.json({ result: apiResult.value || 'Nothing', emoji: emoji.value || '', isNew: apiResult.isNew });
});

function nealCase(input) {
    return input.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function getCraftResponse(type, ...args) {
    switch (type) {
        case 'result':
            let apiResult = await findResults('result', args[0], args[1]);
            if (!(aliveCheck(args[0]) && aliveCheck(args[1]) && args[0].length <= 30 && args[1].length <= 30)) {
                return { value: 'Nothing', isNew: false };
            }
            if (!apiResult) {
                apiResult = await newItem(args[0], args[1]);
                return { value: apiResult.value, isNew: apiResult.isNew };
            }
            return { value: apiResult, isNew: false };
        case 'emoji':
            if (args[0] === 'Nothing') return { value: '' };
            let emoji = await findResults('emoji', args[0]);
            if (!emoji) {
                emoji = await newEmoji(args[0]);
            }
            return { value: emoji };
        default:
            return null;
    }
}

async function newItem(first, second) {
    let result = first === second ? await requestLLM(getPrompt('self', first, second)) : await requestLLM(getPrompt('normal', first, second));
    let alive = await aliveCheck(result);
    result = result.split('=')?.pop()?.trim() || 'Nothing';
    if (!alive) await addRecipe(first, second, result);
    return { value: result, isNew: !alive };
}

async function newEmoji(item) {
    let newEmoji = await requestLLM(getPrompt('emoji', item));
    await addItem(item, newEmoji);
    return newEmoji;
}

module.exports = router;
