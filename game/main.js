/**
 * Playing Asteroids while learning JavaScript object model.
 */

/** 
 * Shim layer, polyfill, for requestAnimationFrame with setTimeout fallback.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */ 
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/**
 * Shim layer, polyfill, for cancelAnimationFrame with setTimeout fallback.
 */
window.cancelRequestAnimFrame = (function(){
  return  window.cancelRequestAnimationFrame || 
          window.webkitCancelRequestAnimationFrame || 
          window.mozCancelRequestAnimationFrame    || 
          window.oCancelRequestAnimationFrame      || 
          window.msCancelRequestAnimationFrame     || 
          window.clearTimeout;
})();

var target = new Vector(750, 70); 
var hits=0;
var seconds = 60;
var backgroundSound = new Audio("../audio/background.mp3");
var bang = new Audio("../audio/bang.mp3");
var fail = new Audio("../audio/fail.mp3");
var laserSound = new Audio("../audio/laser.mp3");
var timer = setInterval(secondCounter,1000);
var rock = new Image(); 
rock.src = "../img/rock.png";

var secRock = new Image(); 
secRock.src = "../img/rock.png";

var shots = new Array();  
var nrOfShots=0;  
var nrOfhits=0;  

/**
 * Trace the keys pressed
 * http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
 */
window.Key = {
  pressed: {},

  LEFT:   37,
  UP:     38,
  RIGHT:  39,
  DOWN:   40,
  SPACE:  32,
  A:      65,
  S:      83,
  D:      68,
  w:      87,

  
  isDown: function(keyCode, keyCode1) {
    return this.pressed[keyCode] || this.pressed[keyCode1];
  },
  
  onKeydown: function(event) {
    this.pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this.pressed[event.keyCode];
  },
    shotsStop: function()  
  {  
      delete this.pressed[32];  
  }

};
window.addEventListener('keyup',   function(event) { Key.onKeyup(event); },   false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);


/**
 * All objects are Vectors
 */
function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Vector.prototype = {
  muls:  function (scalar) { return new Vector( this.x * scalar, this.y * scalar); }, // Multiply with scalar
  imuls: function (scalar) { this.x *= scalar; this.y *= scalar; return this; },      // Multiply itself with scalar
  adds:  function (scalar) { return new Vector( this.x + scalar, this.y + scalar); }, // Multiply with scalar
  iadd:  function (vector) { this.x += vector.x; this.y += vector.y; return this; }   // Add itself with Vector
}

/**
 * The forces around us.
 */
function Forces() {
  this.all = {};
}

Forces.prototype = {

  createAcceleration: function(vector) {
    return function(velocity, td) {
      velocity.iadd(vector.muls(td));
    }
  },

  createDamping: function(damping) {
    return function(velocity, td) {
      velocity.imuls(damping);
    }
  },

  createWind: function(vector) {
    return function(velocity, td) {
      velocity.iadd(vector.adds(td));
    }
  },  

  addAcceleration:  function(name, vector)  { this.all[name] = this.createAcceleration(vector); },
  addDamping:       function(name, damping) { this.all[name] = this.createDamping(damping); },
  addWind:          function(name, vector)  { this.all[name] = this.createWind(vector); },

  update: function(object, td) {
    for(var force in this.all) {
      if (this.all.hasOwnProperty(force)) {
        this.all[force](object, td);
      }
    }
  }

}

window.Forces = new Forces();
window.Forces.addAcceleration('gravity', new Vector(0, 9.82));
window.Forces.addDamping('drag', 0.97);
window.Forces.addWind('wind', new Vector(0.5, 0));


/**
 * A Player as an object.
 */
function Player(width, height, position, velocity, speed, direction, accelerateForce, breakForce, dampForce) {
  this.height     = height    || 32;
  this.width      = width     || 32;
  this.position   = position  || new Vector();
  this.velocity   = velocity  || new Vector();
  this.speed      = speed     || new Vector();
  this.direction  = direction || 0;
  this.accelerateForce  = accelerateForce || Forces.createAcceleration(new Vector(80, 80));
  this.breakForce       = breakForce      || Forces.createDamping(0.97);
  this.dampForce        = dampForce       || Forces.createDamping(0.999);
}

function Bullet(direction, bulletSpeedX, bulletSpeedY, x, y)  
{  
  this.direction  = direction || 0;
  this.bulletSpeedY  = bulletSpeedY || 0;
  this.bulletSpeedX  = bulletSpeedX || 0;  
  this.y = y || 0;  
  this.x  = x || 0;  
} 

