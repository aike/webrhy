/*
 *
 * This program is licensed under the MIT License.
 * Copyright 2013, aike (@aike1000)
 *
 */

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var Player = function(midiMode) {
	this.MidiMode = midiMode;
	this.MidiAvailable = false;
	this.noteLen = Math.floor(this.bpm * 1000 / 60 / 4);
	this.inst = [0, 1, 9];
}

Player.prototype.init = function(callback) {
	var ctx = new AudioContext();
	if (!ctx.createGain)
		ctx.createGain = ctx.createGainNode;
	if (!ctx.createDelay)
		ctx.createDelay = ctx.createDelayNode;
	this.drumVolume = ctx.createGain();
	this.synth = new Synth(ctx, 0.2, 3, true, 4000, 3000, 0.1, 20);
	this.bass = new Synth(ctx, 0.2, 1, false, 1500, 500, 0.07, 5);
	this.kick = new Sampler(ctx, 'wav/kick.wav');
	this.snare = new Sampler(ctx, 'wav/snare.wav');
	this.hat = new Sampler(ctx, 'wav/hat.wav');
	this.clap = new Sampler(ctx, 'wav/clap.wav');
	this.kick.connect(this.drumVolume);
	this.snare.connect(this.drumVolume);
	this.hat.connect(this.drumVolume);
	this.clap.connect(this.drumVolume);
	this.drumVolume.connect(ctx.destination);
	this.MidiMode = false;

	this.wmaw = new WebMIDIAPIWrapper(false);
	var self = this;
	this.wmaw.initMidi();
	this.midiPort = 0;
	this.wmaw.setMidiInputSelect = function() {};
	this.wmaw.setMidiOutputSelect = callback;
}

Player.prototype.getDeviceList = function() {
	var list = [];
	list.push({value: '-1', text:'Internal Web Audio API Synth'});

	if (this.MidiAvailable) {
		var outputs = this.wmaw.devices.outputs;
		for (var i = 0; i < outputs.length; i++) {
			list.push({value: i.toString(10), text:outputs[i].name});
		}
	}
	return list;
}

Player.prototype.noteOn = function(inst, note, len) {
	if (note === 0)
		return;

	if (this.MidiMode) {
		this.wmaw.sendNoteOn(this.midiPort, this.inst[inst], note, 100, 0);
		this.wmaw.sendNoteOff(this.midiPort, this.inst[inst], note, 100, len);
	} else {
		switch (inst) {
			case 0:
				this.synth.noteOn(note, len);
				break;
			case 1:
				this.bass.noteOn(note , len);
				break;
			case 2:
				switch (note) {
					case 36:
						this.kick.noteOn();
						break;
					case 39:
						this.clap.noteOn();
						break;
					case 40:
						this.snare.noteOn();
						break;
					case 42:
						this.hat.noteOn();
						break;
				}
				break;
		}
	}
}

Player.prototype.setChannel = function(inst, ch) {
	this.inst[inst] = ch - 1;
}

Player.prototype.setProgram = function(inst, bank, programNo) {
	if (this.MidiMode) {
		this.wmaw.sendControlChange(this.midiPort, this.inst[inst], 0, bank - 1);	// bank msb
		this.wmaw.sendControlChange(this.midiPort, this.inst[inst], 32, 0);			// bank lsb
		this.wmaw.sendProgramChange(this.midiPort, this.inst[inst], programNo - 1, 0);
	} else {
		// NOP
	}
}

Player.prototype.setVolume = function(inst, volume) {
	if (this.MidiMode) {
		this.wmaw.sendControlChange(this.midiPort, this.inst[inst],  7, volume);	// volume msb
		this.wmaw.sendControlChange(this.midiPort, this.inst[inst], 39, 0);	// volume lsb
	} else {
		switch (inst) {
			case 0:
				this.synth.setVolume(volume);
				break;
			case 1:
				this.bass.setVolume(volume);
				break;
			case 2:
				this.drumVolume.gain.value = volume / 127;
				break;
		}
	}
}

Player.prototype.setPan = function(inst, pan) {
	if (this.MidiMode) {
		this.wmaw.sendControlChange(this.midiPort, this.inst[inst], 10, 127 - pan);	// pan msb
		this.wmaw.sendControlChange(this.midiPort, this.inst[inst], 42, 0);			// pan lsb
	} else {
		switch (inst) {
			case 0:
				this.synth.setPan(pan);
				break;
			case 1:
				this.bass.setPan(pan);
				break;
			case 2:
				this.kick.setPan(pan);
				this.clap.setPan(pan);
				this.snare.setPan(pan);
				this.hat.setPan(pan);
				break;
		}
	}
}

Player.prototype.setGlide = function(inst, glide) {
	if (this.MidiMode) {
		if (glide > 0) {
			this.wmaw.sendControlChange(0, this.inst[inst], 65, 127);	// portamento on
			this.wmaw.sendControlChange(0, this.inst[inst],  5, glide);	// portamento time msb
			this.wmaw.sendControlChange(0, this.inst[inst], 37, 0);		// portamento time lsb
		} else {
			this.wmaw.sendControlChange(0, this.inst[inst], 65, 0);		// portamento off
		}
	} else {
		// NOP
	}
}

Player.prototype.setPort = function(port) {
	if (port < 0) {
		this.MidiMode = false;
	} else {
		this.MidiMode = true;
		this.wmaw.setMidiOutputToPort(port, 0);
	}
}

Player.prototype.resetTimeBase = function() {
	if (this.MidiMode) {
		this.wmaw.initializePerformanceNow();
	}
}
