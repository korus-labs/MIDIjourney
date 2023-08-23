//
// ChatGPT Node4Max Example
// written by Timo Hoogland
// 2023, www.timohoogland.com
//
// MIT License
//

require('dotenv').config();

const max = require('max-api');
const { Configuration, OpenAIApi } = require('openai');

// Use the API Key from the .env file
const config = new Configuration({
	apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);

// Settings
let MAX_TOKENS = Infinity;
let GPT_MODEL = 'gpt-3.5-turbo-0613'; // "gpt-4-0613"; //  

let INITIAL_HISTORY = [
	{ 
		"role": "system",
		"content": 
`You are a MIDI transformer and generator. You are a music expert. Only output MIDI notes as a CSV. 

Start times and durations are in beats. Time signature is 4/4. So the first downbeat is at beat 0 and the second at beat 4.
Respond first with your reasoning and in a subsequent message with the MIDI notes.

examples:

input:
a boards of canada style chord progression

explanation:
Boards of Canada often employ simple yet emotionally evocative chord progressions that are combined with vintage synth tones, textural layers, and nostalgic samples to create their distinctive sound.

Here is a simple chord progression that might evoke a Boards of Canada-like feeling:

Copy code
Am7 - D7 - Gmaj7 - Cmaj7

midi:
pitch_semitones,start_time,duration_beats,velocity_midi
69,0,4,100
72,0.5,3.5,90
76,0,4,85
79,0.5,3.5,95

74,4,4,105
78,4.5,3.5,95
81,4,4,100
84,4.5,3.5,90

67,8,4,80
71,8.5,3.5,100
74,8,4,90
78,8.5,3.5,85

72,12,4,95
76,12.5,3.5,105
79,12,4,100
83,12.5,3.5,90


input:
fuer elise melody for 1 bar

explanation:
The first bar typically consists of the notes E, D#, E, A, repeated in quick succession. The pattern is usually played with a certain rhythm, often described as a "quaver" (eighth note) followed by a "semiquaver" (sixteenth note) pattern for each set of four notes.

midi:
start_time,duration_beats,velocity_midi
76,1,0.25,71
75,1.25,0.25,38
76,1.5,0.25,57
75,1.75,0.25,70
76,2,0.25,76
71,2.25,0.25,76
74,2.5,0.25,76
72,2.75,0.25,83
45,3,0.25,64
69,3,0.75,89
52,3.25,0.25,64
57,3.5,0.25,70
60,3.75,0.25,76
`}
]

let ACCUMULATED_HISTORY = [];



let ACCUMULATED_HISTORY_ACTIVE = false;


let abortController = null;
// The prompt send to OpenAI API with error handling
// Returns the result and a message 'done'
// Else returns a message 'error'
//
async function prompt({temperature=0.5, promptMidi=null, promptText=""}){
	if (abortController)
		abortController.abort();

	if (promptMidi && promptMidi.notes)
		promptMidi = abletonToCSV(promptMidi.notes);

	
	const gptPrompt =  `${promptText}\n${promptMidi}\n\nStart with the explanation.`

	const promptMessage = { role: "user", content: gptPrompt };
	
	if (!ACCUMULATED_HISTORY_ACTIVE)
		ACCUMULATED_HISTORY = [promptMessage];
	else
		ACCUMULATED_HISTORY.push(promptMessage);

	const extraUserMessage = { role: "user", content: INITIAL_HISTORY[0].content };
	let messages = [...INITIAL_HISTORY, ...ACCUMULATED_HISTORY];

	max.post("---prompting---\n"+JSON.stringify(messages, null, 2))
	for (let tries=0; tries<3; tries++) {
		try {
			// await chat completion with settings and chat history
			const explanationMessage = await getChatGptResponse(messages, temperature);
			ACCUMULATED_HISTORY.push(explanationMessage);
			messages = [...INITIAL_HISTORY, ...ACCUMULATED_HISTORY];

			max.post(`---explanation---\n${explanationMessage.content}`)
			max.outlet("explanation", explanationMessage.content)
			// get actual midi message from chatgpt
			max.post("---prompting---\n"+JSON.stringify(messages, null, 2))
			const midiMessage = await getChatGptResponse(messages, temperature);
			ACCUMULATED_HISTORY.push(midiMessage);
			messages = [...INITIAL_HISTORY, ...ACCUMULATED_HISTORY];

			max.post(`---midi---\n${midiMessage.content}`)
			// output response to max patch
			const abletonMidi = csvToAbleton(midiMessage.content);
			max.outlet("midi", {notes: abletonMidi});
			// output history (for storage and saving in dictionary)
			max.outlet('history', { history: messages });
			// max.outlet('done');
			break;
		} catch (error) {
			if (error.response){
				max.post(error.response.status);
				max.post(error.response.data);
				max.outlet('error', error.response.status);
				break;
			} else {
				max.post(error.message);
				messages.push({ role: "user", content: error.message });
				max.post("trying again");
			}
			
		}
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
	'gptModel' : (m) => {
		GPT_MODEL = m;
		max.post(`GPT Model set to ${GPT_MODEL}`);
	},
	'enableHistory' : (a) => {
		ACCUMULATED_HISTORY_ACTIVE = a;
		max.post(`Accumulate History set to ${ACCUMULATED_HISTORY_ACTIVE}`);
	},
	'cancel': () => {
		if (abortController)
			abortController.abort();
		max.post("canceled");
	}
});




const abletonToCSV = (notes) => {
  let lastStartTime = 0;

  // order by start time
  notes.sort((a, b) => a.start_time - b.start_time);

  let csvString = "pitch_semitones,start_time,duration_beats,velocity_midi\n"; // CSV header

  notes.forEach((note) => {
    const _offset = note.start_time - lastStartTime;
    lastStartTime = note.start_time;
    
    csvString += `${note.pitch},${note.start_time},${note.duration},${note.velocity}\n`;
  });

  return csvString;
};


const csvToAbleton = (csvString) => {
	console.log("converting to ableton format", csvString)
	const lines = csvString.trim().split('\n');
	const header = lines.shift().split("#")[0].split(',');
  
	let lastStartTime = 0;
	const notes = lines.map((line) => {
	  const [pitch, start_time, duration, velocity] = line.split(',').map(Number);
	  if (!pitch || !velocity || !duration)
		return null;
	//   if (delay_beats < 0) {
	// 	throw new Error('delay_beats must be positive');
	//   }
	// if (start_time < lastStartTime) {
	// 	throw new Error('start_time must be monotonically increasing');
	// }			

	  lastStartTime = start_time;
	  
	  return {
		pitch,
		start_time,
		duration,
		velocity
	  };
	}).filter((note) => note !== null);
  
	return notes;
  };

async function 	getChatGptResponse(messages, temperature) {
	abortController = new AbortController();
	const chat = await openai.createChatCompletion({
		model: GPT_MODEL,
		messages,
		temperature,
		max_tokens: MAX_TOKENS
	}, { signal: abortController.signal });
	const message = chat.data.choices[0].message;
	abortController = null;
	return message;
}
