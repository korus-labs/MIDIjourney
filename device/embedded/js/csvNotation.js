const { clipToText } = require('./clipFormatter.js');

const MAX_NOTES_FOR_INPUT = 24;

const CSV_HEADER = "pitch,time,duration";

const abletonToCSV = (notes) => {
	// if there are more than 16 notes, only use the first 16 but append \n... to the end

	const notesExceeded = notes.length > MAX_NOTES_FOR_INPUT;
	
	notes = notes.slice(0, MAX_NOTES_FOR_INPUT);

	let lastStartTime = 0;

	// order by start time
	notes.sort((a, b) => a.start_time - b.start_time);

	let csvString = `${CSV_HEADER}\n`; 

	notes.forEach((note) => {
		const _offset = note.start_time - lastStartTime;
		lastStartTime = note.start_time;
		csvString += `${floatPrint(note.pitch)},${floatPrint(note.start_time)},${floatPrint(note.duration)}\n`;
	});

	if (notesExceeded)
		csvString += "...\n";
	return csvString;
};

exports.abletonToCSV = abletonToCSV;


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
...`
});



console.log(responseFormat);

const csvNotationDescription = `
- Respond in a structured way with title, explanation of what you will do, key, duration and notation.
- The response is in YAML format. 
- The notation is in CSV format.
- The title should be short (20 characters maximum).
- Start times and durations are in beats. 
- Time signature is 4/4. 
- the first downbeat is at beat 0 and the second at beat 4.


# Response format
${responseFormat}`;


const example2Input = clipToText({
	title: "Simple 1 bar progression in A minor",
	explanation: "I will play a simple 1 bar progression in A minor.",
	duration: 4,
	key: "A minor",
	notation:
`${CSV_HEADER}
60,0,2
64,0,2
67,0,2
71,0,2
62,2,2
...`});

const example2Prompt = "Transform this into a chirpy arpeggio"

const example2 = clipToText({
	title: "Chirpy Arpeggio",
	explanation: "I will transform the given chord progression into a chirpy arpeggio by playing the notes of each chord in a quick succession.",
	duration: 4,
	key: "A minor",
	notation:
`${CSV_HEADER}
60,0,0.5
64,0.5,0.5
67,1,0.5
71,1.5,0.5
62,2,0.5
...`});

const example1Prompt = "Make a boards of canada style chord progression in 4 bars."

const example1 = clipToText({
	title: "Boc Style Chords (Am7 D7 G7 C7)",
	explanation: "Boards of Canada often employ simple yet emotionally evocative nostalgic chord progressions. E.g.: Am7 D7 G7 C7",
	duration: 16,
	key: "C major",
	notation: 
`${CSV_HEADER}
69,0,4
72,0.5,3.5
76,0,4
79,0.5,3.5
74,4,4
78,4.5,3.5
81,4,4
84,4.5,3.5
...`});


// console.log(example2Input);
// console.log(example2);
// console.log(example1);

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

exports.csvToAbleton = csvToAbleton;
exports.csvNotationDescription = csvNotationDescription;
exports.csvNotationExamples = csvNotationExamples;

// function to print float with 2 decimal places
const floatPrint = (n) => parseFloat(n.toFixed(2));


// console.log("abletonToCSV", abletonToCSV([{
// 	pitch: 60,
// 	start_time: 0,
// 	duration: 1
// 	}]));