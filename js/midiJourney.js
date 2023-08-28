const { miniNotationDescription, miniToAbleton, miniNotationExamples } = require('./miniNotation.js');
const { abletonToCSV, csvToAbleton, csvNotationDescription, csvNotationExamples } = require('./csvNotation.js');
const { textToClip, clipToText } = require('./clipFormatter.js');
const { max } = require('./max.js');
const { getChatGptResponse, abort } = require('./openai.js');
const { checkIfMidiCorrect } = require('./checkIfMidiCorrect.js');


const notationEncoder = abletonToCSV;

// const notationDecoder = miniToAbleton;
// const notationDescription = miniNotationDescription;
// const notationExamples = miniNotationExamples;

const NOTATION_TYPE_OUTPUT = "csv";

const NOTATION_DECODER = csvToAbleton;
const NOTATION_DESCRIPTION = csvNotationDescription;
const NOTATION_EXAMPLES = csvNotationExamples;


let INITIAL_HISTORY = [
	{ 
		"role": "system",
		"content": 
`You are an expert musical transformer and generator. 

${NOTATION_DESCRIPTION}

${NOTATION_EXAMPLES}
`}
];
exports.INITIAL_HISTORY = INITIAL_HISTORY;



/**
 * Main function to call. Handle the initialization of necessary variables, retrying on failures, and manage error handling.
 * @async
 * @param {Object} inputDict - The input parameters.
 * @returns {Promise<Object>} The modified input dictionary.
 * @throws Will throw an error if it fails to get a successful response after 3 tries.
 */
async function prompt(inputDict){
    max.post("Got the following data", Object.keys(inputDict));
	max.post("detailClip", inputDict.detailClip)
	max.post("apiKey", inputDict.apiKey);
    try {
		// set default values
		inputDict = {
			temperature: 0.7,
			gptModel: "gpt-3.5-turbo-0613",
			key: "unknown",
			title: "unknown",
			explanation: "n/a",
        	// 2 bars default duration if none is input
			duration: 2*4,
			history: [],
			...inputDict,
		}
        
        abort();


        const promptMessage = constructPrompt(inputDict);

		inputDict = { 
			...inputDict, 
			history: [...inputDict.history, promptMessage] 
		};

        for (let tries = 0; tries < 3; tries++) {
            try {
                inputDict = await gptMidi(inputDict);
                max.outlet("result", inputDict);
				return inputDict;
            } catch (error) {
				// handle error will just output the error to max if it is not canceled
				// else it will throw the error again
                handleError(error);
            }
        }
		throw new Error( "tried 3 times, but failed. giving up");
    } catch (error) {
        if (error.message !== "canceled") {
			errorToMax(error.message);
        }
    }
}


/**
 * Handles the core logic of the interaction with the GPT model.
 * @async
 * @param {Object} dict - The dictionary containing input parameters.
 * @returns {Promise<Object>} The dictionary with added or modified values.
 */
async function gptMidi(dict) {
    const { temperature, gptModel, duration, history } = dict;
   

    // output history (for storage and saving in dictionary)
    max.outlet("processing", dict);

    // get actual midi message from chatgpt
    const midiMessage = await getChatGptResponse([...INITIAL_HISTORY, ...history], { temperature, gptModel });
    const newHistory = [...history, midiMessage];
    const response = midiMessage.content;
	max.post(`got response\n-------\n${response}`);
    // Extracting data from response
    const { notation, title, explanation, key, duration: durationNew } = textToClip(response);

    dict = { 
		...dict, 
		history: newHistory, 
		explanation, 
		title,
		key,
		duration: durationNew || duration
	};

    // output history (for storage and saving in dictionary)
    max.outlet("processing", dict);

    // Convert to ableton midi
    const abletonMidi = NOTATION_DECODER(notation, duration);
    const midiError = checkIfMidiCorrect(abletonMidi);

    if (midiError) {
        throw new Error(midiError);
    }

    dict = { 
		...dict, 
		history: newHistory,
		notes: abletonMidi 
	};

    // if notation is csv we should delete the duration so it is estimated by ableton
    if (NOTATION_TYPE_OUTPUT === "csv") {
        delete dict.duration;
    }

    return dict;
}


/**
 * Constructs the prompt message for the GPT model based on input parameters.
 * @param {Object} params - The input parameters.
 * @param {string} params.promptText - The text to be used as the prompt for the GPT model.
 * @param {number} params.duration - The duration of the musical piece.
 * @param {Array} params.notes - The array containing note data.
 * @param {string} params.title - The title of the musical piece.
 * @param {string} params.key - The key of the musical piece.
 * @param {string} params.explanation - Additional explanation or details.
 * @returns {Object} The constructed prompt message object.
 */
function constructPrompt({promptText, duration, notes, title, key, explanation}) {
	
	if (!notes) 
		return { 
			role: "user", 
			content: `# Prompt\n${promptText}` 
		};

	// construct csv notation
	const notesCSV = notationEncoder(notes);
	// // construct prompt
	const inputPrompt = clipToText( {
		title,
		duration,
		key,
		explanation,
		notation: notesCSV
	});

	const prompt = 
`# Request
${inputPrompt}
# Prompt
${promptText}`;
	const promptMessage = { role: "user", content: prompt };
	return promptMessage;
}


/**
 * Handles any errors during the prompt function.
 * @param {Error} error - The error object.
 * @throws Will re-throw the error if it was an abort error.
 */
function handleError(error) {
	if (error.name === "AbortError" || error.message === "canceled") {
		max.post("cancelled!!!");
		throw new Error("canceled");
	}
	max.post("error", error.message, error.stack);
	if (error.response) {
		max.post("error", error.response.status, error.response.data);
	}
	max.post("trying again. error was not appended to the history (otherwise gpt seems to love to repeat commands)");
}


/**
 * Outputs errors to Max.
 * @param {...any} errorMessage - Error message(s) to be sent to Max.
 */
function errorToMax(...errorMessage) {
	max.post("error", ...errorMessage);
	max.outlet('error', errorMessage);
}



/**
 * Max message handlers.
 * @type {Object}
 */
max.addHandlers({
	'prompt' : (p) => {
		// if prompt is an array join into one string
		p = Array.isArray(p) ? p.join(" ") : p;
		prompt(p);
	},
	'cancel': () => {
		max.post("received cancel request");
		abort();
	}
	
});



async function test() {
	console.log(await prompt({
		notes: null,
		promptText: "beautiful melody in c major",
		duration: 8,
		gptModel: "gpt-3.5-turbo-0613",
		temperature: 0.7,
		apiKey: process.env.OPENAI_API_KEY
	}));
}

// console.log(process.env.OPENAI_API_KEY)
// setTimeout(() => {
// 	test();
// }, 200);