Player.prototype = {

  draw: function(ct) {
    
    var x = this.width/2, y = this.height/2;
        ct.drawImage(rock,target.x,target.y);

    
    ct.save();
    ct.translate(this.position.x, this.position.y);
    ct.rotate(this.direction+Math.PI/2)
    ct.beginPath();
    ct.moveTo(0, -y);
    ct.lineTo(x, y);
    ct.lineTo(0, 0.8*y);
    ct.lineTo(-x, y);
    ct.lineTo(0, -y);
    

    
    if (Key.isDown(Key.UP, Key.W)) {
      ct.moveTo(0, y);
      ct.lineTo(-2, y+10);
      ct.lineTo(0, y+8);
      ct.lineTo(2, y+10);
      ct.lineTo(0, y);
    } 
    
    if (Key.isDown(Key.DOWN, Key.S)) {
      ct.moveTo(y+4, 0);
      ct.arc(0, 0, y+4, 0, Math.PI, true);
    }
    
     if (Key.isDown(Key.SPACE))   {
      laserSound.play();
          ct.stroke();
          ct.restore();
          document.getElementById('nrOfShots').innerHTML = parseInt(document.getElementById('nrOfShots').innerHTML) + 1;
          shots[nrOfShots++] = new Bullet(this.direction, 10, 10 , this.position.x, this.position.y);
          Key.shotsStop();
    } 
    ct.stroke();
    ct.restore();
  
      timer = document.getElementById('timer'); 
        if(seconds<1){    
      document.getElementById("newGame").style.visibility="visible";
      document.getElementById("Message").innerHTML="Du sköt <span id='nrOfHits'>0</span> asteroider!";
      timer.innerHTML = 0;
      theFinalScore = document.getElementById('nrOfHits'); 
      theFinalScore.innerHTML = hits;
      }
        else{
          document.getElementById("newGame").style.visibility="hidden";
            document.getElementById("Message").innerHTML="Antal asteroider du träffat:<span id='hits'>0</span>";
            timer.innerHTML = seconds;
            score = document.getElementById('hits');        
        }
             for(var i=0 ; i<nrOfShots ; i++)  
    {
      shots[i].y +=  Math.sin(shots[i].direction) * shots[i].bulletSpeedY;          
      shots[i].x +=  Math.cos(shots[i].direction) * shots[i].bulletSpeedX;
        
      ct.save();  
      ct.translate(shots[i].x, shots[i].y);
      ct.beginPath();  
      ct.moveTo(-1, -1);  
      ct.lineTo(0, -1);  
      ct.stroke();  
      ct.restore();
      
       if (
           shots[i].x >= target.x &&
           shots[i].x <= target.x+40 &&
           shots[i].y >= target.y &&
           shots[i].y <= target.y+40
          )
      {
        bang.play();
        score.innerHTML = hits++;            
        target.x = Math.floor(((Math.random()*width)-15)+1); 
        target.y = Math.floor(((Math.random()*height)-15)+1);
        
          ct.beginPath();
          ct.moveTo(target.x, target.y);
          ct.drawImage(rock,target.x,target.y);               
          ct.stroke();
          ct.restore();
      }
         if(this.position.x <= target.x+40 && this.position.x >= target.x -10
          && this.position.y <= target.y+40 && this.position.y>= target.y -40 )
         {
          fail.play();
          hits = 0;
         }
       else{
        score.innerHTML= hits;
       }  
    }
  },

  moveForward: function() {
    this.dampForce(this.speed, td);
    this.position.x += this.speed.x * Math.cos(this.direction) * td;
    this.position.y += this.speed.y * Math.sin(this.direction) * td;
    this.position.iadd(this.velocity.muls(td));
  },

  rotateLeft:  function() { this.direction -= Math.PI/30; },
  rotateRight: function() { this.direction += Math.PI/30; },

  throttle: function(td)  { this.accelerateForce(this.speed, td); },
  breaks:   function(td)  { this.breakForce(this.speed, td); this.breakForce(this.velocity, td); },

  update: function(td, width, height) {
    if (Key.isDown(Key.UP, Key.W))     this.throttle(td);
    if (Key.isDown(Key.LEFT, Key.A))   this.rotateLeft();
    if (Key.isDown(Key.DOWN, Key.S))   this.breaks(td);
    if (Key.isDown(Key.RIGHT, Key.D))  this.rotateRight();
    Forces.update(this.velocity, td);
    this.moveForward(td);
    this.stayInArea(width, height);
  },

  stayInArea: function(width, height) {
    if(this.position.y < -this.height)  this.position.y = height;
    if(this.position.y > height)        this.position.y = -this.height;
    if(this.position.x > width)         this.position.x = -this.width;
    if(this.position.x < -this.width)   this.position.x = width;
  }
  
}

function secondCounter(){
  seconds--
};


/**
 * Asteroids, the Game
 */
window.Asteroids = (function(){
  var canvas, ct, ship, lastGameTick;

  var init = function(canvas) {
    canvas = document.getElementById(canvas);
    ct = canvas.getContext('2d');
    width = canvas.width,
    height = canvas.height,
    ct.lineWidth = 1;
    ct.strokeStyle = 'hsla(0,0%,100%,1)',
    ship = new Player(10, 20, new Vector(width/2, height/2));
    console.log('Init the game');
  };

  var update = function(td) {
    ship.update(td, width, height);
  };

  var render = function() {
    ct.clearRect(0,0,width,height);
    ship.draw(ct);  
  };

  var gameLoop = function() {
    var now = Date.now();
    td = (now - (lastGameTick || now)) / 1000; 
    lastGameTick = now;
    requestAnimFrame(gameLoop);
    update(td);
    render();
  };

  return {
    'init': init,
    'gameLoop': gameLoop
  }
})();


// On ready
$(function(){
  'use strict';
  backgroundSound.play();
  backgroundSound.loop = true;
  Asteroids.init('canvas1');
  Asteroids.gameLoop();
  console.log('Ready to play.');  
});
