const { miniNotationDescription, miniToAbleton, miniNotationExamples } = require('./miniNotation.js');
const { abletonToCSV, csvToAbleton, csvNotationDescription, csvNotationExamples } = require('./csvNotation.js');
const { textToClip, constructPrompt} = require('./clipFormatter.js');
const { max, errorToMax } = require('./max.js');
const { getChatGptResponse, abort, API_KEY_MISSING_ERROR } = require('./openai.js');
const { checkIfMidiCorrect } = require('./checkIfMidiCorrect.js');
const { getColorCodeForScale } = require('./scaleColors.js');


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


		const notes = inputDict.notes;
		// construct csv notation
		const notesCSV = notes && notes.length > 0 ? notationEncoder(notes) : null;
        const promptMessage = constructPrompt(inputDict, notesCSV);

		// add prompt to history
		// if inputDict.historyStatus is false don't use previous history
		inputDict = { 
			...inputDict, 
			history: inputDict.historyStatus ? [...inputDict.history, promptMessage] : [promptMessage]
		};

        for (let tries = 0; tries < 3; tries++) {
            try {
                inputDict = await gptMidi(inputDict);
				max.post("output keys", Object.keys(inputDict));
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
    const { duration, history } = dict;
   

    // output history (for storage and saving in dictionary)
    max.outlet("processing", dict);

    // get actual midi message from chatgpt
    const midiMessage = await getChatGptResponse([...INITIAL_HISTORY, ...history], dict);
    const newHistory = [...history, midiMessage];
    const response = midiMessage.content;
	max.post(`got response\n-------\n${response}`);
    // Extracting data from response
    const { notation, title, explanation, key, duration: durationNew } = textToClip(response);

	// if a duration was returned use that else use the input duration
	const finalDuration = durationNew || duration;
	

    // Convert to ableton midi
    const abletonMidi = NOTATION_DECODER(notation, finalDuration);
    const midiError = checkIfMidiCorrect(abletonMidi);

    if (midiError) {
        throw new Error(midiError);
    }

	dict = { 
		...dict, 
		history: newHistory, 
		explanation, 
		title,
		key,
		duration: finalDuration,
		color: getColorCodeForScale(key),
		notes: abletonMidi,
	};


	max.post("determined color", dict.color,"from key", key);
    // if notation is csv we should delete the duration so it is estimated by ableton
    if (NOTATION_TYPE_OUTPUT === "csv") {
        delete dict.duration;
    }

    return dict;
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
	
	if (error.message === API_KEY_MISSING_ERROR) {
		max.post("error", error.message);
		throw new Error(error.message);
	}

	max.post("error", error.message, error.stack);
	
	if (error.response) {
		max.post("error", error.response.status, error.response.data);
	}

	max.post("trying again. error was not appended to the history (otherwise gpt seems to love to repeat commands)");
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
