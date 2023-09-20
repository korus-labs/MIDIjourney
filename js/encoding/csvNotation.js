const { clipToText } = require('./clipFormatter.js');

const MAX_NOTES_FOR_INPUT = 24;

const CSV_HEADER = "pitch,time,duration,velocity";


/**
 * Converts Ableton note data to a CSV formatted string.
 * 
 * @param {Array} notes - An array containing Ableton Midi note data.
 * @returns {string} A CSV-formatted string.
 */
const abletonToCSV = (notes) => {
	// if there are more than 24 notes, only use the first 24 but append \n... to the end

	const notesExceeded = notes.length > MAX_NOTES_FOR_INPUT;
	
	notes = notes.slice(0, MAX_NOTES_FOR_INPUT);

	let lastStartTime = 0;

	// order by start time
	notes.sort((a, b) => a.start_time - b.start_time);

	let csvString = `${CSV_HEADER}\n`; 

	notes.forEach((note) => {
		const _offset = note.start_time - lastStartTime;
		lastStartTime = note.start_time;
		csvString += `${floatPrint(note.pitch)},${floatPrint(note.start_time)},${floatPrint(note.duration)},${floatPrint(note.velocity)}\n`;
	});

	if (notesExceeded)
		csvString += "...\n";
	return csvString;
};


/**
 * Converts a CSV-formatted string to Ableton note data.
 * 
 * @param {string} csvString - A CSV-formatted string.
 * @returns {Array} An array containing Ableton Midi note data.
 */
const csvToAbleton = (csvString) => {
	console.log("converting to ableton format", csvString);
	const lines = csvString.trim().split('\n');
	const header = lines.shift().split("#")[0].split(',');

	let lastStartTime = 0;
	const notes = lines.map((line) => {
		let [pitch, start_time, duration, velocity] = line.split(',').map(Number);
		if (!pitch  || !duration)
			return null;

		if (!velocity)
			velocity = 100;
		
		velocity = Math.min(Math.max(velocity, 1), 126);

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

// construct a response with placeholder values to show as an example to chatgpt
const responseFormat = clipToText({ 
	title: "title",
	explanation: "explanation - optional",
	duration: "duration in beats - optional", 
	key: "musical key - optional",
	notation: 
`${CSV_HEADER}
`
});



const csvNotationDescription = `
# Formats
Response: YAML
Notation: CSV

# Time and Rhythm
Start times and durations: Beats
Time signature: 4/4
First downbeat: Beat 0
Second downbeat: Beat 4
Velocity: 0-127

# Instrumentation
Drums: GM MIDI Pitches (e.g., 38=Snare Drum)

# Output format
${responseFormat}`;


const example2Input = clipToText({
	title: "Simple 1 bar progression in A minor",
	explanation: "I will play a simple 1 bar progression in A minor.",
	duration: 4,
	key: "A minor",
	notation:
`${CSV_HEADER}
60,0,1.75,63
64,0,2.25,76
67,0,2.33,92
71,0.45,1.8,110
62,2,2.5,127
`});

const example2Prompt = "Transform this into a chirpy arpeggio"

const example2 = clipToText({
	title: "Chirpy Arpeggio",
	explanation: "I will transform the given chord progression into a chirpy arpeggio by playing the notes of each chord in a quick succession.",
	duration: 4,
	key: "A minor",
	notation:
`${CSV_HEADER}
60,0,0.5,80
64,0.66,0.33,100
67,1.33,0.66,120
71,2,1.75,127
62,4,0.66,55
`});

const example1Prompt = "Make a boards of canada style chord progression in 4 bars."

const example1 = clipToText({
	title: "Boc Style Chords (Am7 D7 G7 C7)",
	explanation: "Boards of Canada often employ simple yet emotionally evocative nostalgic chord progressions. E.g.: Am7 D7 G7 C7",
	duration: 16,
	key: "C major",
	notation: 
`${CSV_HEADER}
69,0,4.25,50
72,0.25,3.5,65
76,0.66,3.66,95
79,1.33,3,110
74,4.25,3.75,75
78,4.5,3.44,90
81,4.85,3.33,100
84,4.75,2.25,55
`});


const csvNotationExamples = 
`
# Request

# Prompt
${example1Prompt}

# Response
${example1}

# Request
${example2Input}

# Prompt
${example2Prompt}

# Response
${example2}`;

exports.abletonToCSV = abletonToCSV;
exports.csvToAbleton = csvToAbleton;
exports.csvNotationDescription = csvNotationDescription;
exports.csvNotationExamples = csvNotationExamples;

// function to print float with 2 decimal places
const floatPrint = (n) => parseFloat(n.toFixed(2));

