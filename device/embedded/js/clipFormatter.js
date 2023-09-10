const yaml = require('js-yaml');

// Response format:
// title: "String"  # Required
// duration: Integer  # Required
// key: "String"  # Optional
// explanation: "String"  # Optional
// notation: "String"  # Required, and can have multiple entries. In CSV format this would be one note per line
// to
// { title, explanation, notation }
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
		key: key?.trim() ?? null,
		explanation: explanation?.trim() ?? '',
		notation: cleanedNotation,
	};
}

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
		"key": key?.trim() ?? null,
		"explanation": explanation?.trim() ?? '',
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
		return userMessage(`# Prompt\n${promptText}`)

	// construct prompt
	const inputPrompt = clipToText({
		title,
		duration,
		key,
		explanation,
		notation
	});

	const prompt = `# Request
${inputPrompt}
# Prompt
${promptText}`;

	const promptMessage = userMessage(prompt);
	return promptMessage;
}

const userMessage = content => ({ role: "user", content });

exports.constructPrompt = constructPrompt;
exports.textToClip = textToClip;
exports.clipToText = clipToText;