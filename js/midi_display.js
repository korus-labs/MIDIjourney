// midi_display.js

// Global variables
var notes = [];

// Function to convert hex color to RGB array
function hexToRgb(hex) {
    var bigint = parseInt(hex.slice(1), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r / 255, g / 255, b / 255];
}

// Define background color using hex code
var backgroundColor = hexToRgb("#020016"); // Dark background

// Define note color using hex code
var noteColor = hexToRgb("#FFFFFF"); // White notes

// Set up the drawing context
mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

// Function to handle incoming dictionary messages
function dictionary(dictName) {
    // Access the Max dictionary
    var dict = new Dict(dictName);

    // Get the JSON string of the entire dict
    var jsonString = dict.stringify();

    // Parse the JSON string
    try {
        var jsonData = JSON.parse(jsonString);
    } catch (e) {
        post("Error parsing JSON: " + e.message + "\n");
        return;
    }

    // Get the notes array
    if (!jsonData.notes || jsonData.notes.length === 0) {
        post("No notes found in the dictionary.\n");
        return;
    }

    notes = jsonData.notes;

    // Request a redraw
    mgraphics.redraw();
}

// Function to clear the visualization and output a dictionary
function clear() {
    // Create a new Max dictionary
    var outputDict = new Dict("output_dict"); // Name can be anything

    // Set the 'notes' key to an array with one empty object
    outputDict.set("notes", [{}]);

    // Output the dictionary name to the outlet
    outlet(0, "dictionary", outputDict.name);

    // Clear the current notes array and redraw
    notes = [];
    mgraphics.redraw();
}

// Paint function called when the jsui needs to redraw
function paint() {
    var width = box.rect[2] - box.rect[0];
    var height = box.rect[3] - box.rect[1];

    // Clear the background with specified color
    with (mgraphics) {
        set_source_rgb(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
        rectangle(0, 0, width, height);
        fill();
    }

    // Check if notes are available
    if (!notes || notes.length === 0) {
        return;
    }

    // Define the time and pitch ranges
    var maxTime = getMaxTime(notes);
    var minTime = getMinTime(notes);
    var minPitch = getMinPitch(notes);
    var maxPitch = getMaxPitch(notes);

    // Avoid division by zero
    if (maxTime === minTime) maxTime += 1;
    if (maxPitch === minPitch) maxPitch += 1;

    // Calculate scales for mapping
    var xScale = width / (maxTime - minTime);
    var yScale = height / (maxPitch - minPitch);

    with (mgraphics) {
        // Draw each note as a rectangle
        for (var i = 0; i < notes.length; i++) {
            var note = notes[i];

            // Skip muted notes
            if (note.mute) continue;

            // Map MIDI data to coordinates
            var x = (note.start_time - minTime) * xScale;
            var w = note.duration * xScale;
            var y = (maxPitch - note.pitch) * yScale;
            var h = yScale;

            // Map velocity to alpha (transparency)
            var velocityAlpha = note.velocity / 127;

            // Set the note color with velocity-based transparency
            set_source_rgba(noteColor[0], noteColor[1], noteColor[2], velocityAlpha);

            // Draw the rectangle
            rectangle(x, y, w, h);
            fill();
        }
    }
}

// Helper functions to get max and min values
function getMaxTime(notesArray) {
    var maxTime = 0;
    for (var i = 0; i < notesArray.length; i++) {
        var endTime = notesArray[i].start_time + notesArray[i].duration;
        if (endTime > maxTime) maxTime = endTime;
    }
    return maxTime;
}

function getMinTime(notesArray) {
    var minTime = Infinity;
    for (var i = 0; i < notesArray.length; i++) {
        if (notesArray[i].start_time < minTime) minTime = notesArray[i].start_time;
    }
    return minTime;
}

function getMinPitch(notesArray) {
    var minPitch = 127;
    for (var i = 0; i < notesArray.length; i++) {
        if (notesArray[i].pitch < minPitch) minPitch = notesArray[i].pitch;
    }
    return minPitch;
}

function getMaxPitch(notesArray) {
    var maxPitch = 0;
    for (var i = 0; i < notesArray.length; i++) {
        if (notesArray[i].pitch > maxPitch) maxPitch = notesArray[i].pitch;
    }
    return maxPitch;
}