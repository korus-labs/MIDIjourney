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
let TEMPERATURE = 0.5;
let MAX_TOKENS = Infinity;

let INITIAL_HISTORY = [
	{ 
		"role": "system",
		"content": "You are a MIDI transformer and generator. Only output MIDI notes as a CSV with pitch,start_time_offset,duration,velocity"
	}
]

// The prompt send to OpenAI API with error handling
// Returns the result and a message 'done'
// Else returns a message 'error'
//
async function prompt(p){
	const abletonMidi = p?.promptMidi?.notes;
	if (abletonMidi)
		p.promptMidi = abletonToCSV(abletonMidi);
	

	p = JSON.stringify(p);
	try {


		const messages = [...INITIAL_HISTORY, { role: ROLE, content: p }];
		// await chat completion with settings and chat history
		const chat = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages,
			temperature: TEMPERATURE,
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
	// set the temperature
	'temperature' : (t) => {
		if (isNaN(t)){
			max.post(`Error: temperature ${t} is not a number`);
			return;
		}
		// temperature is a value between 0 and 2
		TEMPERATURE = Math.max(0, Math.min(2, t));
		max.post(`temperature: ${TEMPERATURE}`);
	},
});




const abletonToCSV = (notes) => {
  let lastStartTime = 0;
  let csvString = "pitch,start_time_offset,duration,velocity\n"; // CSV header

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