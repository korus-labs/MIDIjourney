# MidiJourney: Your AI Musical Companion

## Developed by Pixelynx ([pixelynx.io](https://pixelynx.io))

### Creators: Elliot Fouchy and Thomas Haferlach

Welcome to MidiJourney, a Max for Live device developed by Pixelynx. This tool integrates OpenAI's GPT technology into your Ableton Live setup, offering a unique AI collaboration experience for your music-making process.

## Amplify Your Creativity

MidiJourney isn't just a tool; it's your AI musical companion. Whether you're working on intricate solos, composing backing tracks, or fleshing out a new musical concept, MidiJourney can provide that extra spark to make your work shine.

Designed for ease of use, MidiJourney seamlessly integrates with Ableton Live. You don't need to be an AI expert to make the most out of it. The code is open-source and documented, providing you with all the resources you need.

## Getting Started

To use MidiJourney in Ableton Live:

1. Drag the device/MidiJourney.amxd file onto the master track of your Live project. 

2. Configure your OpenAI API access by following the steps in the "Setting Up OpenAI API Access" section above.

3. Click on an empty MIDI clip slot. 

4. Type a text prompt describing the musical idea you want generated.

5. Click the "Generate" button. MidiJourney will contact the OpenAI API and generate a new MIDI clip based on your prompt.

6. You can also click on an existing MIDI clip and modify the prompt to have MidiJourney generate variations or continuations of that musical idea.

## What's Inside?

Dive deeper into the code to explore the technical aspects. It's a learning opportunity to understand AI, music conversion, and interaction with various APIs.

### Main Files and Folders

- **device/MidiJourney.amxd**: This is the main Max for Live device.
- **patchers/**: Folder containing Max for Live patchers that contribute to device functionality.
- **csvNotation.js**: Focuses on converting between Ableton and CSV musical notations.
- **clipFormatter.js**: Responsible for parsing and exporting YAML data.
- **miniNotation.js**: Handles the music notation conversion process.
- **openai.js**: Manages the interactions with OpenAI's API.
- **midiJourney.js**: The core of MidiJourney. This file governs how MIDI messages are generated and manipulated.

### Setting Up OpenAI API Access

To use MidiJourney's OpenAI features, you'll need to set up API access:

1. Create an OpenAI account.
2. Verify your account.
3. Log in and navigate to the API section.
4. Generate a new API key.
5. Save this key securely.
6. Set up billing information.
7. Set usage limits to manage costs.

## License

This project is under the MIT License, giving you the freedom to explore and modify as you wish.

### Technologies Utilized

- [OpenAI GPT](https://openai.com/research/gpt-3/)
- [Ableton Live](https://www.ableton.com/)
- [Max MSP / Max for Live](https://cycling74.com/products/max)

Join us on this journey to redefine the boundaries of music creation!
