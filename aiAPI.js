const axios = require('axios');
//require('dotenv').config();
const { apiCreds } = require('./config');

const API_URL = 'https://api.together.xyz/v1/completions';
const API_KEY = apiCreds.key;

async function requestLLM(prompt) {
    try {
        const response = await axios.post(
            API_URL,
            {
                model: 'meta-llama/Llama-2-70b-hf',
                prompt: prompt,
                max_tokens: 20, // Current token limit
                // AI settings, ask on Discord for more info
                temperature: 0,
                top_p: 0,
                top_k: 100,
                repetition_penalty: 1,
                stop: ['\n'] // Stop at new line
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.choices?.[0]?.text?.trim() || "Nothing";
    } catch (error) {
        return ""; // Return "" on error
    }
}

module.exports = { requestLLM };
