require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const os = require('os');
const { max } = require('./maxUtils/max.js');

// Initialize global variables and constants
const apiKeyFilePath = `${os.homedir()}/.config/midijourney_api_key`;
const MAX_TOKENS = Infinity;
const API_KEY_MISSING_ERROR = `
Invalid OpenAI API key.
1. Create an OpenAI account and navigate to the API section.
2. Generate a new API key and paste it into the device's "API KEY" box.
`;


/**
 * Fetches a chat response from a GPT-3.5-turbo model.
 * 
 * @async
 * @param {Array} messages - An array of message objects to send to the GPT model.
 * @param {Object} options - Configuration options for the chat.
 * @param {number} options.temperature - Determines the randomness of the output.
 * @param {string} [options.gptModel="gpt-3.5-turbo-0613"] - The GPT model to use.
 * @param {string} options.apiKey - The API key for OpenAI.
 * @returns {Promise<string>} The generated message from the GPT model.
 * @throws Will throw an error if an invalid API key is provided.
 */
async function getChatGptResponse(messages, { temperature, gptModel = "gpt-3.5-turbo-0613", apiKey }) {
	messages = [...messages];
	printMessages(messages);
  
	max.post("Getting GPT response. Temperature:", temperature, "Model:", gptModel, "Num messages:", messages.length);
  
	abortController = new AbortController();
  
	try {
	  const chat = await openAIApi(apiKey).createChatCompletion({
		model: gptModel,
		messages,
		temperature,
		max_tokens: MAX_TOKENS,
	  }, { signal: abortController.signal });
  
	  const message = chat.data.choices[0].message;
    max.post("Setting abort controller to null")
	  abortController = null;
	  return message;
	} catch (error) {
	  max.post("OpenAI error", error.response);
    max.post("Setting abort controller to null")
    abortController = null;
	  // Check for an invalid API key and throw a custom error message
	  if (error?.response?.data?.error?.code === "invalid_api_key") 
		  throw new Error(API_KEY_MISSING_ERROR);
	  else 
		  throw error;
	}
}

let abortController = null;


// Read the API key from file
const readKey = () => {
  try {
    return fs.readFileSync(apiKeyFilePath, 'utf8');
  } catch (error) {
    return null;
  }
};

// Write the API key to file
const writeKey = (key) => {
  try {
    if (!fs.existsSync(`${os.homedir()}/.config`)) {
      fs.mkdirSync(`${os.homedir()}/.config`);
    }
    fs.writeFileSync(apiKeyFilePath, key);
    max.post("Wrote key to", apiKeyFilePath);
  } catch (error) {
    console.error(error);
  }
};

// Initialize the OpenAI API object
const openAIApi = (apiKey) => {
  if (apiKey) writeKey(apiKey);

  const finalApiKey = apiKey || readKey() || process.env.OPENAI_API_KEY;

  if (!finalApiKey) {
    throw new Error(API_KEY_MISSING_ERROR);
  }

  return new OpenAIApi(new Configuration({ apiKey: finalApiKey }));
};


// Print messages to the console
const printMessages = (messages) => {
  max.post(`--- Messages (${messages.length}) ---`);
  messages.forEach((m) => {
    max.post(`[${m.role}]:\n${m.content}\n`);
  });
  max.post(`--- End Messages ---`);
};

// Abort a running request
const abort = () => {
  
  if (abortController) {
    const stack = new Error().stack;
    max.post("Aborting request?", abortController, stack);
    abortController.abort();
    abortController = null;
  }
};

// Export functions and constants
exports.getChatGptResponse = getChatGptResponse;
exports.abort = abort;
exports.API_KEY_MISSING_ERROR = API_KEY_MISSING_ERROR;
