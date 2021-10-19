$( document ).ready(function() {
    navigator.requestMIDIAccess()
        .then(onMIDISuccess, onMIDIFailure);

});

function onMIDISuccess(midiAccess) {
    console.log(midiAccess);

    var inputs = midiAccess.inputs;
    var outputs = midiAccess.outputs;

    for (var input of inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}
function getMIDIMessage(midiMessage) {
    console.log(midiMessage);
}
