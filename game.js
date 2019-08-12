// title:  Ticket Crusher
// author: Christopher Stokes
// desc:   Completely accurate simulation of Technical Support
// script: js

var fc=0 //ongoing frame counter
var shake=0 //screen shake
var shaked=0 //shake distance

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
	linear: function (t, b, c, d) { 
		return c * (t/d) + b;
	},
	// accelerating from zero velocity
	easeInQuad: function (t) { return t*t },
	// decelerating to zero velocity
	easeOutQuad: function (t) { return t*(2-t) },
	// acceleration until halfway, then deceleration
	easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
	// accelerating from zero velocity 
	easeInCubic: function (t) { return t*t*t },
	// decelerating to zero velocity 
	easeOutCubic: function (t) { return (--t)*t*t+1 },
	// acceleration until halfway, then deceleration 
	easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
	// accelerating from zero velocity 
	easeInQuart: function (t) { return t*t*t*t },
	// decelerating to zero velocity 
	easeOutQuart: function (t) { return 1-(--t)*t*t*t },
	// acceleration until halfway, then deceleration
	easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
	// accelerating from zero velocity
	easeInQuint: function (t) { return t*t*t*t*t },
	// decelerating to zero velocity
	easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
	// acceleration until halfway, then deceleration 
	easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}

// Player
var p = {
	"x": 96,
	"y": 24,
	"wid": 32,
	"hei": 32,
	"sprites": { 
		"idle": 1,
		"action": 3
	},
	"sprite": "idle",
	"actionCountdown": 0
}

p.update = function() {
	if(btn(0) && this.y>0) this.y--
	if(btn(1) && this.y<shei-this.hei) this.y++
	if(btn(2) && this.x> -(this.wid/2)) this.x--
	if(btn(3) && this.x<swid-this.wid/2) this.x++
	if(btnp(4)) {
		this.actionCountdown = 10;
		
		for (var t=0; t<tickets.length; t++) {

			if (collides({'x': this.x, 'y': this.y, 'wid': this.wid/2, 'hei': this.hei/2}, tickets[t]) && tickets[t].alive) {
				for (var i=0; i<5; i++) {
					var e = new Explosion(tickets[t].x+(tickets[t].wid/2), tickets[t].y+(tickets[t].hei/2));
					explosions.push(e);
				}

				tickets[t].alive = false;
				gameState.score += 1;
				shaked = getRandomInt(3, 4);
				shake = 5;
				sfx(0, getRandomInt(45,50));
			}
		}
	}
	if(btnp(5)) {
		// debug
		currentState = gameoverState;
	}
	if (this.actionCountdown > 0) {
		this.sprite = "action";
		this.actionCountdown -= 1;
	} else {
		this.sprite = "idle";
	}
}

p.draw = function() {
	spr(this.sprites[this.sprite],
					this.x,
					this.y,
					1,2,0,0,2,2)
}

// tickets
var tickets = []

var Ticket = function(speed, bounce, x, y, dx, dy) {
	this.x = x || getRandomInt(16,swid-16);
	this.y = y || getRandomInt(16,shei-24);
	this.sprite = 5;
	this.wid = 16;
	this.hei = 16;
	this.alive = true;
	this.speed = speed;
	this.bounce = bounce;
	this.rebound = 0;

	if (dx) {
		this.dx = this.speed*dx;
	} else {
		if (this.x <= swid/2)
			this.dx = this.speed;
		
		if (this.x > swid/2)
			this.dx = (-1 * this.speed);
	}

	if (dy) {
		this.dy = this.speed*dy;
	} else {
		if (this.y <= shei/2)
			this.dy = this.speed;
		
		if (this.y > shei/2)
			this.dy = (-1 * this.speed);
	}	
}

Ticket.prototype.update = function() {
	this.x += this.dx;
	this.y += this.dy;
	
	if ((this.x < 0 || this.x > swid-this.wid) && this.bounce >= 0) {
		this.dx = this.dx * -1;
		this.bounce -=1;
		shaked = getRandomInt(1,3);
		shake = 2;
		sfx(1, getRandomInt(45,50));
	}
	
	if ((this.y < 16 || this.y > (shei-24)) && this.bounce >= 0) {
		this.dy = this.dy * -1;
		this.bounce -=1;
		shaked = getRandomInt(1,3);
		shake = 2;
		sfx(1, getRandomInt(36,48));
	}
	
	if ((this.x < -1 || this.x > swid+1 || this.y < 15 || this.y > shei-8) && this.bounce < 0) {
		this.alive = false;
		gameState.missed += 1;
	}

	for (var t=0; t<tickets.length; t++) {
		if (this != tickets[t]) {
			if (collides(this, tickets[t]) && this.rebound != tickets[t]) {
				this.dx = this.dx * -1;
				this.dy = this.dy * -1;
				this.rebound = tickets[t];
			}
		}
	}

	if (this.rebound > 0) this.rebound -=1;
}

