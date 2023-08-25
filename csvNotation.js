
const abletonToCSV = (notes) => {
	// if there are more than 16 notes, only use the first 16 but append \n... to the end

	const notesExceeded = notes.length > 16;
	
	notes = notes.slice(0, 16);

	let lastStartTime = 0;

	// order by start time
	notes.sort((a, b) => a.start_time - b.start_time);

	let csvString = "pitch_semitones,start_time,duration_beats\n"; // CSV header

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

const csvNotationDescription = `
- Respond in a structured way with title, explanation of what you will do and each on their own line followed by the csv notation.
- The title should be short (20 characters maximum).
- Start times and durations are in beats. 
- Time signature is 4/4. 
- the first downbeat is at beat 0 and the second at beat 4.


Response format:
# [title]
# [explanation]
pitch_semitones,start_time,duration_beats
[pitch],[start_time],[duration]
...
`;

const csvNotationExamples = `

prompt: a boards of canada style chord progression in C major

response:
# Boc Style Chords (Am7 D7 G7 C7)
# Boards of Canada often employ simple yet emotionally evocative nostalgic chord progressions. E.g.: Am7 - D7 - G7 - C7 
pitch_semitones,start_time,duration_beats,velocity_midi
69,0,4
72,0.5,3.5
76,0,4
79,0.5,3.5
74,4,4
78,4.5,3.5
81,4,4
84,4.5,3.5
67,8,4
71,8.5,3.5
74,8,4
78,8.5,3.5
72,12,4
76,12.5,3.5
79,12,4
83,12.5,3.5


prompt: fuer elise melody for 1 bar

response:
# Fuer Elise (Am)
# The first bar typically consists of the notes E, D#, E, A, repeated in quick succession.  A "quaver" (eighth note) followed by a "semiquaver" (sixteenth note) pattern for each set of four notes.
start_time,duration_beats,velocity_midi
76,1,0.25
75,1.25,0.25
76,1.5,0.25
75,1.75,0.25
76,2,0.25
71,2.25,0.25
74,2.5,0.25
72,2.75,0.25
45,3,0.25
69,3,0.75
52,3.25,0.25
57,3.5,0.25
60,3.75,0.25
`;

exports.csvToAbleton = csvToAbleton;
exports.csvNotationDescription = csvNotationDescription;
exports.csvNotationExamples = csvNotationExamples;

// function to print float with 2 decimal places
const floatPrint = (n) => parseFloat(n.toFixed(2));


// console.log("abletonToCSV", abletonToCSV([{
// 	pitch: 60,
// 	start_time: 0,
// 	duration: 1
// 	}]