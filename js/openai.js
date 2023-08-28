require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');

const fs = require('fs');
// saves the key to $HOME/
const os = require('os');
const { max } = require('./max');

// read and write the key to $HOME/.config/midijourney_api_key
// create folder if it doesn't exist
const apiKeyStore = {
	get: () => {
		try {
			return fs.readFileSync(`${os.homedir()}/.config/midijourney_api_key`, 'utf8');
		} catch (error) {
			return null;
		}
	},
	set: (key) => {
		try {
			// create folder if it doesn't exist
			if (!fs.existsSync(`${os.homedir()}/.config`)) {
				fs.mkdirSync(`${os.homedir()}/.config`);
			}
			fs.writeFileSync(`${os.homedir()}/.config/midijourney_api_key`, key);
		} catch (error) {
			console.error(error);
		}
	}
}

exports.openAIApi = () => {
	const apiKey = apiKeyStore.get() || process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error("No OpenAI API key found");
	}

	const config = new Configuration({
		apiKey: apiKey
	});
	return new OpenAIApi(config);	
}

// api key getter/setter
exports.apiKey = (key) => {
	if (key)
		apiKeyStore.set("OPENAI_API_KEY", key);
	return apiKeyStore.get("OPENAI_API_KEY") || process.env.OPENAI_API_KEY;
}
