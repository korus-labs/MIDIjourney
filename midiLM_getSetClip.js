inlets = 1;
outlets = 1;
var live_api = new LiveAPI("live_set view detail_clip");
var note_obj = {};

// Call the function to populate the dictionary
function GetNotes() {
    live_api = new LiveAPI("live_set view detail_clip");
    var notes_raw = live_api.call("get_notes_extended", 0, 127, 0, 9999);
    note_obj = JSON.parse(notes_raw);
    
    // Create a new dictionary object
    var notes_dict = new Dict("notes_dict");
    
    // Set the entire note_obj as a JSON string in the dictionary
    notes_dict.set("notes_json", JSON.stringify(note_obj));
    
    // Notify the Max environment about the dictionary
    outlet(0, "dictionary", notes_dict.name);
}

// Call the function to populate the dictionary
GetNotes();


// note_id: [int] the unique note identifier.
// pitch: [int] the MIDI note number, 0...127, 60 is C3.
// start_time: [float] the note start time in beats of absolute clip time.
// duration: [float] the note length in beats.
// velocity: [float] the note velocity, 0 ... 127.
// mute: [bool] 1 = the note is deactivated.
// probability: [float] the chance that the note will be played:
// velocity_deviation: [float] the range of velocity values at which the note can be pl
//release_velocity: [float] the note release velocity.

function Loadbang() {
    live_api - new LiveAPI("live_set view detail_clip");
}

function JitterPitch() {
    for (var i = 0; i < note_obj.notes.length; i++) {
        note_obj.notes[i].pitch += Math.floor((Math.random() * 8) - 4);
        delete note_obj.notes[i].note_id;
    }
}

function SetNotes() {
    live_api - new LiveAPI("live_set view detail_clip")
    live_api.call("remove_notes_extended", 0, 127, 0, 9999);
    live_api.call("add_new_notes", note_obj);
}