Ticket.prototype.draw = function() {
	if (this.bounce < 1 && fc%30 < 15) {
		rect(this.x-2, this.y-2, this.wid+4, this.hei+4, 6);
	} 
	spr(this.sprite, this.x, this.y, -1, 1, 0, 0, 2, 2);
}

var explosions = [];

var Explosion = function(x, y, rad, time, dx, dy) {
	this.x = x;
	this.y = y;
	this.dx = dx || getRandomInt(0, 2) - 1;
	this.dy = dy || getRandomInt(0, 2) - 1;
	this.rad = rad || 3;
	this.time = time || 15;
	this.alive = true;
}

Explosion.prototype.update = function() {
	this.rad -= 0.25;
	this.time -= 1;
	this.x += this.dx;
	this.y += this.dy;

	if (this.rad < 0 || this.time < 0) {
		this.alive = false;
	}
}

Explosion.prototype.draw = function() {
	circ(this.x, this.y, this.rad+1, 0);
	circ(this.x, this.y, this.rad, 6);
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

var menuState = {} 
menuState.update = function() {
	cls(0);
	map(30, 0, 30, 17, 0, 0, 0);
	var bystatement = "A GAME BY CHRISTOPHER STOKES"
	var texWid = print(bystatement, 0, -32);
	print(bystatement, (swid-texWid)/2, (shei-12)/2);

	var subtitle = "PRESS X TO START";
	texWid = print(subtitle, 0, -32);
	print(subtitle, (swid-texWid)/2, (shei+12)/2);
	
	if (btn(5)){
		gameState.preload();
		currentState = gameState;
	}
}

var gameState = {};
gameState.score = 0;
gameState.missed = 0;
gameState.day = 1;
gameState.globalSpeed;
gameState.globalBounce;
gameState.numTickets;
gameState.preload = function() {
	gameState.score = 0;
	gameState.missed = 0;
	tickets = [];
	explosions = [];
	gameState.newWave(5, 0.5, 3);
}
gameState.newWave = function(num, speed, bounce) {
	gameState.numTickets = num;
	gameState.globalSpeed = speed;
	gameState.globalBounce = bounce;

	for (var i=0; i<gameState.numTickets; i++) {
		var t = new Ticket(gameState.globalSpeed, gameState.globalBounce);
		tickets.push(t);
	}
}
gameState.update = function() {
	cls(13);
	rect(0, 0, swid, 16, 1)
	map(0, 0, 30, 17, 0, -8, 0);
	print("https://goodertrack.com", 4, 10, 0)
	
	for (var t=tickets.length-1; t>-1; t--) {
		if (!tickets[t].alive) {
			if ((getRandomInt(0, 10) > 8) && tickets[t].x > 32 && tickets[t].x < swid - 32 
					&& tickets[t].y > 32 && tickets[t].y < shei-32) {
				var subTickets =  [
					new Ticket(gameState.globalSpeed, gameState.globalBounce, tickets[t].x-tickets[t].wid, tickets[t].y-tickets[t].hei, -(gameState.globalSpeed), -1)
					,new Ticket(gameState.globalSpeed, gameState.globalBounce, tickets[t].x+tickets[t].wid, tickets[t].y+tickets[t].hei, gameState.globalSpeed, gameState.globalSpeed)
					,new Ticket(gameState.globalSpeed, gameState.globalBounce, tickets[t].x-tickets[t].wid, tickets[t].y+tickets[t].hei, -(gameState.globalSpeed), gameState.globalSpeed)
					,new Ticket(gameState.globalSpeed, gameState.globalBounce, tickets[t].x+tickets[t].wid, tickets[t].y-tickets[t].hei, gameState.globalSpeed, -(gameState.globalSpeed))
				]
				subTickets.forEach(function(t) {
					tickets.push(t);
					for (var e=0; e<5; e++) {
						explosions.push(
							new Explosion(t.x+t.wid/2, t.y+t.hei/2, 
								getRandomInt(2,5), getRandomInt(15, 45), 
								-(t.dx * 0.75), -(t.dy * 0.75)));
					}
				});
			}
			tickets.splice(t, 1);
		} else {
			tickets[t].update();
			tickets[t].draw();
		}
	}

	for (e=explosions.length-1; e>-1; e--) {
		if (!explosions[e].alive) {
			explosions.splice(e, 1);
		} else {
			explosions[e].update();
			explosions[e].draw();
		}
	}
	
	p.update();
	p.draw();

	var TCtext = "CLOSED: "+this.score;
	var TMtext = "MISSED: "+this.missed;


	rect(0, shei-8, 240, 8, 0)
	print(TCtext, 5, shei-7);
	var texWid = print(TMtext, 0, -32);
	print(TMtext, (swid-(texWid+5)), shei-7);

	if (this.missed > this.score/2) {
		currentState = gameoverState;
	}

	if (tickets.length == 0) {
		gameState.day += 1;
		gameState.newWave(gameState.numTickets + 1, gameState.globalSpeed + 0.025, gameState.globalBounce - 0.025)

	}
}

var bossAnimationFrames = [
	new Frame(145, 2, 4, 0, 2),
	new Frame(147, 2, 4, 0, 2),
	new Frame(149, 2, 4, 0, 2),
	new Frame(151, 2, 4, 0 ,2)
]
var bossAnimation = new Animation(bossAnimationFrames);

var gameoverState = {};
var fallingTickets = [];

gameoverState.update = function() {
	cls(0);

	if (fc % 2 == 0) {
		var numTickets = getRandomInt(1,2);
		for (var i=0; i<numTickets; i++) {
			var t = {
				x: getRandomInt(-32, swid-16),
				y: -32,
				dy: getRandomInt(2, 6),
				scl: getRandomInt(1,3),
				startfc: fc
			}
			fallingTickets.push(t);
		}
	}

	for(var j=fallingTickets.length-1; j>-1; j--) {
		var ticket = fallingTickets[j];
		if ((fc-ticket.startfc) % 30 > 15) {
			rect(ticket.x-(2*ticket.scl), ticket.y-(2*ticket.scl), (16*ticket.scl)+(4*ticket.scl), (16*ticket.scl)+(4*ticket.scl), 6)
		}
		spr(5, ticket.x, ticket.y, -1, ticket.scl, 0, 0, 2, 2);

		ticket.y += ticket.dy;

		if (ticket.y > shei+32 || ticket.x > swid + 32) {
			fallingTickets.splice(j, 1);
		}
	}


	map(60, 0, 30, 17, 0, 0, 0);

	bossAnimation.draw(swid-32, shei-64);
	bossAnimation.update(fc);

	var speechBubble = {
		x: swid-72,
		y: shei-40,
		w: 35,
		h: 16
	}
	rect(speechBubble.x, speechBubble.y, speechBubble.w, speechBubble.h, 15);
	pix(speechBubble.x, speechBubble.y, 0);
	pix(speechBubble.x, speechBubble.y+speechBubble.h-1, 0);
	pix(speechBubble.x+speechBubble.w-1, speechBubble.y+speechBubble.h-1, 0);
	
	// triangle going from the two right corners of box and up towards mouth
	tri(speechBubble.x+speechBubble.w, speechBubble.y,
		speechBubble.x+speechBubble.w, speechBubble.y+(speechBubble.h/2),
		speechBubble.x+speechBubble.w+8, speechBubble.y, 15);

	if (fc % 60 > 15) {
		print("YOU'RE", speechBubble.x+2, speechBubble.y+2, 0)
	}	
	if (fc % 60 > 30) {
		print("FIRED!", speechBubble.x+2, speechBubble.y+9, 0)
	}

	// var yourFired = "YOU'VE BEEN FIRED!";
	// var texWid = print(yourFired, 0, -32);
	// print(yourFired, (swid-texWid)/2, (shei-12)/2);
	
	var ticketClosed = "You managed to close " + gameState.score + " tickets!";
	texWid = print(ticketClosed, 0, -32);
	print(ticketClosed, (swid-texWid)/2, (shei-12)/2);

	var restart = "PRESS X TO RESTART";
	texWid = print(restart, 0, -32);
	print(restart, (swid-texWid)/2, (shei+24)/2);

	p.update();
	p.draw();


	if (btnp(5)) {
		fallingTickets = []
		gameState.preload();
		currentState = gameState;
	}
}

var currentState = menuState;

function TIC()
{
	currentState.update();

	if (shake > 0) {
		poke(0x3FF9+1,getRandomInt(-4, 4))
		shake-=1		
		if (shake==0) memset(0x3FF9,0,2);
	}

	fc++;
}

function scanline() 
{
	if (shake > 0) poke(0x3FF9,getRandomInt(-(shaked),shaked))
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
// 049:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// 050:7777777777777777777777777777777777777777777777777777777777777777
// 051:3333333333333333333333333333333333333333333333333333333333333333
// 052:1111111111111111111111111111111111111111111111111111111111111111
// 081:00000000000fffff00ffffff0ff0000f0ff0000f0ff0000f0ff0000f0000000f
// 082:00000000fffff000ffffff00f0000ff0f0000ff0f0000ff0f0000ff0f0000000
// 083:00000000000fffff00ffffff0ff0000f0ff0000f0000000f0000000f0000000f
// 084:00000000fffff000ffffff00f0000ff0f0000ff0f0000000f0000000f0000000
// 085:00000000000fffff00ffffff0ff000000ff000000ff000000ff000000ff00000
// 086:00000000fffff000ffffff0000000ff000000ff0000000000000000000000000
// 087:00000000000ff00000fff0000ff000000ff000000ff000000ff000000fffffff
// 088:00000000000ff000000fff0000000ff000000ff000000ff000000ff0fffff000
// 089:00000000000fffff00ffffff0ff000000ff000000ff000000ff000000fffffff
// 090:00000000fffff000ffffff0000000ff000000ff00000000000000000f0000000
// 091:00000000000fffff00ffffff0ff000000ff000000ff000000ff000000fffffff
// 092:00000000fffff000ffffff0000000ff000000ff000000ff000000ff0fffff000
// 093:00000000000ff00000fff0000ff000000ff000000ff000000ff000000ff00000
// 094:00000000000ff000000fff0000000ff000000ff000000ff000000ff000000ff0
// 097:0000000f0000000f0000000f0000000f0000000f0000000f0000000f00000000
// 098:f0000000f0000000f0000000f0000000f0000000f0000000f000000000000000
// 099:0000000f0000000f0000000f0ff0000f0ff0000f00ffffff000fffff00000000
// 100:f0000000f0000000f0000000f0000ff0f0000ff0ffffff00fffff00000000000
// 101:0ff000000ff000000ff000000ff000000ff0000000ffffff000fffff00000000
// 102:00000000000000000000000000000ff000000ff0ffffff00fffff00000000000
// 103:0fffffff0ff000000ff000000ff000000ff0000000fff000000ff00000000000
// 104:fffff00000000ff000000ff000000ff000000ff0000fff00000ff00000000000
// 105:0fffffff0ff000000ff000000ff000000ff0000000ffffff000fffff00000000
// 106:f0000000000000000000000000000ff000000ff0ffffff00fffff00000000000
// 107:0fffffff0ff000000ff000000ff000000ff0000000fff000000ff00000000000
// 108:fffff00000000ff000000ff000000ff000000ff0000fff00000ff00000000000
// 109:0ff000000ff000000ff000000ff000000ff0000000ffffff000fffff00000000
// 110:00000ff000000ff000000ff000000ff000000ff0ffffff00fffff00000000000
// 113:00000000000fffff00ffffff0ff000000ff000000ff000000ff0000000ffffff
// 114:00000000fffff000ffffff0000000ff000000ff00000000000000000ffffff00
// 115:00000000000ff00000fff0000ff000000ff000000ff000000ff000000fffffff
// 116:00000000000ff000000fff0000000ff000000ff000000ff000000ff0fffffff0
// 117:00000000000fffff00ffffff0ff000000ff000000ff000000ff000000ff00000
// 118:00000000fffff000ffffff0000000ff000000ff00000000000000000000ffff0
// 119:00000000000fffff00ffffff0ff000000ff000000ff000000ff000000fffffff
// 120:00000000fffff000ffffff0000000ff000000ff000000ff000000ff0fffffff0
// 121:00000000000ff00000ffff000ff00ff00ff00ff00ff00ff00ff00ff00ff000ff
// 122:00000000000ff00000ffff000ff00ff00ff00ff00ff00ff00ff00ff0ff000ff0
// 123:00000000000fffff00ffffff0ff000000ff000000ff000000ff000000ff00000
// 124:00000000fffff000ffffff0000000ff000000ff000000ff000000ff000000ff0
// 125:000000000ff000000fff0000000ff000000ff000000ff000000ff000000ff000
// 126:0000000000000ff00000fff0000ff000000ff000000ff000000ff000000ff000
// 129:00ffffff00000000000000000ff000000ff0000000ffffff000fffff00000000
// 130:ffffff0000000ff000000ff000000ff000000ff0ffffff00fffff00000000000
// 131:0fffffff0ff000000ff000000ff000000ff0000000fff000000ff00000000000
// 132:fffffff000000ff000000ff000000ff000000ff0000fff00000ff00000000000
// 133:0ff000000ff000000ff000000ff000000ff0000000ffffff000fffff00000000
// 134:000ffff000000ff000000ff000000ff000000ff0ffffff00fffff00000000000
// 135:0fffffff0ff000000ff000000ff000000ff0000000fff000000ff00000000000
// 136:fffffff000000ff000000ff000000ff000000ff0000fff00000ff00000000000
// 137:0ff0000f0ff000000ff000000ff000000ff0000000fff000000ff00000000000
// 138:f0000ff000000ff000000ff000000ff000000ff0000fff00000ff00000000000
// 139:0ff000000ff000000ff000000ff000000ff0000000ffffff000fffff00000000
// 140:00000ff000000ff000000ff000000ff000000ff0ffffff00fffff00000000000
// 141:000ff000000ff000000fff000000fff000000ff0000000ff0000000f00000000
// 142:000ff000000ff00000fff0000fff00000ff00000ff000000f000000000000000
// 145:000000000000003300000344000034440303444403333334003eccc300ee333c
// 146:0000000033000000443000004443000044443030433333303ccce300c333ee00
// 147:00000000000000000000003300000344000034440303444403333334003eccc3
// 148:000000000000000033000000443000004443000044443030433333303ccce300
// 149:000000000000003300000344000034440303444403333334003eccc300ee333c
// 150:0000000033000000443000004443000044443030433333303ccce300c333ee00
// 151:00000000000000000000003300000344000034440303444403333334003eccc3
// 152:000000000000000033000000443000004443000044443030433333303ccce300
// 161:0eecc3cc003ccccc003cc3330003c3ff0003cc3300343ccc033443333f3443ff
// 162:cc3ccee0ccccc300333cc300ff3c300033cc3000ccc3430033344330ff3443f3
// 163:00ee333c0eecc3cc003ccccc003ccccc0003c3330033cc3303343ccc3f344333
// 164:c333ee00cc3ccee0ccccc300ccccc300333c300033cc3300ccc34330333443f3
// 165:0eecc3cc003ccccc003ccccc0003c3330003cccc00343ccc033443333f3443ff
// 166:cc3ccee0ccccc300ccccc300333c3000cccc3000ccc3430033344330ff3443f3
// 167:00ee333c0eecc3cc003ccccc003ccccc0003c3330003cc3300343ccc03344333
// 168:c333ee00cc3ccee0ccccc300ccccc300333c300033cc3000ccc3430033344330
// 177:3f3443ff3f3443ff033443ff0c3443ff0c3443ff0c3333330cc888830cc88883
// 178:ff3443f3ff3443f3ff344330ff3443c0ff3443c0333333c088888cc088888cc0
// 179:3f3443ff3f3443ff033443ff0c3443ff0c3443ff0c3333330cc888830cc88883
// 180:ff3443f3ff3443f3ff344330ff3443c0ff3443c0333333c088888cc088888cc0
// 181:3f3443ff3f3443ff033443ff0c3443ff0c3443ff0c3333330cc888830cc88883
// 182:ff3443f3ff3443f3ff344330ff3443c0ff3443c0333333c088888cc088888cc0
// 183:3f3443ff3f3443ff3f3443ff033443ff0c3443ff0c3443ff0c3333330cc88883
// 184:ff3443f3ff3443f3ff3443f3ff344330ff3443c0ff3443c0333333c088888cc0
// 193:0038888300388833003888300038883000344430034444300033333000000000
// 194:8888830033888300038883000388830003444300034444300333330000000000
// 195:0038888300388833003888300038883000344430034444300033333000000000
// 196:8888830033888300038883000388830003444300034444300333330000000000
// 197:0038888300388833003888300038883000344430034444300033333000000000
// 198:8888830033888300038883000388830003444300034444300333330000000000
// 199:0cc8888300388833003888300038883000344430034444300033333000000000
// 200:88888cc033888300038883000388830003444300034444300333330000000000
// </TILES>

// <MAP>
// 001:a0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 002:708080808080808080808080808080808080808080808090009100810071000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 004:00000000000000000000000000000000000000000000000000000000000000152535455565758595a5152500005565b5c5d5e51727374795a5b5c5000000000000005767778797a795a50000b7c7d7e795a5b5c5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 005:00000000000000000000000000000000000000000000000000000000000000162636465666768696a6162600005666b6c6d6e61828384896a6b6c6000000000000005868788898a896a60000b8c8d8e896a6b6c6000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </MAP>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:030803080308030803080308230053019302a301b301c300e300e300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300307000000000
// 001:000100020002400f500d900fa000b000d001e001f001f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000310000000000
// </SFX>

// <PALETTE>
// 000:140c1c44243430346d4e4a4e854c30346524d04648757161597dced27d2c8595a16daa2cd2aa996dc2cadad45edeeed6
// </PALETTE>

