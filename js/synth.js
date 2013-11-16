/*
 *
 * This program is licensed under the MIT License.
 * Copyright 2013, aike (@aike1000)
 *
 */

var Synth = function(ctx, balance, oscs, usedelay, ffreq, ffreqw, delta, q) {
	this.ctx = ctx;

	this.balance = balance;

	this.oscs = oscs;
	var base_freq = 50;
	var amount = 0.5;
	var freq = Math.min(100, this.base_freq + this.eg * this.amount * 100);

    this.lowpass = ctx.createBiquadFilter();
	this.lowpass.type = 0; // LPF
	this.lowpass.Q.value = q;
	this.lowpass.frequency.value = ffreq;

	this.lfoAngle = 0;
	var self = this;
	var lfo = function() {
		self.lfoAngle += delta;
		if (self.lfoAngle > 2 * Math.PI)
			self.lfoAngle -= 2 * Math.PI;
		self.lowpass.frequency.value = ffreq + Math.sin(self.lfoAngle) * ffreqw;
	}
	setInterval(lfo, 100);

	this.gain = ctx.createGain();
	this.gain.gain.value = 0.5 * balance / this.oscs;

	this.pan = ctx.createPanner();
	this.pan.setPosition(0, 0, -1.0);

    ///////


	if (usedelay) {

		var delay1 = ctx.createDelay();
		var delay1gain = ctx.createGain();
		var delay2 = ctx.createDelay();
		var delay2gain = ctx.createGain();

		delay1.delayTime.value = 0.3;
		delay1gain.gain.value = 0.3;
		delay2.delayTime.value = 0.6;
		delay2gain.gain.value = 0.1;

		this.lowpass.connect(this.gain);
		this.lowpass.connect(delay1);
		this.lowpass.connect(delay2);

		delay1.connect(delay1gain);
		delay2.connect(delay2gain);
		delay1gain.connect(this.gain);
		delay2gain.connect(this.gain);

	} else {
		this.lowpass.connect(this.gain);
	}

	this.gain.connect(this.pan);
	this.pan.connect(ctx.destination);

}

Synth.prototype.createOsc = function(freq) {
	this.osc = this.ctx.createOscillator();
    this.osc.type = 2;
}

Synth.prototype.noteOn = function(note_no, len) {
	var freq =  440.0 * Math.pow(2.0, (note_no - 69.0) / 12.0);
	var o = new Array(this.oscs);
	for (var i = 0; i < o.length; i++) {
		o[i] = this.ctx.createOscillator();
		o[i].frequency.value = freq + 3 * i;

    	o[i].type = ["sine","square","sawtooth","triangle"][2];
    	o[i].type = 2;

		o[i].connect(this.lowpass);
		if (!o[i].start) {
			o[i].start = o[i].noteOn;
			o[i].stop = o[i].noteOff;
		}
		o[i].start(0);
		var os = o[i];
		(function(n) {
			setTimeout(function() { o[n].stop(0); }, len);
		})(i);
	}
}

Synth.prototype.setVolume = function(val) {
	this.gain.gain.value = 	val * this.balance / (127 * this.oscs);
}

Synth.prototype.setPan = function(val) {
	this.pan.setPosition((val - 64) / 64, 0, -1.0);
}

Synth.prototype.setGlide = function() {
	
}
