require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const os = require('os');
const { max } = require('./max.js');

const apiKeyFilePath = `${os.homedir()}/.config/midijourney_api_key`;

let abortController = null;

// Settings
const MAX_TOKENS = Infinity;


const readKey = () => {
  try {
    return fs.readFileSync(apiKeyFilePath, 'utf8');
  } catch (error) {
    return null;
  }
};

const writeKey = (key) => {
  try {
    if (!fs.existsSync(`${os.homedir()}/.config`))
      fs.mkdirSync(`${os.homedir()}/.config`);
    fs.writeFileSync(apiKeyFilePath, key);
	max.post("wrote key to", apiKeyFilePath);
  } catch (error) {
    console.error(error);
  }
};

const openAIApi = (apiKey) => {
  if (apiKey) writeKey(apiKey);

  const finalApiKey = apiKey || readKey() || process.env.OPENAI_API_KEY;

  if (!finalApiKey) {
    throw new Error("No OpenAI API key found");
  }

  return new OpenAIApi(new Configuration({ apiKey: finalApiKey }));
};


async function getChatGptResponse(messages, { temperature, gptModel = "gpt-3.5-turbo-0613", apiKey }) {


	messages = [ ...messages];
	printMessages(messages);

	max.post("getting chat gpt response. Temperature:", temperature, "model:", gptModel, "num messages:", messages.length);

	abortController = new AbortController();

	const chat = await openAIApi(apiKey).createChatCompletion({
		model: gptModel,
		messages,
		temperature,
		max_tokens: MAX_TOKENS,
	}, { signal: abortController.signal });

	const message = chat.data.choices[0].message;
	abortController = null;
	return message;
}


function printMessages(messages) {
	max.post(`--- messages (${messages.length}) ---`);
	messages.forEach((m) => {
		max.post(`[${m.role}]:\n${m.content}\n`)
	});
	max.post(`--- end messages ---`);
}

function abort() {
	if (abortController) {
		abortController.abort();
		abortController = null;
	}
}


exports.getChatGptResponse = getChatGptResponse;
exports.abortController = abortController;
exports.abort = abort;