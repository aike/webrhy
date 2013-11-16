/*
 *
 * This program is licensed under the MIT License.
 * Copyright 2013, aike (@aike1000)
 *
 */


var gPatP = 0;
var gPatB = 0;
var gPatR = 0;
var gNextPatP = 0;
var gNextPatB = 0;
var gNextPatR = 0;

var ledP = new Array(16);
var ledR = new Array(16);
var ledB = new Array(16);
var led = new Array(16);

var led_now = 0;
var led_last = 15;

var gNum = 0;
var gBar = 0;
var gBeat = 0;

var gBpm = 150;
var gNoteLen = Math.floor(60 * 1000 / (4 * gBpm));

$(function() {

	var x = 120;
	var sx = 25;
	var bsx = 50;
	var y = 230;
	var bsy = 55;

	// Panel
	$('<img>').panel({
		id: 'panel',
		image: 'images/webrhy.png',
		left: 20,
		top: 40
	})
	.appendTo('#draw');

	// MIDI Device
	$('<select>')
	.attr({id:'portdd'})
	.css({
		position:'absolute',
		left: 630,
		top: 105,
		width: '190px',
		height: '20px',
		fontSize: '12px'
	})
	.change(function() {
		player.setPort(parseInt($(this).val(), 10));
		setupInstruments();
	})
	.appendTo('#draw');

	// BPM
	$('<img />').knob({
		id: 'knob_bpm', image: 'images/knob01.png',
		left: 695, top: 153, width: 40, height: 40, min: 0, max: 110, value: 60,
		change: (function() {
			gBpm = Math.floor($(this).knob('value')) + 90;
			gNoteLen = Math.floor(60 * 1000 / (4 * gBpm));
			$('#inp_bpm').val(gBpm);
		})
	}).appendTo('#draw');

	$('<input>')
	.attr({
		id: 'inp_bpm', type: 'number',
		min: 90, max: 200, value: 150
	})
	.css({
		position: 'absolute', left: 630, top: 160, width: 45
	})
	.change(function() {
		gBpm = $(this).val();
		gNoteLen = Math.floor(60 * 1000 / (4 * gBpm));
		$('#knob_bpm').knob('value', gBpm - 90);
	})
	.appendTo('#draw');

	// LED
	for (var i = 0; i < 16; i++) {
		(function(n) {
			led[n] = $('<img />').switch({
				id: 'led' + n, image: 'images/led.png',
				left: x + sx * (n + 1), top: y - 70, width: 22, height: 22, value: 0,
			}).appendTo('#draw');
		})(i);
		$('#ledp0').switch('value', 1);
	}

	// Button
	var keytop = ['Q','W','E','R','T','Y','U','I','O',
				  'A','S','D','F','G','H','J','K','L',
				  'Z','X','C','V','B','N','M',',','.'];

	for (var i = 0; i < 9; i++) {
		(function(n) {
			ledP[n] = $('<img />').switch({
				id: 'ledp' + n, image: 'images/button.png',
				left: x + bsx * n, top: y, width: 50, height: 50, value: 0,
				click: (function() {
					var val = $(this).switch('value');
					if (val == 0) {
						$(this).switch('value', 1);
						return;
					}
					for (var i = 0; i < 9; i++) {
						if (i != n) {
							$('#ledp' + i).switch('value', 0);
						}
					}
					gNextPatP = n;
				})
			}).appendTo('#draw');
			$('<div>')
			.css({
				position: 'absolute', left: x + bsx * n + 14, top: y + 10,
				color: 'rgba(240,240,240,0.7)', fontSize: '11px', cursor: 'default'
			})
			.text(keytop[i])
			.click(function() {
				var btn = $('#ledp' + n);
				btn.switch('value', 1);
				btn.switch('option', 'click').apply(ledP[n]);
			})
			.appendTo('#draw');
		})(i);
		$('#ledp0').switch('value', 1);

		(function(n) {
			ledB[n] = $('<img />').switch({
				id: 'ledb' + n, image: 'images/button.png',
				left: x + bsx * n, top: y + bsy, width: 50, height: 50, value: 0,
				click: (function() {
					var val = $(this).switch('value');
					if (val == 0) {
						$(this).switch('value', 1);
						return;
					}
					for (var i = 0; i < 9; i++) {
						if (i != n) {
							$('#ledb' + i).switch('value', 0);
						}
					}
					gNextPatB = n;
				})
			}).appendTo('#draw');
			$('<div>')
			.css({
				position: 'absolute', left: x + bsx * n + 14, top: y + bsy + 10,
				color: 'rgba(240,240,240,0.7)', fontSize: '11px', cursor: 'default'
			})
			.text(keytop[i + 9])
			.click(function() {
				var btn = $('#ledb' + n);
				btn.switch('value', 1);
				btn.switch('option', 'click').apply(ledB[n]);
			})
			.appendTo('#draw');
		})(i);
		$('#ledb0').switch('value', 1);

		(function(n) {
			ledR[n] = $('<img />').switch({
				id: 'ledr' + n, image: 'images/button.png',
				left: x + bsx * n, top: y + bsy * 2, width: 50, height: 50, value: 0,
				click: (function() {
					var val = $(this).switch('value');
					if (val == 0) {
						$(this).switch('value', 1);
						return;
					}
					for (var i = 0; i < 9; i++) {
						if (i != n) {
							$('#ledr' + i).switch('value', 0);
						}
					}
					gNextPatR = n;
				})
			}).appendTo('#draw');
			$('<div>')
			.css({
				position: 'absolute', left: x + bsx * n + 14, top: y + bsy * 2 + 10,
				color: 'rgba(240,240,240,0.7)', fontSize: '11px', cursor: 'default'
			})
			.text(keytop[i + 18])
			.click(function() {
				var btn = $('#ledr' + n);
				btn.switch('value', 1);
				btn.switch('option', 'click').apply(ledR[n]);
			})
			.appendTo('#draw');
		})(i);
		$('#ledr0').switch('value', 1);
	}

	// Ch
	$('<input>')
	.attr({
		id: 'ch_s', type: 'number',
		min: 1, max: 16, value: 1
	})
	.css({
		position: 'absolute', left: 600, top: y + 12, width: 35
	})
	.change(function() {
	})
	.appendTo('#draw');

	$('<input>')
	.attr({
		id: 'ch_b', type: 'number',
		min: 1, max: 16, value: 2
	})
	.css({
		position: 'absolute', left: 600, top: y + 12 + bsy * 1, width: 35
	})
	.change(function() {
	})
	.appendTo('#draw');

	$('<input>')
	.attr({
		id: 'ch_r', type: 'number',
		min: 1, max: 16, value: 10
	})
	.css({
		position: 'absolute', left: 600, top: y + 12 + bsy * 2, width: 35
	})
	.change(function() {
	})
	.appendTo('#draw');

	// Bank
	$('<input>')
	.attr({
		id: 'bank_s', type: 'number',
		min: 1, max: 128, value: 1
	})
	.css({
		position: 'absolute', left: 660, top: y + 12, width: 35
	})
	.change(function() {
		player.setProgram(0, $('#bank_s').val(), $('#pgm_s').val());
	})
	.appendTo('#draw');

	$('<input>')
	.attr({
		id: 'bank_b', type: 'number',
		min: 1, max: 128, value: 1
	})
	.css({
		position: 'absolute', left: 660, top: y + 12 + bsy * 1, width: 35
	})
	.change(function() {
		player.setProgram(1, $('#bank_b').val(), $('#pgm_b').val());
	})
	.appendTo('#draw');

	$('<input>')
	.attr({
		id: 'bank_r', type: 'number',
		min: 1, max: 128, value: 1
	})
	.css({
		position: 'absolute', left: 660, top: y + 12 + bsy * 2, width: 35
	})
	.change(function() {
		player.setProgram(2, $('#bank_r').val(), $('#pgm_r').val());
	})
	.appendTo('#draw');

	// Pgm
	$('<input>')
	.attr({
		id: 'pgm_s', type: 'number',
		min: 1, max: 128, value: 82
	})
	.css({
		position: 'absolute', left: 720, top: y + 12, width: 35
	})
	.change(function() {
		player.setProgram(0, $('#bank_s').val(), $('#pgm_s').val());
	})
	.appendTo('#draw');

	$('<input>')
	.attr({
		id: 'pgm_b', type: 'number',
		min: 1, max: 128, value: 39
	})
	.css({
		position: 'absolute', left: 720, top: y + 12 + bsy * 1, width: 35
	})
	.change(function() {
		player.setProgram(1, $('#bank_b').val(), $('#pgm_b').val());
	})
	.appendTo('#draw');

	$('<input>')
	.attr({
		id: 'pgm_r', type: 'number',
		min: 1, max: 128, value: 3
	})
	.css({
		position: 'absolute', left: 720, top: y + 12 + bsy * 2, width: 35
	})
	.change(function() {
		player.setProgram(2, $('#bank_r').val(), $('#pgm_r').val());
	})
	.appendTo('#draw');


	// Level/Pan
	$('<img />').knob({
		id: 'knob_sl', image: 'images/knob01.png',
		left: 785, top: y + 5, width: 40, height: 40, max: 127, value: 64,
		change: (function() {
			player.setVolume(0, $(this).knob('value'));
		})
	}).appendTo('#draw');

	$('<img />').knob({
		id: 'knob_sp', image: 'images/knob01.png',
		left: 845, top: y + 5, width: 40, height: 40, max: 127, value: 64,
		change: (function() {
			player.setPan(0, $(this).knob('value'));
		})
	}).appendTo('#draw');

	$('<img />').knob({
		id: 'knob_bl', image: 'images/knob01.png',
		left: 785, top: y + 5 + bsy * 1, width: 40, height: 40, max: 127, value: 64,
		change: (function() {
			player.setVolume(1, $(this).knob('value'));
		})
	}).appendTo('#draw');

	$('<img />').knob({
		id: 'knob_bp', image: 'images/knob01.png',
		left: 845, top: y + 5 + bsy * 1, width: 40, height: 40, max: 127, value: 64,
		change: (function() {
			player.setPan(1, $(this).knob('value'));
		})
	}).appendTo('#draw');

	$('<img />').knob({
		id: 'knob_rl', image: 'images/knob01.png',
		left: 785, top: y + 5 + bsy * 2, width: 40, height: 40, max: 127, value: 64,
		change: (function() {
			player.setVolume(2, $(this).knob('value'));
		})
	}).appendTo('#draw');

	$('<img />').knob({
		id: 'knob_rp', image: 'images/knob01.png',
		left: 845, top: y + 5 + bsy * 2, width: 40, height: 40, max: 127, value: 64,
		change: (function() {
			player.setPan(2, $(this).knob('value'));
		})
	}).appendTo('#draw');

	var setupInstruments = function() {
		// Seq port 0  inst 0  bank 14 pgm 39
		player.setVolume(1, $('#knob_sl').knob('value'));
		player.setPan(0, $('#knob_sp').knob('value'));
		player.setGlide(0, 20);
		player.setProgram(0, $('#bank_s').val(), $('#pgm_s').val());

		// Bass port 0  inst 1  bank 14 pgm 39
		player.setVolume(1, $('#knob_bl').knob('value'));
		player.setPan(1, $('#knob_bp').knob('value'));
		player.setGlide(1, 10);
		player.setProgram(1, $('#bank_b').val(), $('#pgm_b').val());

		// Drum port 0  inst 2  bank 1 pgm 3
		player.setVolume(2, $('#knob_rl').knob('value'));
		player.setPan(2, $('#knob_rp').knob('value'));
		player.setProgram(2, $('#bank_r').val(), $('#pgm_r').val());
	}

	var selpat = function(t, n) {
		switch (t) {
			case 0:
				for (var i = 0; i < n; i++)
					$('#ledp' + i).switch('value', 0);
				$('#ledp' + n).switch('value', 1);
				for (var i = n + 1; i < 9; i++)
					$('#ledp' + i).switch('value', 0);
				gNextPatP = n;
				break;
			case 1:
				for (var i = 0; i < n; i++)
					$('#ledb' + i).switch('value', 0);
				$('#ledb' + n).switch('value', 1);
				for (var i = n + 1; i < 9; i++)
					$('#ledb' + i).switch('value', 0);
				gNextPatB = n;
				break;
			case 2:
				for (var i = 0; i < n; i++)
					$('#ledr' + i).switch('value', 0);
				$('#ledr' + n).switch('value', 1);
				for (var i = n + 1; i < 9; i++)
					$('#ledr' + i).switch('value', 0);
				gNextPatR = n;
				break;
		}
	}

	shortcut.add("esc",function() {
		selpat(0, 0);
		selpat(1, 0);
		selpat(2, 0);
	});
	shortcut.add("return",function() {
		selpat(0, 0);
		selpat(1, 0);
		selpat(2, 0);
	});
	shortcut.add("Q",function() { selpat(0, 0); });
	shortcut.add("W",function() { selpat(0, 1); });
	shortcut.add("E",function() { selpat(0, 2); });
	shortcut.add("R",function() { selpat(0, 3); });
	shortcut.add("T",function() { selpat(0, 4); });
	shortcut.add("Y",function() { selpat(0, 5); });
	shortcut.add("U",function() { selpat(0, 6); });
	shortcut.add("I",function() { selpat(0, 7); });
	shortcut.add("O",function() { selpat(0, 8); });

	shortcut.add("A",function() { selpat(1, 0); });
	shortcut.add("S",function() { selpat(1, 1); });
	shortcut.add("D",function() { selpat(1, 2); });
	shortcut.add("F",function() { selpat(1, 3); });
	shortcut.add("G",function() { selpat(1, 4); });
	shortcut.add("H",function() { selpat(1, 5); });
	shortcut.add("J",function() { selpat(1, 6); });
	shortcut.add("K",function() { selpat(1, 7); });
	shortcut.add("L",function() { selpat(1, 8); });

	shortcut.add("Z",function() { selpat(2, 0); });
	shortcut.add("X",function() { selpat(2, 1); });
	shortcut.add("C",function() { selpat(2, 2); });
	shortcut.add("V",function() { selpat(2, 3); });
	shortcut.add("B",function() { selpat(2, 4); });
	shortcut.add("N",function() { selpat(2, 5); });
	shortcut.add("M",function() { selpat(2, 6); });
	shortcut.add(",",function() { selpat(2, 7); });
	shortcut.add(".",function() { selpat(2, 8); });

	var player = new Player(true);
	var pat = new PatternGenerator();
	pat.initPatterns();

	var sequencer = function(success) {
		player.MidiAvailable = success;
		player.setPort(-1);
		$.each(player.getDeviceList(), function(){
			var option = $('<option>', this);
			$('#portdd').append(option);
		});		

		setupInstruments();

		var play = function() {
			$('#led' + led_last).switch('value', 0);
			$('#led' + led_now).switch('value', 1);
			led_last++;
			led_now++;
			if (led_last > 15) led_last = 0;
			if (led_now > 15) led_now = 0;

			player.resetTimeBase();
			if (pat.seqR[gPatR][gBeat] > 0) {
				player.noteOn(2, pat.seqR[gPatR][gBeat], gNoteLen);
			}
			if (pat.seqB[gPatB][gBeat] > 0) {
				player.noteOn(1, pat.seqB[gPatB][gBeat] + 12, gNoteLen * 0.8);
			}
			if (pat.seqP[gPatP][gBeat] > 0) {
				var len = gNoteLen;
				if ((gBeat < 15) && (pat.seqP[gPatP][gBeat + 1] === 0)) {
					len *= 2;
				}
				player.noteOn(0, pat.seqP[gPatP][gBeat] + 12, len);
			}

			gBeat++;
			if (gBeat > 15) {
				gBar++;
				gBeat = 0;
				gPatP = gNextPatP;
				gPatB = gNextPatB;
				gPatR = gNextPatR;
			}
			setTimeout(play, gNoteLen);
		};

		setTimeout(play, 0);
	};

	player.init(sequencer);

});
