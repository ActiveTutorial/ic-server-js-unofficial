const express = require('express');
const { findRecipe, findResults } = require('../databaseInteract');

const router = express.Router();

router.get('/', async (req, res) => {
    const { first, second, result } = req.query;

    if (!first || !second || !result) {
        return res.json({ valid: false, emoji: '' });
    }

    const valid = await findRecipe(first, second, result);
    const emoji = valid ? await findResults('emoji', result) || '' : '';

    res.json({ valid, emoji });
});

module.exports = router;
