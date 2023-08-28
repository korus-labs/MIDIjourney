// MidiJourney is a Max for Live device that uses OpenAI's chatgpt to generate midi.
// written by Elliot Fouchy & Thomas Haferlach
// 2023, pixelynx.io
//
// MIT License
//
let max = null;

try {
	max = require('max-api');
} catch (error) {
	max = {
		post: console.log,
		outlet: console.log,
		addHandlers: () => { }
	};
}

exports.max = max;
