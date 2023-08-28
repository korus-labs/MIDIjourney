const { miniNotationDescription, miniToAbleton, miniNotationExamples } = require('./miniNotation.js');
const { abletonToCSV, csvToAbleton, csvNotationDescription, csvNotationExamples } = require('./csvNotation.js');
const { textToClip, clipToText } = require('./clipFormatter.js');
const { openAIApi, apiKey } = require('./openai.js');
const { max } = require('./max.js');



const notationEncoder = abletonToCSV;

// const notationDecoder = miniToAbleton;
// const notationDescription = miniNotationDescription;
// const notationExamples = miniNotationExamples;

const NOTATION_TYPE_OUTPUT = "csv";

const NOTATION_DECODER = csvToAbleton;
const NOTATION_DESCRIPTION = csvNotationDescription;
const NOTATION_EXAMPLES = csvNotationExamples;

// Settings
let MAX_TOKENS = Infinity;

let INITIAL_HISTORY = [
	{ 
		"role": "system",
		"content": 
`You are an expert musical transformer and generator. 

${NOTATION_DESCRIPTION}

${NOTATION_EXAMPLES}
`}
]


let abortController = null;


// handles the initialization of necessary variables, the outer loop that retries if it fails and the error handling
async function prompt(inputDict){
    max.post("Got the following data", Object.keys(inputDict));

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

        
        if (abortController) { 
			abortController.abort();
			abortController = null;
		}


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


// Function that handles the core logic inside the loop
async function gptMidi(dict) {
    const { temperature, gptModel, duration, history } = dict;
   

    // output history (for storage and saving in dictionary)
    max.outlet("processing", dict);

    // get actual midi message from chatgpt
    const midiMessage = await getChatGptResponse(history, { temperature, gptModel });
    const newHistory = [...history, midiMessage];
    const response = midiMessage.content;
	max.post(`got response\n-------\n${response}`);
    // Extracting data from response
    const { notation, title, explanation } = textToClip(response);

    dict = { 
		...dict, 
		history: newHistory, 
		explanation, 
		title
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

// if its cancelled rethrow otherwise just log so the loop can retry
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

// Messages send from Max to node.script
// 
max.addHandlers({
	'prompt' : (p) => {
		// if prompt is an array join into one string
		p = Array.isArray(p) ? p.join(" ") : p;
		prompt(p);
	},
	'cancel': () => {
		max.post("received cancel request");
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
	},
	'apikey': (key) => {
		max.post("apikey", apiKey(key));
	}
	
});


// check if midi is valid
// there must be notes
// each note must have a pitch, start_time, duration and velocity.
// only start_time is allowed to be zero
// create an expressive error message if the midi is invalid saying exactly which field was misformed
function checkIfMidiCorrect(abletonMidi) {
	let midiError = null;
	if (abletonMidi.length === 0) {
		midiError = "No notes found in midi";
	} else {
		abletonMidi.forEach((note) => {
			midiError = "";
			if (!note.pitch)
				midiError += "pitch is missing,";
			if (!note.duration)
				midiError += "duration is missing,";
			if (!note.velocity)
				midiError += "velocity is missing,";
			if (note.start_time === undefined)
				midiError += "start_time is missing,";
		});
	}
	return midiError;
}

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


function errorToMax(...errorMessage) {
	max.post("error", ...errorMessage);
	max.outlet('error', errorMessage);
}


async function getChatGptResponse(messages, {temperature, gptModel="gpt-3.5-turbo-0613"}) {
	

	messages = [...INITIAL_HISTORY, ...messages];
	printMessages(messages);

	max.post("getting chat gpt response. Temperature:", temperature, "model:", gptModel, "num messages:", messages.length);

	abortController = new AbortController();
	
	const chat = await openAIApi().createChatCompletion({
		model: gptModel,
		messages,
		temperature,
		max_tokens: MAX_TOKENS
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



async function test() {
	console.log(await prompt({
		notes: null,
		promptText: "beautiful melody in c major",
		duration: 8,
		gptModel: "gpt-3.5-turbo-0613",
		temperature: 0.7
	}));
}


setTimeout(() => {
	test();
}, 200);
