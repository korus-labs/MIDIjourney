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

let INITIAL_HISTORY = [
	{ 
		"role": "system",
		"content": 
`You are a MIDI transformer and generator. Only output MIDI notes as a CSV. Start times are relative to the previous note (i.e. delay_beats should be 0 if notes play at the same time. 1 if they are a quarter note apart and so on).

syntax example:
pitch_semitones,delay_beats,duration_beats,velocity_midi
36,0,0.25,96
39,2,0.75,70
36,1.5,0.5,40
...
`}
]

// The prompt send to OpenAI API with error handling
// Returns the result and a message 'done'
// Else returns a message 'error'
//
async function prompt({temperature=0.5, promptMidi=null, ...rest}){
	if (promptMidi?.notes)
		promptMidi = abletonToCSV(promptMidi.notes);

	
	const gptPrompt = JSON.stringify({
		...rest,
		promptMidi,
	});

	const messages = [...INITIAL_HISTORY, { role: ROLE, content: gptPrompt }];

	console.log("---prompting---\n", JSON.stringify(messages, null, 2))
	try {
		// await chat completion with settings and chat history
		const chat = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo', // "gpt-4-0613", //
			messages,
			temperature,
			max_tokens: MAX_TOKENS
		});
		const message = chat.data.choices[0].message;
		// output response to max patch
		const abletonMidi = csvToAbleton(message.content);
		max.outlet({notes: abletonMidi});
		// output history (for storage and saving in dictionary)
		max.outlet('history', { history: INITIAL_HISTORY });
		max.outlet('done');
	} catch (error) {
		if (error.response){
			max.post(error.response.status);
			max.post(error.response.data);
		} else {
			max.post(error.message);
		}
		max.outlet('error');
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
});




const abletonToCSV = (notes) => {
  let lastStartTime = 0;
  let csvString = "pitch_semitones,delay_beats,duration_beats,velocity_midi\n"; // CSV header

  notes.forEach((note) => {
    const offset = note.start_time - lastStartTime;
    lastStartTime = note.start_time;
    
    csvString += `${note.pitch},${offset},${note.duration},${note.velocity}\n`;
  });

  return csvString;
};


const csvToAbleton = (csvString) => {
	console.log("converting to ableton format", csvString)
	const lines = csvString.trim().split('\n');
	const header = lines.shift().split(',');
  
	let lastStartTime = 0;
	const notes = lines.map((line) => {
	  const [pitch, start_time_offset, duration, velocity] = line.split(',').map(Number);
  
	  lastStartTime += start_time_offset;
	  
	  return {
		pitch,
		start_time: lastStartTime,
		duration,
		velocity
	  };
	});
  
	return notes;
  };