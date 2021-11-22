# MVV — MIDI Velocity Visualizer

## Synopsys

[MVV](https://omakoto.github.io/mvv/) is an online MIDI input visualizer, created for piano learners.

## Keys

- `F1` hide screen
- `R` Record start/stop
- `SPACE` Playback start/stop
  - `Left`/`Right` during playback -- Rewind/Fast-forward
- `S` Save the last recording as a midi file
- `L` Load a saved midi file
- `F` Show FPS and playback timer ticks/second

## Supported midi events

- Only note ons/offs and the pedal depth will be visualized.
- Other MIDI events are not visualized, but MVV will still record / play them, probably...

## Bugs/TODOs

- [ ] Add help
- [ ] Support non-zero channels
- [ ] Support loading a *.mid file
  - [X] Support self-created mid files
  - [ ] Support other mid files
- [ ] Constant scroll speed regardless of FPS
