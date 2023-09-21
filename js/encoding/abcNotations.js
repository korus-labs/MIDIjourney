const abcjs = require("abcjs");
const { max } = require("../maxUtils/max");
const MidiFile = require('midi-file');
const { over } = require("ramda");

var abcMidi = "X:1\n" +
'%%MIDI program 4\n' +
'%%MIDI channel 4\n' +
'%%MIDI transpose -2\n' +
'T: midi options\n' +
'%score {RH LH}\n' +
'L:1/4\n' +
'Q:1/4=89\n' +
'K:A\n' +
'V:RH name="Right Hand"\n' +
'A[Bd]c2|\n' +
'V:LH clef=bass name="Left Hand"\n' +
'A,B,A,2|\n';

const abcStaccato = "X:1\n" +
    'T: staccato\n' +
    'L:1/4\n' +
    'Q:1/4=59\n' +
    'K:cm\n' +
    '.A.Bcd(ef)|\n';

const abcDrums = "X:1\n" +
    "T:percmap\n" +
    "%%MIDI drummap F 36 %bass drum 1\n" +
    "%%MIDI drummap c 38 %acoustic snare\n" +
    "%%MIDI drummap g 42 %closed hi hat\n" +
    "Q:1/4=50\n" +
    "K:C perc\n" +
    "[gF] g [gc] g [gF] g [gc] g | c c c c\n"	




// format an ABC notation string to be used as a prompt
// duration is in beats
const formatAsAbc = ({ overrideTitle, explanation,  key, notation=null, promptText = null }) => {
	let abcString = "X:1\nL:1/16\n";

	if (overrideTitle)
		abcString += `T:${overrideTitle}\n`;
    

	if (promptText || explanation)
		abcString += `N:${promptText || explanation}\n`;

	// if (duration)
	// 	abcString += `U: duration=${duration}\n`;

	if (key)
		abcString += `K:${key}\n`;

	if (notation)
		abcString += `|${notation}|`;
    if (!overrideTitle)
        abcString += `T:`;
    // else
    //     abcString += "|";

	return abcString;
};


// parse an ABC notation string and extract title, explanation, duration, key, notation
const parseAbc = (abcString) => {
	const title = abcString.match(/T:(.*)/);
	const explanation = abcString.match(/N:(.*)/);
	const duration = abcString.match(/L:(.*)/);
	const key = abcString.match(/K:(.*)/);
	// const notation = abcString.match(/\|(.*)\|/);

	return {
		title: title ? title[1] : null,
		explanation: explanation ? explanation[1] : null,
		duration: duration ? duration[1] : null,
		key: key ? key[1] : null,
		notation: abcString,
	};
}


function abcToAbleton(abcMidi) {
    const [midiUint8Array] = abcjs.synth.getMidiFile(abcMidi, { midiOutputType: "binary", pan: [-0.5, 0.5] });

    max.post("abcMidi", abcMidi);


    // convert to buffer
    const buffer = Buffer.from(midiUint8Array);

    // parse buffer
    const midiData = MidiFile.parseMidi(buffer);

    // max.post(JSON.stringify(midiData, null, 2));

    // create the list of lists of { pitch, start_time, duration, velocity } objects
    // need to parse and keep track of note on and note off events
    // remember that multiple notes can be on at the same time
    // use reduce
    // log ticksPerBeat
    console.log(midiData.header.ticksPerBeat);
    const tracks = midiData.tracks.map((track) => {
        const { notes } = track.reduce(({ notes, currentTime }, event) => {
            currentTime += event.deltaTime * 4 / midiData.header.ticksPerBeat;
            
            if (event.type === "noteOn") {
                notes.push({
                    pitch: event.noteNumber,
                    start_time: currentTime,
                    duration: 0,
                    velocity: event.velocity
                });
            }
            if (event.type === "noteOff") {
                const note = notes.find((note) => note.pitch === event.noteNumber && note.duration === 0);
                if (note) {

                    const duration = currentTime - note.start_time;
                    note.duration = duration;
                }
            }
            return { notes, currentTime };
        }, { notes: [], currentTime: 0 });
        return notes;
    });
    // limit to 64 notes for now
    return tracks[1].slice(0, 64);
}


const abcNotationExample1 = formatAsAbc({
    overrideTitle: "staccato in a minor",
    explanation: "create a simple staccato pattern in minor.",
    // duration: 4,
    key: "cm",
    notation: ".A.Bcd(ef)|"
});   

const abcNotationExample2 = `X:1
L:1/8
T:Jericho (tenor sax)
N:create the tenor sax part for Jericho
M:C
K:Dm
D^CDE FF G2|A A2 A-A4|G G2 G-G4|A A2 A-A4|`;

const abcNotationExample3 = `X:1
L: 1/8
T:Popcorn Arpeggio
N: Create an arpeggio that sounds like popcorn in minor
M: 4/4
K: Bmin
|:B2GB EBGB|EBGB =cAFA|B2GB EBGB|B=cef gfe=c:|
Bege bege|bege aff=c|Bege bege|B=cef gfe=c|
Bege bege|bege aff=c|gbgf e2e=c|B=cef gfe=c|`


const abcNotationDescription = `

${abcNotationExample1}
---
${abcNotationExample2}
---
${abcNotationExample3}
---
`;

const constructAbcPrompt = (metadata) => {
    return {role: "user", content: formatAsAbc(metadata)};
}

module.exports = {
    abcToAbleton,
    abcNotationDescription,
    parseAbc,
    constructAbcPrompt,
};