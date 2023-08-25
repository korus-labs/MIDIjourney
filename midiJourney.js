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

const notationDecoder = csvToAbleton;
const notationDescription = csvNotationDescription;
const notationExamples = csvNotationExamples;


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

${notationDescription}

${notationExamples}
`}
]

let ACCUMULATED_HISTORY = [];


let abortController = null;
// The prompt send to OpenAI API with error handling
// Returns the result and a message 'done'
// Else returns a message 'error'
//= // "gpt-4-0613"; //  
async function prompt(inputDict){
	max.post("Got the following data", Object.keys(inputDict));
	try {

	let {temperature=0.5, notes=null, promptText="", duration: durationLive, gptModel, enableHistory} = inputDict;
	
	const duration = durationLive > 0 ? durationLive / 4 : 2;
	
	if (abortController)
		abortController.abort();

	let notesCSV = notes ? notationEncoder(notes) : "";
	
	// append duration to midi prompt
	notesCSV = `duration_beats:${duration*4}\n${notesCSV}`;
	// ${promptMidi}\n\nStart with the explanation.
	const gptPrompt =  `${notesCSV}\prompt:${promptText}\n`

	const promptMessage = { role: "user", content: gptPrompt };
	
	if (!enableHistory)
		ACCUMULATED_HISTORY = [promptMessage];
	else
		ACCUMULATED_HISTORY.push(promptMessage);
		
	for (let tries=0; tries<3; tries++) {
		try {
			const extraUserMessage = { role: "user", content: INITIAL_HISTORY[0].content };
			let messages = [...INITIAL_HISTORY, ...ACCUMULATED_HISTORY];

			// await chat completion with settings and chat history

			let outputDict = {...inputDict, history: messages};
			max.outlet("processing", outputDict); // output history (for storage and saving in dictionary
			// get actual midi message from chatgpt
			printMessages(messages);
			const midiMessage = await getChatGptResponse(messages, {temperature, gptModel});
			ACCUMULATED_HISTORY.push(midiMessage);
			messages = [...INITIAL_HISTORY, ...ACCUMULATED_HISTORY];


			const response = midiMessage.content;
			max.post(`---mini---\n${response}`)
			const { parsedNotation, title, explanation } = extractData(response);


			outputDict = {...outputDict, history: messages, explanation, title};
			max.outlet("processing", outputDict); // output history (for storage and saving in dictionary


			// output response to max patch
			max.post(`Converting mini notation to ableton midi.\nGot title: ${title}.\nDuration: ${duration}.\nNotation:${parsedNotation}`);

			const abletonMidi = notationDecoder(parsedNotation, duration);

			// check if midi is valid
			// there must be notes
			// each note must have a pitch, start_time, duration and velocity.
			// only start_time is allowed to be zero
			// create an expressive error message if the midi is invalid saying exactly which field was misformed
			let midiError = null;
			if (abletonMidi.length === 0) {
				midiError = "No notes found in midi";
			} else {
				abletonMidi.forEach((note) => {
					midiError = ""
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

			// max.post("got midi", abletonMidi)

			if (midiError) {
				max.post("midi error", midiError);
				max.outlet('error', midiError);
				throw new Error(midiError);
			}				

			outputDict = {
				...outputDict,
				notes: abletonMidi,
			};

			max.outlet("result", outputDict); 
			// output history (for storage and saving in dictionary)

			// max.outlet('done');
			break;
		} catch (error) {
			if (error.response){
				max.post(error.response.status);
				max.post(error.response.data);
				max.outlet('error', error.response.status);
				break;
			} else {
				const errorMessage = `Error: ${error.message}`; //\n A reminder of the notation: ${miniNotationDescription}`;
				// remove the last message from the history (so chatgpt doesnt repeat same mistakes)
				ACCUMULATED_HISTORY.pop();

				// ACCUMULATED_HISTORY.push({ role: "user", content: errorMessage });
				if (error.name === "AbortError" || error.message === "canceled") {
					max.post("canceled");
					break;
				}
				max.post("error", error.message);
				max.post("trying again. error was not appended to the history (otherwise gpt seems to love to repeat commands)");
			}
			
		}
	}
	} catch (error) {
		max.post("error", error.message);
		max.outlet('error', error.message);
	}
}

// Messages send from Max to node.script
// 
max.addHandlers({
	'prompt' : (p) => {
		// if prompt is an array join into one string
		p = Array.isArray(p) ? p.join(" ") : p;
		prompt(p);
	},
	'clearHistory' : () => {
		ACCUMULATED_HISTORY = [];
		max.post(`History cleared`);
	},
	'cancel': () => {
		if (abortController)
			abortController.abort();
		max.post("canceled");
	}
});


// extract these fields.
// Response format:
// # [title]
// # [explanation]
// [mini notation]


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