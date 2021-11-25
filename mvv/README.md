# MVV - MIDI Velocity Visualizer

## Synopsys

[MVV](https://omakoto.github.io/mvv/) is an online MIDI input visualizer, created for piano learners.

## Keys

- `F1` hide screen
- `R` Record start/stop
- `SPACE` Playback start/stop
  - `Left`/`Right` during playback -- Rewind/Fast-forward
- `S` Save the last recording as a midi file
- `L` Load a `*.mid` file
- `F` Show FPS and playback timer resolution.

## Supported midi events

- Only note ons/offs and the pedal depth will be visualized.
- Other MIDI events are not visualized, but MVV will still record / play them, probably...

## Bugs/TODOs

- [ ] Add help
- [ ] Support pausing
- [ ] Show confirmation dialog before over-recording
- [ ] Support non-zero channels
- [ ] Better playback
  - [ ] Fast-forward should send all skipped control changes
  - [ ] Rewind should replay all control changes
- [X] Keep playing while in the BG too
- [X] Don't use `prompt()` (which stops playback)
- [X] Support loading a *.mid file
  - [X] Support self-created mid files
  - [X] Support other mid files
- [X] Constant scroll speed regardless of FPS
  - It should be mostly fixed with double-buffering now, as long as updating the hidden buffer finishes within 16 ms.
- [X] Show playback timestamp
