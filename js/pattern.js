/*
 *
 * This program is licensed under the MIT License.
 * Copyright 2013, aike (@aike1000)
 *
 */


var PatternGenerator = function() {
	// [pattern][beat]
	this.seqP = new Array(9);
	for (var i = 0; i < 9; i++)
		this.seqP[i] = new Array(16);
	this.seqB = new Array(9);
	for (var i = 0; i < 9; i++)
		this.seqB[i] = new Array(16);
	this.seqR = new Array(9);
	for (var i = 0; i < 9; i++)
		this.seqR[i] = new Array(16);

	// Scaleの定義

	// A3:57   E4:64   A4:69
	// C3:48   G3:55   C4:60
	// G3:55   D4:62   G4:67
	// E3:52   B3:59   E4:64
	// F3:53   C4:60   F4:65
	this.noteP = new Array(5);
	this.noteP[0] = [ 57, 57, 57, 57, 57, 57, 64, 64, 57 ];
	this.noteP[1] = [ 48, 48, 48, 48, 48, 48, 55, 55, 48 ];
	this.noteP[2] = [ 55, 55, 55, 55, 55, 55, 62, 62, 55 ];
	this.noteP[3] = [ 52, 52, 59, 59, 55, 55, 53, 60, 57 ];
	this.noteP[4] = [ 57, 57, 60, 60, 64, 64, 59, 62, 65 ];

	// A0:21   E1:28   A1:33
	// C1:24   G1:31   C2:36
	// G0:19   D1:26   G1:31
	// E0:16   B0:23   E1:28
	this.noteB = new Array(4);
	this.noteB[0] = [ 21, 21, 21, 21, 21, 28, 28, 28, 33 ];
	this.noteB[1] = [ 24, 24, 24, 24, 24, 31, 31, 31, 36 ];
	this.noteB[2] = [ 19, 19, 19, 19, 19, 26, 26, 26, 31 ];
	this.noteB[3] = [ 16, 16, 16, 16, 16, 23, 23, 23, 28 ];

	// 36:BD   39:SD   40:CL   42:HH
	this.noteR = [ 0, 0, 36, 39, 40, 40, 42, 42, 42, 42 ];
}

PatternGenerator.prototype.initPatterns = function() {
	// Seq Init ///////////////////////////////////////////
	// パターン0 のときは必ずゼロ（ミュート）
	for (var i = 1; i < 16; i++)
		this.seqP[0][i] = 0;

	for (var i = 1; i < 9; i++) {
		var r = Math.floor(Math.random() * this.noteP.length)
		// パターン１は必ずトニック
		if (i === 1)
			r = 0;
		for (var j = 0; j < 16; j++) {
			// 裏拍はランダムでスキップ
			if (j % 2 == 1) {
				if (Math.floor(Math.random() * 16) < 1) {
					this.seqP[i][j] = 0;
					continue;
				}
			}
			this.seqP[i][j] = this.noteP[r][Math.floor(Math.random() * this.noteP[r].length)];
		}
	}

	// Bass Init ///////////////////////////////////////////
	// パターン0 のときは必ずゼロ（ミュート）
	for (var i = 1; i < 9; i++)
		this.seqB[0][i] = 0;

	for (var i = 1; i < 9; i++) {
		var r = Math.floor(Math.random() * this.noteB.length)
		// パターン１は必ずトニック
		if (i === 1)
			r = 0;
		// １拍目は必ずルート
		this.seqB[i][0] = this.noteB[r][0];
		// ２拍目以降の表拍
		for (var j = 2; j < 16; j += 2) {
			this.seqB[i][j] = this.noteB[r][Math.floor(Math.random() * this.noteB[r].length)];
		}
		// 裏拍
		for (var j = 1; j < 16; j += 2) {
			this.seqB[i][j] = this.noteB[r][Math.floor(Math.random() * this.noteB[r].length)];
		}
	}

	// Drum Init ///////////////////////////////////////////
	// パターン0 のときは必ずゼロ（ミュート）
	for (var i = 1; i < 16; i++)
		this.seqR[0][i] = 0;

	// ベーシックな四つ打ちを基本とする
	for (var i = 1; i < 9; i++) {
		this.seqR[i][0] = 36;
		this.seqR[i][1] = 0;
		this.seqR[i][2] = 42;
		this.seqR[i][3] = 0;
		this.seqR[i][4] = 36;
		this.seqR[i][5] = 0;
		this.seqR[i][6] = 42;
		this.seqR[i][7] = 0;
		this.seqR[i][8] = 36;
		this.seqR[i][9] = 0;
		this.seqR[i][10] = 42;
		this.seqR[i][11] = 0;
		this.seqR[i][12] = 36;
		this.seqR[i][13] = 0;
		this.seqR[i][14] = 42;
		this.seqR[i][15] = 0;
	}

	// 四つ打ちに別の音を追加・入れ替えする
	for (var i = 1; i < 9; i++) {
		// 表拍
		for (var j = 2; j < 16; j += 2) {
			if (j % 4 === 0) continue;
			if (Math.floor(Math.random() * 3) + 1 > i)
				continue;
			this.seqR[i][j] = this.noteR[Math.floor(Math.random() * this.noteR.length)];
		}
		// 裏拍
		for (var j = 1; j < 16; j += 2) {
			// パターンNoが大きいほど手数が多くなる
			if (Math.floor(Math.random() * 6) + 2 > i)
				continue;
			this.seqR[i][j] = this.noteR[Math.floor(Math.random() * (this.noteR.length - 2)) + 2];
		}
	}
	// patten8は必ずfill in
	for (var j = 8; j < 16; j++) {
		this.seqR[8][j] = 40;
	}
}
