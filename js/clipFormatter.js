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


exports.textToClip = textToClip;
exports.clipToText = clipToText;