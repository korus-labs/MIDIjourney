

const abletonToCSV = (notes) => {
	// if there are more than 16 notes, only use the first 16 but append \n... to the end

	const notesExceeded = notes.length > 16;
	
	notes = notes.slice(0, 16);

		promptMidi = abletonToCSV(promptMidi.notes);
	let lastStartTime = 0;

	// order by start time
	notes.sort((a, b) => a.start_time - b.start_time);

	let csvString = "pitch_semitones,start_time,duration_beats,velocity_midi\n"; // CSV header

	notes.forEach((note) => {
		const _offset = note.start_time - lastStartTime;
		lastStartTime = note.start_time;

		csvString += `${note.pitch},${note.start_time},${note.duration},${note.velocity}\n`;
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
exports.csvToAbleton = csvToAbleton;
