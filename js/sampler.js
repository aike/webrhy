/*
 *
 * This program is licensed under the MIT License.
 * Copyright 2013, aike (@aike1000)
 *
 */

/////////////////////////////////////////////////////
var SampleBuffer = function(ctx, url, callback) {
	this.ctx = ctx;
	this.url = url;
	this.onload = callback;
	this.buffer = null;
};

SampleBuffer.prototype.loadBuffer = function(callback) {
	var request = new XMLHttpRequest();
	request.open("GET", this.url, true);
	request.responseType = "arraybuffer";

	var self = this;
	request.onload = function() {
		self.ctx.decodeAudioData(
			request.response,
			function(buffer) {
				if (!buffer) {
					console.log('error decode buffer: ' + self.url);
					return;
				}
				self.buffer = buffer;
				if (callback) {
					callback(self.buffer.getChannelData(0));
				}
			},
			function() {
				console.log('error decoding process: ' + self.url);
				return;
			}
		);
	}
	request.onerror = function() {
		alert('BufferLoader: XHR error');
	}

	request.send();
}

/////////////////////////////////////////////////////
var Sampler = function (ctx, url) {
	this.ctx = ctx;
	this.url = url;
	this.sample = new SampleBuffer(this.ctx, url);
	this.sample.loadBuffer();

	this.pan = ctx.createPanner();
	this.pan.setPosition(0, 0, -1.0);
	this.gain = ctx.createGain();
	this.gain.gain.value = 1.0;
	this.pan.connect(this.gain);
};

Sampler.prototype.connect = function(node) {
	this.gain.connect(node);
}

Sampler.prototype.setVolume = function(val) {
	if (val != null)
		this.gain.gain.value = val / 127;
	else
		this.gain.gain.value = 64 / 127;
};

Sampler.prototype.setPan = function(val) {
	if (val != null)
		this.pan.setPosition((val - 64) / 64, 0, -1.0);
	else
		this.pan.setPosition(0, 0, -1.0);
};

Sampler.prototype.noteOn = function() {
	this.src = this.ctx.createBufferSource();
	if (!this.src.noteOn)
		this.src.noteOn = this.src.start;
	if (this.sample.buffer != null) {
		this.src.buffer = this.sample.buffer;
		this.src.connect(this.pan);
		this.src.noteOn(0);
	}
};

Sampler.prototype.noteOff = function() {
	if (!this.src.noteOff)
		this.src.noteOff = this.src.stop;
	this.src.noteOff(0);
};

