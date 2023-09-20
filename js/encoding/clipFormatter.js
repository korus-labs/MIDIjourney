const yaml = require('js-yaml');


/**
 * Converts a YAML-formatted response to a clip object.
 * 
 * @param {string} response - The YAML-formatted response string.
 * @returns {Object} A clip object.
 */
function textToClip(response) {
	let parsedResponse;
	try {
		parsedResponse = yaml.load(response);
	} catch (error) {
		console.error('Failed to parse YAML:', error);
		throw error;
	}

	// Destructure and check for required fields
	const { title, duration, key, explanation, notation } = parsedResponse;

	if (!title) {
		throw new Error('Missing required fields: title');
	}

	if (!notation) {
		throw new Error('Missing or empty required field: notation');
	}

	// Remove all " ' ` and \ characters in notes
	const cleanedNotation = notation.replace(/["'`\\]/g, '');

	return {
		title: title.trim(),
		duration,
		key: key ? key.trim() : null,
		explanation: explanation ? explanation.trim() : '',
		notation: cleanedNotation,
	};
}

/**
 * Converts a clip object to a YAML-formatted response.
 * 
 * @param {Object} clip - The clip object.
 * @returns {string} A YAML-formatted response string.
 */
const clipToText = ({ title, duration, key, explanation, notation }) => {
	if (!title || !duration) {
		throw new Error('Missing required fields: title and/or duration');
	}

	if (!notation) {
		throw new Error('Missing or empty required field: notation');
	}

	// Prepare the data object
	const data = {
		"title": title.trim(),
		"duration": duration,
		"key": key ? key.trim() : null,
		"explanation": explanation ? explanation.trim() : '',
		"notation": notation.replace(/["'`\\]/g, ''),
	};


	// Convert the data object to a YAML string
	let yamlString;
	try {
		yamlString = yaml.dump(data);
	} catch (error) {
		console.error('Failed to convert to YAML:', error);
		return null;
	}

	return yamlString;
};


/**
 * Constructs the prompt message for the GPT model based on input parameters.
 * @param {Object} params - The input parameters.
 * @param {string} params.promptText - The text to be used as the prompt for the GPT model.
 * @param {number} params.duration - The duration of the musical piece.
 * @param {string} params.notation - The array containing note data.
 * @param {string} params.title - The title of the musical piece.
 * @param {string} params.key - The key of the musical piece.
 * @param {string} params.explanation - Additional explanation or details.
 * @returns {Object} The constructed prompt message object.
 */
function constructPrompt({ promptText, duration, title, key, explanation}, notation) {

	if (!notation)
		return userMessage(`# Prompt\n${promptText}\n\n# Response\n`)

	// construct prompt
	const inputPrompt = clipToText({
		title,
		duration,
		key,
		explanation,
		notation
	});

	const prompt = `# Input
${inputPrompt}
# Transformation
${promptText}

# Output`;

	const promptMessage = userMessage(prompt);
	return promptMessage;
}


const userMessage = content => ({ role: "user", content });

exports.constructPrompt = constructPrompt;
exports.textToClip = textToClip;
exports.clipToText = clipToText;