// title:  Ticket Crusher
// author: Christopher Stokes
// desc:   Completely accurate simulation of Technical Support
// script: js

var fc = 0 //ongoing frame counter
var shake = 0 //screen shake
var shaked = 0 //shake distance

var swid = 240;
var shei = 136;

// utility
function collides(objA, objB) {
	if (objA.x < objB.x + objB.wid &&
		objA.x + objA.wid > objB.x &&
		objA.y < objB.y + objB.hei &&
		objA.y + objA.hei > objB.y) {
		return true;
	}
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
EasingFunctions = {
	// no easing, no acceleration
	linear: function (t) {
		return t
	},
	// accelerating from zero velocity
	easeInQuad: function (t) {
		return t * t
	},
	// decelerating to zero velocity
	easeOutQuad: function (t) {
		return t * (2 - t)
	},
	// acceleration until halfway, then deceleration
	easeInOutQuad: function (t) {
		return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
	},
	// accelerating from zero velocity 
	easeInCubic: function (t) {
		return t * t * t
	},
	// decelerating to zero velocity 
	easeOutCubic: function (t) {
		return (--t) * t * t + 1
	},
	// acceleration until halfway, then deceleration 
	easeInOutCubic: function (t) {
		return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
	},
	// accelerating from zero velocity 
	easeInQuart: function (t) {
		return t * t * t * t
	},
	// decelerating to zero velocity 
	easeOutQuart: function (t) {
		return 1 - (--t) * t * t * t
	},
	// acceleration until halfway, then deceleration
	easeInOutQuart: function (t) {
		return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
	},
	// accelerating from zero velocity
	easeInQuint: function (t) {
		return t * t * t * t * t
	},
	// decelerating to zero velocity
	easeOutQuint: function (t) {
		return 1 + (--t) * t * t * t * t
	},
	// acceleration until halfway, then deceleration 
	easeInOutQuint: function (t) {
		return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
	}
}

var Animation = function (frames, speed, startFrame) {
	this.frames = frames || [];
	this.speed = speed || 10;
	this.currentFrame = startFrame || 0;
	this.isFlipped = false;
}

Animation.prototype.update = function (currentTime) {
	if (currentTime % this.speed == 0) {
		if (this.currentFrame < this.frames.length - 1) {
			this.currentFrame++;
		} else {
			this.currentFrame = 0;
		}
	}
}

Animation.prototype.draw = function (x, y) {
	var f = this.frames[this.currentFrame];

	spr(f.id, x, y, f.ck, f.scl, f.flp, f.rot, f.wid, f.hei);
}

Animation.prototype.flip = function () {
	for (var f = 0; f < this.frames.length; f++) {
		if (this.isFlipped == false) {
			this.frames[f].flp = 1;
		} else {
			this.frames[f].flp = 0;
		}
	}

	if (this.isFlipped == true) {
		this.isFlipped = false;
	} else {
		this.isFlipped = true;
	}
}

var Frame = function (id, wid, hei, ck, scl, flp, rot) {
	this.id = id;
	this.wid = wid || 1;
	this.hei = hei || 1;
	this.ck = ck || 0;
	this.scl = scl || 1;
	this.flp = flp || 0;
	this.rot = rot || 0;
}

// phones
var calls = []

var Call = function (x, y, rings, call_length) {
	this.x = x || getRandomInt(16, swid - 32);
	this.y = y || getRandomInt(16, shei - 40);
	this.wid = 32;
	this.hei = 32;
	this.spr = 26;
	this.rings = rings || 3;
	this.call_length = call_length || 60;
	this.call_length_max = call_length || 60;
	this.alive = true;
	this.active = false;
}

Call.prototype.update = function () {
	if (this.rings <= 0) {
		this.alive = false;
		gameState.missed += 2;
		for (var i = 0; i < 5; i++) {
			var e = new Explosion(this.x + (this.wid / 2), this.y + (this.hei / 2));
			explosions.push(e);
			this.hit = true
		}
	}
	if (this.rings > 0) {
		if (fc % 90 == 0 && !this.active) {
			sfx(5, 48);
			this.rings -= 1
		}
	}
	if (this.active) {
		if (this.call_length < 0) {
			this.alive = false;
			gameState.score += 1;
			for (var i = 0; i < 10; i++) {
				var e = new Explosion(this.x + (this.wid / 2), this.y + (this.hei / 2));
				explosions.push(e);
				this.hit = true
			}
		} else {
			this.call_length -= 1;
		}
	}
}

Call.prototype.draw = function () {
	if (fc % 60 > 30) {
		this.spr = 28
	} else {
		this.spr = 26
	}

	if (this.active) {
		this.spr = 30
	}

	spr(this.spr, this.x, this.y, 0, 2, 0, 0, 2, 2);

	if (this.active) {
		rect(this.x, this.y + (this.hei - 4) / 2, this.wid - 1, 4, 0);
		rect(this.x, this.y + (this.hei - 4) / 2, Math.floor((this.call_length / this.call_length_max) * this.wid) - 1, 4, 11);
	}
}

// tickets
var tickets = []

var Ticket = function (speed, bounce, x, y, dx, dy, w, h, spr) {
	this.x = x || getRandomInt(16, swid - 16);
	this.y = y || getRandomInt(16, shei - 24);
	this.sprite = spr || 5;
	this.wid = w || 16;
	this.hei = h || 16;
	this.alive = true;
	this.speed = speed;
	this.bounce = bounce;
	this.rebound = 0;

	if (dx) {
		this.dx = this.speed * dx;
	} else {
		if (this.x <= swid / 2)
			this.dx = this.speed;

		if (this.x > swid / 2)
			this.dx = (-1 * this.speed);
	}

	if (dy) {
		this.dy = this.speed * dy;
	} else {
		if (this.y <= shei / 2)
			this.dy = this.speed;

		if (this.y > shei / 2)
			this.dy = (-1 * this.speed);
	}
}

var pentatonicScale = [0, 2, 3, 4, 6]

Ticket.prototype.update = function () {
	this.x += this.dx;
	this.y += this.dy;

	if ((this.x < 0 || this.x > swid - this.wid) && this.bounce >= 0) {
		this.dx = this.dx * -1;
		this.bounce -= 1;
		shaked = getRandomInt(1, 3);
		shake = 2;
		if (this.wid == 16) {
			shaked = 2;
			sfx(1, 3 * 12 + pentatonicScale[getRandomInt(0, pentatonicScale.length - 1)]);
		} else if (this.wid == 8) {
			shaked = 1;
			sfx(1, 4 * 12 + pentatonicScale[getRandomInt(0, pentatonicScale.length - 1)]);
		}
	}

	if ((this.y < 16 || this.y > (shei - this.wid - 8)) && this.bounce >= 0) {
		this.dy = this.dy * -1;
		this.bounce -= 1;
		shake = 2;
		if (this.wid == 16) {
			shaked = 2;
			sfx(1, 3 * 12 + pentatonicScale[getRandomInt(0, pentatonicScale.length - 1)]);
		} else if (this.wid == 8) {
			shaked = 1;
			sfx(1, 4 * 12 + pentatonicScale[getRandomInt(0, pentatonicScale.length - 1)]);
		}
	}

	if ((this.x < -1 || this.x > swid + 1 || this.y < 15 || this.y > shei - 8) && this.bounce < 0) {
		this.alive = false;
		gameState.missed += 1;
	}

	for (var t = 0; t < tickets.length; t++) {
		if (this != tickets[t]) {
			if (collides(this, tickets[t]) && this.rebound != tickets[t]) {
				this.dx = this.dx * -1;
				this.dy = this.dy * -1;
				this.rebound = tickets[t];
			}
		}
	}

	if (this.rebound > 0) this.rebound -= 1;
}

Ticket.prototype.draw = function () {
	if (this.bounce < 1 && fc % 30 < 15) {
		rect(this.x - this.wid / 8, this.y - this.hei / 8, this.wid + (this.wid / 4), this.hei + (this.hei / 4), 6);
	}
	spr(this.sprite, this.x, this.y, -1, 1, 0, 0, this.wid / 8, this.hei / 8);
}

var explosions = [];

var Explosion = function (x, y, rad, time, dx, dy) {
	this.x = x;
	this.y = y;
	this.dx = dx || getRandomInt(0, 2) - 1;
	this.dy = dy || getRandomInt(0, 2) - 1;
	this.rad = rad || 3;
	this.time = time || 15;
	this.alive = true;
}

Explosion.prototype.update = function () {
	this.rad -= 0.25;
	this.time -= 1;
	this.x += this.dx;
	this.y += this.dy;

	if (this.rad < 0 || this.time < 0) {
		this.alive = false;
	}
}

Explosion.prototype.draw = function () {
	circ(this.x, this.y, this.rad + 1, 0);
	circ(this.x, this.y, this.rad, 6);
}

// Player
var p = {
	"x": 96,
	"y": 24,
	"wid": 32,
	"hei": 32,
	"actionCountdown": 0,
	"hit": false
}
p.animations = {
	"idle": new Animation([
		new Frame(1, 2, 2, 1, 2)
	]),
	"action": new Animation([
		new Frame(3, 2, 2, 1, 2)
	]),
	"punch": new Animation([
		new Frame(38, 2, 2, 1, 2),
		new Frame(40, 2, 2, 1, 2)
	])
}

p.currentAnimation = "idle";

p.update = function () {
	if (btn(0) && this.y > 0) this.y--
	if (btn(1) && this.y < shei - this.hei) this.y++
	if (btn(2) && this.x > -(this.wid / 2)) this.x--
	if (btn(3) && this.x < swid - this.wid / 2) this.x++
	if (btnp(4) && currentState == gameState) {
		this.actionCountdown = 10;
		this.hit = false;

		for (var c = 0; c < calls.length; c++) {
			if (collides({
					'x': this.x,
					'y': this.y,
					'wid': this.wid / 2,
					'hei': this.hei / 2
				}, calls[c]) && calls[c].alive && !this.hit) {
				calls[c].active = true;
				this.hit = true;
				shaked = getRandomInt(4, 5);
				shake = 5;
			}
		}

		for (var t = 0; t < tickets.length; t++) {

			if (collides({
					'x': this.x,
					'y': this.y,
					'wid': this.wid / 2,
					'hei': this.hei / 2
				}, tickets[t]) && tickets[t].alive && !this.hit) {
				for (var i = 0; i < 5; i++) {
					var e = new Explosion(tickets[t].x + (tickets[t].wid / 2), tickets[t].y + (tickets[t].hei / 2));
					explosions.push(e);
					this.hit = true
				}

				tickets[t].alive = false;
				gameState.score += 1;
				shaked = getRandomInt(3, 4);
				shake = 5;
				sfx(0, getRandomInt(45, 50));
			}
		}

		if (!this.hit) {
			this.actionCountdown = 10;
			this.currentAnimation = "action";
			sfx(0, 21)
			shaked = 1
			shake = 2
		} else {
			this.hit = false;
		}
	}

	if (btnp(4) && currentState == gameoverState) {
		if (collides({
				'x': this.x,
				'y': this.y,
				'wid': this.wid / 2,
				'hei': this.hei / 2
			}, boss)) {
			this.actionCountdown = 20;
			this.currentAnimation = "punch";
			boss.currentAnimation = "punched";
			sfx(2, 72)
			shake = 4
			shaked = 4
		} else {
			this.actionCountdown = 10;
			this.currentAnimation = "action";
			sfx(0, 21)
			shaked = 1
			shake = 2
		}
	}

	if (this.actionCountdown > 0) {
		this.actionCountdown -= 1;
	} else {
		this.currentAnimation = "idle";
	}
}

p.draw = function () {
	this.animations[this.currentAnimation].update(fc);
	this.animations[this.currentAnimation].draw(this.x, this.y);
}

var bossAnimationFrames = [
	new Frame(145, 2, 4, 0, 2),
	new Frame(147, 2, 4, 0, 2),
	new Frame(149, 2, 4, 0, 2),
	new Frame(151, 2, 4, 0, 2)
]
var bossAnimation = new Animation(bossAnimationFrames);

var bossAnimationPunchFrames = [
	new Frame(153, 2, 4, 0, 2),
	new Frame(155, 2, 4, 0, 2)
]
var bossAnimationPunch = new Animation(bossAnimationPunchFrames)

var boss = {}
boss.animations = {
	"idle": bossAnimation,
	"punched": bossAnimationPunch
}
boss.currentAnimation = "idle";
boss.x = swid - 32;
boss.y = shei - 64;
boss.wid = 32;
boss.hei = 64;

boss.draw = function () {
	boss.animations[boss.currentAnimation].draw(swid - 32, shei - 64);
	boss.animations[boss.currentAnimation].update(fc);

	if (boss.currentAnimation != "punched") {
		var speechBubble = {
			x: swid - 72,
			y: shei - 39,
			w: 35,
			h: 16
		}
		rect(speechBubble.x, speechBubble.y, speechBubble.w, speechBubble.h, 15);
		pix(speechBubble.x, speechBubble.y, 0);
		pix(speechBubble.x, speechBubble.y + speechBubble.h - 1, 0);
		pix(speechBubble.x + speechBubble.w - 1, speechBubble.y + speechBubble.h - 1, 0);

		// triangle going from the two right corners of box and up towards mouth
		tri(speechBubble.x + speechBubble.w, speechBubble.y,
			speechBubble.x + speechBubble.w, speechBubble.y + (speechBubble.h / 2),
			speechBubble.x + speechBubble.w + 8, speechBubble.y, 15);


		if (currentState == gameoverState) {
			if (fc % 60 > 15) {
				print("YOU'RE", speechBubble.x + 2, speechBubble.y + 2, 0)
			}
			if (fc % 60 > 30) {
				print("FIRED!", speechBubble.x + 2, speechBubble.y + 9, 0)
			}
		}
		if (currentState == menuState) {
			if (fc % 60 > 15) {
				print("YOU'RE", speechBubble.x + 2, speechBubble.y + 2, 0)
			}
			if (fc % 60 > 30) {
				print("HIRED!", speechBubble.x + 2, speechBubble.y + 9, 0)
			}
		}
	}
}


var wavelimit = 136 / 4;
var menuState = {};
menuState.update = function () {
	cls(1);
	map(30, 0, 30, 17, 0, 0, 0);
	var subtitle1 = "A 100% ACCURATE SIMULATION"
	var texWid = print(subtitle1, 0, -32);
	print(subtitle1, (swid - texWid) / 2, (shei - 48) / 2);

	var subtitle2 = "OF TECHNICAL SUPPORT"
	var texWid = print(subtitle2, 0, -32);
	print(subtitle2, (swid - texWid) / 2, (shei - 32) / 2);

	if (fc % 60 > 30) {
		var subtitle3 = "PRESS X TO START";
		texWid = print(subtitle3, 0, -32);
		print(subtitle3, (swid - texWid) / 2, (shei + 6) / 2);
	}

	var controls = "ARROW KEYS TO MOVE + CLICK WITH Z"
	texWid = print(controls, 0, -32);
	print(controls, (swid - texWid) / 2, (shei + 22) / 2)

	var bystatement = "--= A GAME BY XKFNGS =--"
	texWid = print(bystatement, 0, -32);
	print(bystatement, (swid - texWid) / 2, shei - 12);

	boss.draw();

	if (btn(5)) {
		gameState.preload();
		currentState = gameState;
	}
}

var gameState = {};
gameState.score = 0;
gameState.missed = 0;
gameState.day = 1;
gameState.dayFrame = 0;
gameState.maxCalls = 0;
gameState.globalSpeed;
gameState.globalBounce;
gameState.numTickets;
gameState.roundTimeMax = 90 * 8;
gameState.bonus = 0;
gameState.roundTime = gameState.roundTimeMax;
gameState.preload = function () {
	gameState.score = 0;
	gameState.missed = 0;
	tickets = [];
	explosions = [];
	calls = [];
	fc = 0;
	gameState.newWave(5, 0.5, 5);
	music(0);
}
gameState.newWave = function (num, speed, bounce) {
	gameState.numTickets = num;
	gameState.globalSpeed = speed;
	gameState.globalBounce = bounce;
	gameState.dayFrame = fc;
	calls = [];
	tickets = [];

	if (gameState.day > 5) {
		gameState.maxCalls = Math.floor(gameState.day / 5);
	}

	gameState.roundTime = gameState.roundTimeMax;

	for (var i = 0; i < gameState.numTickets; i++) {
		var t = new Ticket(gameState.globalSpeed, gameState.globalBounce);
		tickets.push(t);
	}
}

gameState.dayState = {}
gameState.dayState.update = function () {
	if (fc < gameState.dayFrame + 260) {
		var ticketClosed = "-- DAY " + gameState.day + " --";
		var texWid = print(ticketClosed, 0, -32);

		var chgWid = (fc - gameState.dayFrame) / 260;
		var curWid = (fc - gameState.dayFrame) * EasingFunctions.easeOutCubic(chgWid);
		// trace(curWid);

		rect((swid - curWid) / 2, ((shei - 6) / 2) - 2, curWid, 10, (gameState.day % 5) + 5)
		print(ticketClosed, (swid - texWid) / 2, (shei - 6) / 2);
	} else {
		currentState = gameState;
	}
}

gameState.update = function () {
	cls(13);
	rect(0, 0, swid, 16, 1)
	map(0, 0, 30, 17, 0, -8, 0);
	print("https://goodertrack.com", 4, 10, 0)

	if (gameState.day > 5) {
		if (((getRandomInt(0, 500) - gameState.day) < 5 && calls.length <= gameState.maxCalls) && (fc % 60 > 45)) {
			calls.push(new Call(false, false, false, getRandomInt(60, 60 * gameState.day)));
			sfx(5, 48);
		}
	}


	for (var t = tickets.length - 1; t > -1; t--) {
		if (!tickets[t].alive) {
			if ((getRandomInt(0, 10) > 8) && tickets[t].x > 32 && tickets[t].x < swid - 32 &&
				tickets[t].y > 32 && tickets[t].y < shei - 32) {
				var subTickets = [
					new Ticket(gameState.globalSpeed, gameState.globalBounce, tickets[t].x - tickets[t].wid, tickets[t].y - tickets[t].hei, -(gameState.globalSpeed), -1, 8, 8, 53), new Ticket(gameState.globalSpeed, gameState.globalBounce, tickets[t].x + tickets[t].wid, tickets[t].y + tickets[t].hei, gameState.globalSpeed, gameState.globalSpeed, 8, 8, 53), new Ticket(gameState.globalSpeed, gameState.globalBounce, tickets[t].x - tickets[t].wid, tickets[t].y + tickets[t].hei, -(gameState.globalSpeed), gameState.globalSpeed, 8, 8, 53), new Ticket(gameState.globalSpeed, gameState.globalBounce, tickets[t].x + tickets[t].wid, tickets[t].y - tickets[t].hei, gameState.globalSpeed, -(gameState.globalSpeed), 8, 8, 53)
				]
				subTickets.forEach(function (t) {
					tickets.push(t);
					for (var e = 0; e < 5; e++) {
						explosions.push(
							new Explosion(t.x + t.wid / 2, t.y + t.hei / 2,
								getRandomInt(2, 5), getRandomInt(15, 45),
								-(t.dx * 0.75), -(t.dy * 0.75)));
					}
				});
				subTickets = []
				sfx(0, getRandomInt(5 * 12, 5 * 12 + 12));
			}
			tickets.splice(t, 1);
		} else {
			tickets[t].update();
			tickets[t].draw();
		}
	}

	for (var c = calls.length - 1; c > -1; c--) {
		if (!calls[c].alive) {
			calls.splice(c, 1);
		} else {
			calls[c].update();
			calls[c].draw();
		}
	}

	for (e = explosions.length - 1; e > -1; e--) {
		if (!explosions[e].alive) {
			explosions.splice(e, 1);
		} else {
			explosions[e].update();
			explosions[e].draw();
		}
	}

	p.update();
	p.draw();


	if (fc < 30) {
		currentState = gameState.dayState;
	}

	var TCtext = "CLOSED: " + this.score;
	var TMtext = "MISSED: " + this.missed;


	rect(0, shei - 8, 240, 8, 0)
	print(TCtext, 5, shei - 7);
	var texWid = print(TMtext, 0, -32);
	print(TMtext, (swid - (texWid + 5)), shei - 7);

	// round time indicator
	rect(70, shei - 6, 99, 4, 15);
	if (gameState.roundTime > 240) {
		rect(70, shei - 6, Math.round((gameState.roundTime / (gameState.roundTimeMax)) * 100) - 1, 4, 11);
	} else if (gameState.roundTime > 60) {
		rect(70, shei - 6, Math.round((gameState.roundTime / (gameState.roundTimeMax)) * 100) - 1, 4, 14);
	} else {
		rect(70, shei - 6, Math.round((gameState.roundTime / (gameState.roundTimeMax)) * 100) - 1, 4, 6);
	}

	// trace("tickets length: " + tickets.length + " | calls length: " + calls.length)

	if (gameState.roundTime <= 0 || (calls.length <= 0 && tickets.length <= 0)) {
		if (gameState.bonus > 0) {
			if (gameState.roundTime > 0) {
				var bonusPoints = gameState.bonus + " BONUS TICKETS!";
				var texWid = print(bonusPoints, 0, -32);
				var col = 15;
				if (fc % 30 > 15) {
					col = 14
				}
				print(bonusPoints, (swid - texWid)/2, shei - 16, col);
				gameState.roundTime -= 4
			} else {
				gameState.score += gameState.bonus;
				gameState.bonus = 0;
			}
		} else {
			if (gameState.roundTime > 0) {
				gameState.bonus = Math.floor(gameState.roundTime / 90);
			} else {
				gameState.day += 1;
				var curveMod = Math.floor((gameState.day / 5)/2)
				gameState.newWave(gameState.numTickets + curveMod, gameState.globalSpeed + (0.1 * curveMod), gameState.globalBounce - (0.01 * curveMod))
				currentState = gameState.dayState;
			}
		}

	} else {
		gameState.roundTime -= 1;
	}

	if (this.missed > this.score / 2) {
		music();
		music(1, -1, -1, false)
		currentState = gameoverState;
	}

}

var gameoverState = {};
var fallingTickets = [];

gameoverState.update = function () {
	cls(0);

	if (fc % 2 == 0) {
		var numTickets = getRandomInt(1, 2);
		for (var i = 0; i < numTickets; i++) {
			var t = {
				x: getRandomInt(-32, swid - 16),
				y: -32,
				dy: getRandomInt(2, 6),
				scl: getRandomInt(1, 3),
				startfc: fc
			}
			fallingTickets.push(t);
		}
	}

	for (var j = fallingTickets.length - 1; j > -1; j--) {
		var ticket = fallingTickets[j];
		if ((fc - ticket.startfc) % 30 > 15) {
			rect(ticket.x - (2 * ticket.scl), ticket.y - (2 * ticket.scl), (16 * ticket.scl) + (4 * ticket.scl), (16 * ticket.scl) + (4 * ticket.scl), 6)
		}
		spr(5, ticket.x, ticket.y, -1, ticket.scl, 0, 0, 2, 2);

		ticket.y += ticket.dy;

		if (ticket.y > shei + 32 || ticket.x > swid + 32) {
			fallingTickets.splice(j, 1);
		}
	}


	map(60, 0, 30, 17, 0, 0, 0);

	boss.draw();

	var ticketClosed = "You managed to close " + gameState.score + " tickets!";
	texWid = print(ticketClosed, 0, -32);
	print(ticketClosed, (swid - texWid) / 2, (shei - 12) / 2);

	if (fc % 60 > 30) {
		var restart = "PRESS X TO RESTART";
		texWid = print(restart, 0, -32);
		print(restart, (swid - texWid) / 2, (shei + 24) / 2);
	}

	p.update();
	p.draw();


	if (btnp(5)) {
		fallingTickets = [];
		gameState.preload();
		currentState = gameState;
	}
}

var currentState = menuState;
music(2)

function TIC() {
	currentState.update();

	if (shake > 0) {
		poke(0x3FF9 + 1, getRandomInt(-4, 4))
		shake -= 1
		if (shake == 0) memset(0x3FF9, 0, 2);
	}

	fc++;
}

function scanline(row) {
	if (shake > 0) poke(0x3FF9, getRandomInt(-(shaked), shaked))

	if (currentState == menuState) {
		if (row < wavelimit) {
			poke(0x3ff9, Math.sin((time() / 200 + row / 10)) * 7)
		} else {
			poke(0x3ff9, 0)
		}
	}
}

// <TILES>
// 001:11111101111110f0111110f0111110f0111110f0111110f0111110f0111000f0
// 002:1111111111111111111111111111111100011111f0f01111f0f00111f0f0f011
// 003:111111111111111111111101111110f0111110f0111110f0111110f0111000f0
// 004:1111111111111111111111111111111100011111f0f01111f0f00111f0f0f011
// 005:ffffffffff000ff0ff000fffff000ff0fff0fffff00000f0f00000ffffffffff
// 006:ffffffff0000000fffffffff0000000fffffffff0000000fffffffffffffffff
// 007:00ffffff0fffffffffffffffffffffffffffffffffffffff0fffffff00ffffff
// 008:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 009:ffffff00fffffff0fffffffffffffffffffffffffffffffffffffff0ffffff00
// 010:1111111117777777177777771777777717777777177777771777777711111111
// 011:1111111177777777777777777777777777777777777777777777777711111111
// 012:1111111177777771777777717777777177777771777777717777777111111111
// 017:1110f0ff1110ffff1110ffff11100fff11110fff111100ff111110ff11111000
// 018:f0f0f011fffff011fffff011ffff0111ffff0111fff01111fff0111100011111
// 019:1110f0ff1110ffff1110ffff11100fff11110fff111100ff111110ff11111000
// 020:f0f0f011fffff011fffff011ffff0111ffff0111fff01111fff0111100011111
// 021:f0000000fffffffff0000606f0666606f0666606f0666606f0000600ffffffff
// 022:0000000fffffffff6660000f6660666f6660000f6666660f0060000fffffffff
// 023:0666666066f66ff66ff66f6666fff666666fff6666f66ff66ff66ff606666660
// 024:0bbbbbb0bbfbbbbbbbfffbbbbbfffffbbbfffffbbbfffbbbbbfbbbbb0bbbbbb0
// 025:0bbbbbb0bbbbbfbbbbbfffbbbfffffbbbfffffbbbbbfffbbbbbbbfbb0bbbbbb0
// 026:0000000000000000000000000000000000033333003000000770030077770300
// 027:0000000000000000000000000000000033330000000030000300770003077770
// 028:000000000f000f0000f000000003333300300000077000007777030000000300
// 029:000000000f000f000000f0003333000000003000000077000307777003000000
// 030:0000000000000000000333330030000007700000777700000000030000000300
// 031:0000000000000000333300000000300000007700000777700300000003000000
// 038:11111111111111111111111111111100111110f0111110f0111000f01110f0ff
// 039:11111111111111111111111100011111f0f01111f0f00111f0f0f011f0f0f011
// 040:11111111111111101111110f1111110f1111100f111110ff111110ff111110ff
// 041:11111111000011110f0f0011ffff0f01ffffff01ffffff01fffff011fffff011
// 042:000033330007777700377f7f0037777700377f7f0037777700377f7f00377777
// 043:33300000777700007f773000777730007f773000777730007f77300077773000
// 044:000033330007777700377f7f0037777700377f7f0037777700377f7f00377777
// 045:33300000777700007f773000777730007f773000777730007f77300077773000
// 046:000033330007777700377f7f0037777700377f7f0037777700377f7f00377777
// 047:33300000777700007f773000777730007f773000777730007f77300077773000
// 049:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 050:7777777777777777777777777777777777777777777777777777777777777777
// 051:3333333333333333333333333333333333333333333333333333333333333333
// 052:1111111111111111111111111111111111111111111111111111111111111111
// 053:ffffffffff0ff00fff0ffffff000f00ffffffffff000000ff666666fffffffff
// 054:1110ffff1110ffff11100fff11110fff111100ff111110ff1111100011111111
// 055:fffff011fffff011ffff0111ffff0111fff01111fff011110001111111111111
// 056:1111100f1111110f111111001111111111111111111111111111111111111111
// 057:ffff0111ffff0111000011111111111111111111111111111111111111111111
// 081:0000ffff000fffff00ff333303ff000303ff000303ff00030330000300000003
// 082:ffffff00fffffff0ff3333ffff0003ffff0003ffff0003ffff000330ff000000
// 083:0000ffff000fffff00ff333303ff000303300003000000030000000300000003
// 084:ffffff00fffffff0ff3333ffff0003ffff000330ff000000ff000000ff000000
// 085:0000ffff000fffff00ff333303ff000003ff000003ff000003ff000003ff0000
// 086:ffffff00fffffff0333333ff000003ff00000330000000000000000000000000
// 087:0000ff00000fff0000ff300003ff000003ff000003ff000003ffffff03ffffff
// 088:0000ff000003fff0000333ff000003ff000003ff000003ffffffff30ffffff00
// 089:0000ffff000fffff00ff333303ff000003ff000003ff000003ffffff03ffffff
// 090:ffffff00fffffff0333333ff000003ff0000033000000000ff000000ff000000
// 091:0000ffff000fffff00ff333303ff000003ff000003ff000003ffffff03ffffff
// 092:ffffff00fffffff0333333ff000003ff000003ff000003ffffffff30ffffff00
// 093:0000ff00000fff0000ff300003ff000003ff000003ff000003ff000003ff0000
// 094:0000ff000003fff0000333ff000003ff000003ff000003ff000003ff000003ff
// 097:0000000300000003000000030000000300000003000000030000000300000000
// 098:ff000000ff000000ff000000ff000000ff000000ff0000003000000000000000
// 099:000000030000000300ff000303ff0003033fffff0033ffff0003333300000000
// 100:ff000000ff000000ff0000ffff0003fffffffff0ffffff003333300000000000
// 101:03ff000003ff000003ff000003ff0000033fffff0033ffff0003333300000000
// 102:0000000000000000000000ff000003fffffffff0ffffff003333300000000000
// 103:03ff333303ff000003ff000003ff0000033fff000033ff000003300000000000
// 104:333330ff000003ff000003ff000003ff0000fff00003ff000003300000000000
// 105:03ff333303ff000003ff000003ff0000033fffff0033ffff0003333300000000
// 106:3000000000000000000000ff000003fffffffff0ffffff003333300000000000
// 107:03ff333303ff000003ff000003ff0000033fff000033ff000003300000000000
// 108:333330ff000003ff000003ff000003ff0000fff00003ff000003300000000000
// 109:03ff000003ff000003ff000003ff0000033fffff0033ffff0003333300000000
// 110:000003ff000003ff000003ff000003fffffffff0ffffff003333300000000000
// 113:0000ffff000fffff00ff333303ff000003ff000003ff0000033fffff003fffff
// 114:ffffff00fffffff0333333ff000003ff0000033000000000fffffff0fffffff0
// 115:0000ff00000fff0000ff300003ff000003ff000003ff000003ffffff03ffffff
// 116:0000ff000003fff0000333ff000003ff000003ff000003ffffffffffffffffff
// 117:0000ffff000fffff00ff333303ff000003ff000003ff000003ff000003ff0000
// 118:ffffff00fffffff0333333ff000003ff00000330000000000000ffff0003ffff
// 119:0000ffff000fffff00ff333303ff000003ff000003ff000003ffffff03ffffff
// 120:ffffff00fffffff0333333ff000003ff000003ff000003ffffffffffffffffff
// 121:0000ff00000ffff000ff03ff03ff03ff03ff03ff03ff03ff03ff033f03ff0033
// 122:0000ff00000ffff000ff03ff03ff03ff03ff03ff03ff03fffff003ffff0003ff
// 123:0000ffff000fffff00ff333303ff000003ff000003ff000003ff000003ff0000
// 124:ffffff00fffffff0333333ff000003ff000003ff000003ff000003ff000003ff
// 125:00ff000003fff0000333ff000003ff000003ff000003ff000003ff000003ff00
// 126:000000ff00000fff0000ff300003ff000003ff000003ff000003ff000003ff00
// 129:003333330000000000ff000003ff0000033fffff0033ffff0003333300000000
// 130:333333ff000003ff000003ff000003fffffffff0ffffff003333300000000000
// 131:03ff333303ff000003ff000003ff0000033fff000033ff000003300000000000
// 132:333333ff000003ff000003ff000003ff0000fff00003ff000003300000000000
// 133:03ff000003ff000003ff000003ff0000033fffff0033ffff0003333300000000
// 134:000333ff000003ff000003ff000003fffffffff0ffffff003333300000000000
// 135:03ff333303ff000003ff000003ff0000033fff000033ff000003300000000000
// 136:333333ff000003ff000003ff000003ff0000fff00003ff000003300000000000
// 137:03ff000303ff000003ff000003ff0000033fff000033ff000003300000000000
// 138:300003ff000003ff000003ff000003ff0000fff00003ff000003300000000000
// 139:03ff000003ff000003ff000003ff0000033fffff0033ffff0003333300000000
// 140:000003ff000003ff000003ff000003fffffffff0ffffff003333300000000000
// 141:0003ff000003fff000033fff000033ff0000033f000000330000000300000000
// 142:0003ff00000fff0000fff00003ff0000fff00000ff0000003000000000000000
// 145:00000000000000000000003300000344000034440303444403333334003eccc3
// 146:000000000000000033000000443000004443000044443030433333303ccce300
// 147:0000000000000000000000000000003300000344000034440303444403333334
// 148:0000000000000000000000003300000044300000444300004444303043333330
// 149:00000000000000000000003300000344000034440303444403333334003eccc3
// 150:000000000000000033000000443000004443000044443030433333303ccce300
// 151:0000000000000000000000000000003300000344000034440303444403333334
// 152:0000000000000000000000003300000044300000444300004444303043333330
// 153:00000000000000000000003300000344000034440303444403333334003eccc3
// 154:000000000000000033000000443000004443000044443030433333303ccce300
// 155:0000000000000000000000000000003300000344000034440303444403333334
// 156:0000000000000000000000003300000044300000444300004444303043333330
// 161:00ee333c0eecc3cc003ccccc003cc3330003c3ff0003cc3300343ccc03344333
// 162:c333ee00cc3ccee0ccccc300333cc300ff3c300033cc3000ccc3430033344330
// 163:003eccc300ee333c0eecc3cc003ccccc003ccccc0003c3330033cc3303343ccc
// 164:3ccce300c333ee00cc3ccee0ccccc300ccccc300333c300033cc3300ccc34330
// 165:00ee333c0eecc3cc003ccccc003cc3330003c3ff0003cc3300343ccc03344333
// 166:c333ee00cc3ccee0ccccc300333cc300ff3c300033cc3000ccc3430033344330
// 167:003eccc300ee333c0eecc3cc003ccccc003ccccc0003c3330033cc3303343ccc
// 168:3ccce300c333ee00cc3ccee0ccccc300ccccc300333c300033cc3300ccc34330
// 169:00eecccc00eecffc0eeccffc003ccccc003ccfff0003c3330003cc3333343ccf
// 170:ccccee00cffcee00cffccee0ccccc300fffcc300333c300033cc3000fcc34330
// 171:0030eee30000eccc000ecccc00eecccc00eec3cc0eeccccc003ccccc0003ccc3
// 172:3eee0300ccce0000cccce000ccccee00cc3cee00cccccee0ccccc3003ccc3000
// 177:3f3443ff3f3443ff3f3443ff033443ff0c3443ff0c3443ff0c3333330cc88883
// 178:ff3443f3ff3443f3ff3443f3ff344330ff3443c0ff3443c0333333c088888cc0
// 179:3f3443333f3443ff3f3443ff033443ff0c3443ff0c3443ff0c3333330cc88883
// 180:333443f3ff3443f3ff3443f3ff344330ff3443c0ff3443c0333333c088888cc0
// 181:3f3443ff3f3443ff3f3443ff033443ff0c3443ff0c3443ff0c3333330cc88883
// 182:ff3443f3ff3443f3ff3443f3ff344330ff3443c0ff3443c0333333c088888cc0
// 183:3f3443333f3443ff3f3443ff033443ff0c3443ff0c3443ff0c3333330cc88883
// 184:333443f3ff3443f3ff3443f3ff344330ff3443c0ff3443c0333333c088888cc0
// 185:3f3443cc3f3443330f3443ff033443ff0c3443ff0c3443ff0ccc333300cc8883
// 186:cc3443f3333443f3ff3443f3ff344330ff3443c0ff3443c03333ccc08888cc00
// 187:0003ccc333343ccc3f3443cc3f3443330f3443ff033443ff0c3443ff0cccc3ff
// 188:3ccc3000ccc34330cc3443f3333443f3ff3443f3ff344330ff3443c0ff3cccc0
// 193:0cc8888300388883003888330038883000388830003444300344443000333330
// 194:88888cc088888300338883000388830003888300034443000344443003333300
// 195:0cc8888300388883003888330038883000388830003444300344443000333330
// 196:88888cc088888300338883000388830003888300034443000344443003333300
// 197:0cc8888300388883003888330038883000388830003444300344443000333330
// 198:88888cc088888300338883000388830003888300034443000344443003333300
// 199:0cc8888300388883003888330038883000388830003444300344443000333330
// 200:88888cc088888300338883000388830003888300034443000344443003333300
// 201:0038888300388883003888330038883000038883000344430034444300033333
// 202:8888830088888300338883000388830038883000344430003444430033333000
// 203:003cc33300388883003888330038883000038883000344430034444300033333
// 204:333cc30088888300338883000388830038883000344430003444430033333000
// </TILES>

// <MAP>
// 001:a0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 002:70808080808080808080808080808080808080808080809000910081007100152535455565758595a5152500005565b5c5d5e51727374795a5b5c500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 003:00000000000000000000000000000000000000000000000000000000000000162636465666768696a6162600005666b6c6d6e61828384896a6b6c600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 004:0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005767778797a795a50000b7c7d7e795a5b5c5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 005:0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005868788898a896a60000b8c8d8e896a6b6c6000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </MAP>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// 004:b9765444445678abbccccccccbaa7654
// </WAVES>

// <SFX>
// 000:020802080208020802080208220052019202a201b201c200e200e200f200f200f200f200f200f200f200f200f200f200f200f200f200f200f200f200307000000000
// 001:000100020002400f500d900fa000b000d001e001f001f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000f00031b000000000
// 002:031003100300030f030e030e130e330e530e830e930f930fa300a301c300d300e300f300f300f300f300f300f300f300f300f300f300f300f300f300400000000000
// 003:0062005200510040003f102f301e501e600d800d900cc00cd00cf00cf00df00df00df00ef00ef000f000f000f000f000f000f000f000f000f000f000100000000000
// 004:140314021401140f140e240e540e840fa400b401b402b403d403d401e40ff40ef40ef40ff401f403f403f404f400f400f40ff40ef40ef40ef40ef40f200000000000
// 005:0200020002000200f20002000200020002000200f200f200f200f200f200f200f200f200f200f200f200f200f200f200f200f200f200f200f200f200300000000000
// </SFX>

// <PATTERNS>
// 000:450032000000000000000000450028000000000000000000450032000000000000000000450028000000450032000000450032000000000000000000450028000000000000000000450032000000000000000000450028000000000000450032450032000000000000000000450028000000000000000000450032000000000000000000450028000000450032000000450032000000000000000000450028000000000000450032450032000000450032000000450028000000450032000000
// 001:4a0048760048b300484a0048760048b300484a0048760048b300484a0048760048b300489a0048c60048e300484a004ab6004a73004a4a004ae60048b3004a7a004a46004ae30048ba004a76004a43004aea0048b6004a73004a4a004ae600484300487a0048b600484300487a0048b600484300487a0048b600484300487a0048b60048930048ca0048e6004843004aba004a76004a43004aea0048b6004a73004a4a004ae60048b3004a7a004a46004ae30048ba004a76004a43004aea0048
// 002:4a0046760046b300464a0046760046b300464a0046760046b300464a0046760046b300469a0046c60046e300464a0048b600487300484a0048e60046b300487a0048460048e30046ba0048760048430048ea0046b600487300484a0048e600464300467a0046b600464300467a0046b600464300467a0046b600464300467a0046b60046930046ca0046e60046430048ba0048760048430048ea0046b600487300484a0048e60046b300487a0048460048e30046ba0048760048430048ea0046
// 003:f00046e00046d00046c00046b00046a00046900046800046700046600046500046400046f00044e00044d00044c00044b00044a00044900044800044700044600044400044400044400044000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 004:430044000000750044000000b30044000000450044000000730044000000b50044000000430044000000750044000000b30044000000450044000000730044000000b50044000000e30042000000650044000000730044000000650044000000430044000000e50042000000b30042000000750042000000b30044000000e50044000000b30044000000e50044000000b00044000000e00044000000b00044000000e00044000000b00044000000e00044000000b00044000000e00044000000
// 005:43000a00000000000000000000000000000000000000000000000000000000000000000043000a65000a76000a97000ab6000ae5000a43000af5000876000ac7000ab6000a00000000000000000000000000000000000000000000000000000045000a73000a45000ae7000ab6000a93000a75000a67000a65000a00000000000000000049000a00000067000a79000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 006:00000000000000000000000000000000000000000000000000000000000000000000000049002c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000049002c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000049002c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 007:00000000000000000000000049002c00000000000000000000000000000000000000000049002c00000000000000000000000000000000000000000049002c00000000000000000000000000000000000000000049002c00000000000000000000000000000000000000000049002c00000000000000000000000000000000000000000049002c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </PATTERNS>

// <TRACKS>
// 000:1c00001c00001800001800000000000000000000000000000000000000000000000000000000000000000000000000006f0000
// 001:400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000460000
// 002:5000005000005810005810005817005817005818005818005817005817000000000000000000000000000000000000006f0100
// 003:0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006f0000
// </TRACKS>

// <PALETTE>
// 000:140c1c44243430346d4e4a4e854c30346524d04648757161597dced27d2c8595a16daa2cd2aa996dc2cadad45edeeed6
// </PALETTE>

