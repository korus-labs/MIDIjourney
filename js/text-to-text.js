const axios = require('axios');
const { max } = require('./maxUtils/max.js');
const fs = require('fs');
const path = require('path');

// Load the system prompt from an external .md file
const systemPromptPath = path.join(__dirname, 'system-prompt.md');
const systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');

/**
 * Function to generate text using the Pollinations API.
 * @async
 * @param {Object} inputDict - The input parameters.
 * @returns {Promise<Object>} The response from the Pollinations API.
 */
async function generateText(prompt) {
    try {
        const response = await axios.post('https://text.pollinations.ai/', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            seed: Math.floor(Math.random() * 10000),
            jsonMode: true,
            model: 'openai',
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = response.data;
        max.post("Received response from Pollinations API", data);
        return data;
    } catch (error) {
        max.post("Error fetching from Pollinations API", error.message);
        throw error;
    }
}

/**
 * Max message handlers for text-to-text generation.
 * @type {Object}
 */
max.addHandlers({
    'generateText': async (clipDict) => {
        try {
            const output = await generateText(JSON.stringify(clipDict));
            max.outlet("result", output);
        } catch (error) {
            max.post("failed", error.message);
        }
    }
});