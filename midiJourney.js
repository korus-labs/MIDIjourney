//
// ChatGPT Node4Max Example
// written by Timo Hoogland
// 2023, www.timohoogland.com
//
// MIT License
//

require('dotenv').config();

let max = null;

try {
	max = require('max-api');
} catch(error) {
	max = {
		post: console.log,
		outlet: console.log,
		addHandlers: () => {}
	}
}

const { Configuration, OpenAIApi } = require('openai');
const { miniNotationDescription, miniToAbleton, miniNotationExamples } = require('./miniNotation.js');
const { abletonToCSV, csvToAbleton, csvNotationDescription, csvNotationExamples } = require('./csvNotation.js');

const notationEncoder = abletonToCSV;

// const notationDecoder = miniToAbleton;
// const notationDescription = miniNotationDescription;
// const notationExamples = miniNotationExamples;

const NOTATION_TYPE_OUTPUT = "csv";

const NOTATION_DECODER = csvToAbleton;
const NOTATION_DESCRIPTION = csvNotationDescription;
const NOTATION_EXAMPLES = csvNotationExamples;



// Use the API Key from the .env file
const config = new Configuration({
	apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);

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


async function prompt(inputDict){
    max.post("Got the following data", Object.keys(inputDict));

    try {
        let { notes=null, promptText="", duration: durationLive, gptModel, history=[] } = inputDict;
        
        if (abortController) { 
			abortController.abort();
			abortController = null;
		}

        // 2 bars default duration if none is input
        const durationBeats = durationLive > 0 ? durationLive : 2*4;
        const promptMessage = constructPrompt(notes, durationBeats, promptText);
        history = [...history, promptMessage];

        for (let tries = 0; tries < 3; tries++) {
            try {
                const outputDict = await gptMidi(inputDict, history, durationBeats);
                max.outlet("result", outputDict);
                history = newHistory; // Update history for the next iteration
                return;
            } catch (error) {
				// handle error will just output the error to max if it is not canceled
				// else it will throw the error again
                handleError(error);
            }
        }


		errorToMax( "tried 3 times, but failed. giving up");

    } catch (error) {
        if (error.message !== "canceled") {
			errorToMax(error.message);
        }
    }
}


// Function that handles the core logic inside the loop
async function gptMidi(inputDict, history, durationBeats) {
    const { temperature, gptModel } = inputDict;
    let outputDict = { ...inputDict, history };

    // output history (for storage and saving in dictionary)
    max.outlet("processing", outputDict);

    // get actual midi message from chatgpt
    const midiMessage = await getChatGptResponse(history, { temperature, gptModel });
    const newHistory = [...history, midiMessage];
    const response = midiMessage.content;

    // Extracting data from response
    const { parsedNotation, title, explanation } = extractData(response);

    outputDict = { 
		...outputDict, 
		history: newHistory, 
		explanation, 
		title 
	};

    // output history (for storage and saving in dictionary)
    max.outlet("processing", outputDict);

    // Convert to ableton midi
    const abletonMidi = NOTATION_DECODER(parsedNotation, durationBeats);
    const midiError = checkIfMidiCorrect(abletonMidi);

    if (midiError) {
        throw new Error(midiError);
    }

    outputDict = { 
		...outputDict, 
		history: newHistory,
		notes: abletonMidi 
	};

    // if notation is csv we should delete the duration so it is estimated by ableton
    if (NOTATION_TYPE_OUTPUT === "csv") {
        delete outputDict.duration;
    }

    return outputDict;
}


function handleError(error) {
	if (error.name === "AbortError" || error.message === "canceled") {
		max.post("canceled");
		throw new Error("canceled");
	}
	max.post("error", error.message);
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
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
		max.post("canceled");
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

function constructPrompt(notes, durationBeats, promptText) {
	// construct csv notation
	const notesCSV = notes ? notationEncoder(notes) : "";
	// construct prompt
	const gptPrompt = `duration_beats:${durationBeats}\n${notesCSV}${notesCSV}\prompt:${promptText}\n`;
	const promptMessage = { role: "user", content: gptPrompt };
	return promptMessage;
}


function errorToMax(...errorMessage) {
	max.post("error", ...errorMessage);
	max.outlet('error', errorMessage);
}


// extract these fields.
// Response format:
// # [title]
// # [explanation]
// [mini notation]
// to
// { title, explanation, parsedNotation }
function extractData(response) {
	
	response = response.split('\n');

	const title = response.shift().slice(1).trim();
	const explanation = response.shift().slice(1).trim();
	const miniNotationPart = response.join('\n').trim();
	
	let parsedNotation = null;
	try {
		parsedNotation = JSON.parse(miniNotationPart);
	} catch (error) {
		parsedNotation = miniNotationPart;
	}

	// remove all " ' ` and \ characters
	parsedNotation = parsedNotation.replace(/["'`\\]/g, '');
	
	return { parsedNotation, title, explanation };
}

async function getChatGptResponse(messages, {temperature, gptModel="gpt-3.5-turbo-0613"}) {
	messages = [...INITIAL_HISTORY, ...messages];
	max.post("getting chat gpt response. Temperature:", temperature, "model:", gptModel, "num messages:", messages.length)
	abortController = new AbortController();
	const chat = await openai.createChatCompletion({
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