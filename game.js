// title:  Ticket Crusher
// author: Christopher Stokes
// desc:   Completely accurate simulation of Technical Support
// script: js

var t=0 //ongoing frame counter
var shake=0 //screen shake

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
	if(btn(0) && this.y>0)this.y--
	if(btn(1))this.y++
	if(btn(2))this.x--
	if(btn(3))this.x++
	if(btnp(4)) {
		this.actionCountdown = 10;
		
		for (var t=0; t<tickets.length; t++) {
			if (collides(this, tickets[t]) && tickets[t].alive) {
				for (var i=0; i<5; i++) {
					var e = new Explosion(tickets[t].x+(tickets[t].wid/2), tickets[t].y+(tickets[t].hei/2));
					explosions.push(e);
				}
				tickets[t].alive = false;
				gameState.score += 1;
				shake = 5;
				sfx(0);
			}
		}
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

var Ticket = function(speed, bounce) {
	this.x = getRandomInt(16,swid-16);
	this.y = getRandomInt(16,shei-16);
	this.sprite = 5;
	this.wid = 16;
	this.hei = 16;
	this.alive = true;
	this.speed = speed;
	this.bounce = bounce;
	this.rebound = 0;

	
	if (this.x <= swid/2)
		this.dx = this.speed;
		
	if (this.x > swid/2)
		this.dx = (-1 * this.speed);
	
	if (this.y <= shei/2)
		this.dy = this.speed;
		
	if (this.y > shei/2)
		this.dy = (-1 * this.speed);
	
}

Ticket.prototype.update = function() {
	this.x += this.dx;
	this.y += this.dy;
	
	if ((this.x < 0 || this.x > swid-this.wid) && this.bounce > 0) {
		this.dx = this.dx * -1;
		this.bounce -=1;
	}
	
	if ((this.y < 0 || this.y > shei-this.hei) && this.bounce > 0) {
		this.dy = this.dy * -1;
		this.bounce -=1;
	}
	
	if (this.x < -5 || this.x > swid+5 || this.y < -5 || this.y > swid+5) {
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
	spr(this.sprite, this.x, this.y, -1, 1, 0, 0, 2, 2);
}

var explosions = [];

var Explosion = function(x, y, rad, time) {
	this.x = x;
	this.y = y;
	this.dx = getRandomInt(0, 2) - 1;
	this.dy = getRandomInt(0, 2) - 1;
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

var menuState = {} 
menuState.update = function() {
	cls(0);
	print("Ticket Crusher");
	print("press X to start", 15, 15);
	
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
	
	for (t=tickets.length-1; t>-1; t--) {
		if (!tickets[t].alive) {
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
	
	print("Tickets Closed: "+this.score, 5, 5);
	print("Tickets Missed: "+this.missed, 5, 15);

	if (this.missed > this.score/2) {
		currentState = gameoverState;
	}

	if (shake > 0) {
		poke(0x3FF9+1,getRandomInt(-4, 4))
		shake-=1		
		if (shake==0) memset(0x3FF9,0,2);
	}

	if (tickets.length == 0) {
		gameState.day += 1;
		gameState.newWave(gameState.numTickets + 1, gameState.globalSpeed + 0.025, gameState.globalBounce - 0.025)

	}
}

var gameoverState = {};
gameoverState.update = function() {
	cls(0);
	print("YOU'RE FIRED", 5, 5);
	print("You managed to close " + gameState.score + " tickets!", 5, 15);
	print("press X to restart", 5, 25);

	if (btnp(5)) {
		gameState.preload();
		currentState = gameState;
	}
}

var currentState = menuState;

function TIC()
{
	currentState.update();	
	t++
}

function scanline() 
{
	if (shake > 0) poke(0x3FF9,getRandomInt(-4,4))
}

// <TILES>
// 001:11111101111110f0111110f0111110f0111110f0111110f0111110f0111000f0
// 002:1111111111111111111111111111111100011111f0f01111f0f00111f0f0f011
// 003:111111111111111111111101111110f0111110f0111110f0111110f0111000f0
// 004:1111111111111111111111111111111100011111f0f01111f0f00111f0f0f011
// 005:ffffffffff000ff0ff000fffff000ff0fff0fffff00000f0f00000ffffffffff
// 006:ffffffff0000000fffffffff0000000fffffffff0000000fffffffffffffffff
// 017:1110f0ff1110ffff1110ffff11100fff11110fff111100ff111110ff11111000
// 018:f0f0f011fffff011fffff011ffff0111ffff0111fff01111fff0111100011111
// 019:1110f0ff1110ffff1110ffff11100fff11110fff111100ff111110ff11111000
// 020:f0f0f011fffff011fffff011ffff0111ffff0111fff01111fff0111100011111
// 021:f0000000fffffffff0000606f0666606f0666606f0666606f0000600ffffffff
// 022:0000000fffffffff6660000f6660666f6660000f6666660f0060000fffffffff
// </TILES>

// <SPRITES>
// 096:0000000000fffff00f0ff000000ff000000ff000000ff000000ff00000000000
// 097:0000000000ffff00000ff000000ff000000ff000000ff00000ffff0000000000
// 098:0000000000fffff00ff00ff00ff000000ff000000ff00ff00fffff0000000000
// 099:0000000000f00ff00ff00ff00ff0ff000fff0ff00ff00ff00ff00f0000000000
// 100:0000000000fffff00ff000000ffff0000ff000000ff00ff00fffff0000000000
// 101:0000000000fffff00ff00ff00ff00ff00fffff000ff0f0000ff00ff000000000
// 102:000000000fff0ff000ff0ff000ff0ff000ff0ff000ff0ff000ffff0000000000
// 103:0000000000fffff00ff000000ffffff000000ff00ff00ff00fffff0000000000
// 104:0000000000f00ff00ff00ff00ffffff00ff00ff00ff00ff00ff00f0000000000
// 105:0000000000f00ff00ff00ff00ff00ff00ffffff000000ff00fffff0000000000
// 106:0000000000fffff00ff00ff00ff00ff00ff00ff00ff00ff00fffff0000000000
// 107:000000000000ff00000ff00000ff000000000000000000000000000000000000
// </SPRITES>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:030803080308030803080308230053019302a301b301c300e300e300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300f300300000000000
// </SFX>

// <PALETTE>
// 000:140c1c44243430346d4e4a4e854c30346524d04648757161597dced27d2c8595a16daa2cd2aa996dc2cadad45edeeed6
// </PALETTE>

