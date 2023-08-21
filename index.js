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
let ROLE = 'user';
let MAX_TOKENS = Infinity;
let GPT_MODEL = 'gpt-3.5-turbo-0613'; // "gpt-4-0613", //

let INITIAL_HISTORY = [
	{ 
		"role": "system",
		"content": 
`You are a MIDI transformer and generator. Only output MIDI notes as a CSV. 

Start times and durations are in beats. Time signature is 4/4. So the first downbeat is at beat 0 and the second at beat 4.

syntax example:
pitch_semitones,start_time,duration_beats,velocity_midi
36,0,0.25,96
36,2,0.75,70
39,2,0.5,40
42,3,1,120
`}
]

let ACCUMULATED_HISTORY = [];

let ACCUMULATED_HISTORY_ACTIVE = false;
// The prompt send to OpenAI API with error handling
// Returns the result and a message 'done'
// Else returns a message 'error'
//
async function prompt({temperature=0.5, promptMidi=null, promptText=""}){
	if (promptMidi?.notes)
		promptMidi = abletonToCSV(promptMidi.notes);

	
	const gptPrompt =  `${promptText}\n${promptMidi}`

	const promptMessage = { role: ROLE, content: gptPrompt };
	
	if (!ACCUMULATED_HISTORY_ACTIVE)
		ACCUMULATED_HISTORY = [promptMessage];

	const messages = [...INITIAL_HISTORY, ...ACCUMULATED_HISTORY];

	max.post("---prompting---\n"+JSON.stringify(messages, null, 2))
	for (let tries=0; tries<3; tries++) {
		try {
			// await chat completion with settings and chat history
			const chat = await openai.createChatCompletion({
				model: GPT_MODEL,
				messages,
				temperature,
				max_tokens: MAX_TOKENS
			});
			const message = chat.data.choices[0].message;

			ACCUMULATED_HISTORY.push({ role: "assistant", content: message });
		
			max.post(`---response---\n${message.content}`)
			// output response to max patch
			const abletonMidi = csvToAbleton(message.content);
			max.outlet("midi", {notes: abletonMidi});
			// output history (for storage and saving in dictionary)
			max.outlet('history', { history: INITIAL_HISTORY });
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
				messages.push({ role: ROLE, content: error.message });
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