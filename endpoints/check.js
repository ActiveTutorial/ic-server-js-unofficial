const express = require('express');
const { findRecipe, findResults } = require('../databaseInteract');

const router = express.Router();

router.get('/', async (req, res) => {
    // Get inputs
    const { first, second, result } = req.query;

    // Check if inputs are provided
    if (!first || !second || !result) {
        return res.json({ valid: false, emoji: '' });
    }

    // Check if the recipe is valid
    const valid = await findRecipe(first, second, result);
    // Get emoji if valid
    const emoji = valid ? await findResults('emoji', result) || '' : '';

    // Return result
    res.json({ valid, emoji });
});

module.exports = router;
