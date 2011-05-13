// TODO: remove when given tank width/height
var TANK = {
  width : 40,
  height : 40
};

function TanksClient () {
  if (!(this instanceof arguments.callee)) {
    return new arguments.callee(arguments);
  }

  var battlefield = {
    tanks       : [],
    projectiles : []
  };

  var canvas,
      ctx,
      self = this,
      id,
      canShoot = true;

  this.init = function() {
    // Removing this function breaks ability to hit enter to join game
  };

  this.getBattlefield = function() {
    return battlefield;
  };

  this.setupBayeuxHandlers = function() {
    self.client.subscribe("/add_tank", function(player) {
      console.log("add_tank: " + player);
      self.addTank(player);
    });

    self.client.subscribe("/remove_tank", function(player) {
      console.log("remove_tank: " + player["id"]);
      self.removeTank(player);
    });

    self.client.subscribe("/destroy_tank", function(player) {
      console.log("destroy_tank: " + player);
      self.destroyTank(player);
    });

    self.client.subscribe("/update_scoreboard", function(message) {
      console.log("update_scoreboard");
      self.updateScoreboard(message);
    });

    self.client.subscribe("/shot", function(projectile) {
      self.addProjectile(projectile);
    });
  };

  this.joinGame = function(name) {
    canvas = document.getElementById('battlefield');
    ctx = canvas.getContext("2d");

    self.client = new Faye.Client(location.host + "/faye", {
      timeout: 120
    });

    self.setupBayeuxHandlers();
    setInterval(self.updateCanvas, 35);

    if (id) { return; }

    var socket = new io.Socket(location.hostname);

    socket.connect();

    socket.on('message', function(data) {
      var credentials = JSON.parse(data);

      $(window).unload(function () {
        jQuery.ajax({
                 url:    "/remove_tank?id=" + id,
                 async:   false
            });
      });

      id = credentials["id"];
      console.log('credentials: ' + credentials);
      console.log("userId: " + id);

      jQuery.getJSON("/gameState.json", function (currentState) {
        console.log("currentState: " + currentState);

        self.initializeGameState(currentState);

        jQuery('#join_game_form').hide("fade");
        jQuery('.vote').hide("fade");
        jQuery('#game').show("fade");
      });
    });

    socket.send(name);
  };

  this.initializeGameState = function(state) {
    var i;
    if (!('tanks' in state)) {
      return;
    }
    self.getBattlefield().tanks = [];
    for (i=0; i<state.tanks.length; i+=1) {
      self.addTank(state.tanks[i]);
    }
    self.updateScoreboard(state.tanks);
  };

  this.updateScoreboard = function(tanks) {
    console.log(tanks);
    var myTank,
        i;
    for (i=0; i<tanks.length; i+=1) {
      if (String(tanks[i].id) === String(id)) {
        myTank = tanks[i];
        break;
      }
    }

    if (myTank) {
      var myScoreBody = jQuery("#my_score tbody");
      myScoreBody.empty();
      myScoreBody.append("<tr><td>" + myTank.name + "</td><td class='score'>" + myTank.score + "</td></tr>");

      var sortedTanks = tanks.sort(self.sortScoresHighest);
      var top;
      if (sortedTanks.length > 10) {
        top = 10;
      } else {
        top = sortedTanks.length;
      }

      var topScoresBody = jQuery("#top_scores tbody");
      topScoresBody.empty();
      for (i=0; i<top; i+=1) {
        topScoresBody.append("<tr><td>" + tanks[i].name + "</td><td class='score'>" + tanks[i].score + "</td></tr>");
      }
    }
  };

  this.sortScoresHighest = function(one, other) {
    if (one.score < other.score)
      return 1;
    if (one.score > other.score)
      return -1;
    return 0;
  };

  this.addTank = function(tank) {
    tank["image"] = self.getRandomImage();
    self.getBattlefield().tanks.push(tank);
  };

  this.removeTank = function(player) {
    var i;
    if (!player) { return; }
    console.log("removing player " + player.id);

    console.log("number tanks " + battlefield.tanks.length);
    for (i=0; i<battlefield.tanks.length; i+=1) {
      console.log("tank id " + battlefield.tanks[i].id);
      if (battlefield.tanks[i].id.toString() === player.id.toString()) {
        console.log("found player!")
        battlefield.tanks.splice(i,1);
      }
    }
  };

  this.playSound = function(path) {
    function addSource(elem) {
      $('<source />').attr('src', path).appendTo(elem);
    }
    var audio = $('<audio />', {
      autoPlay: 'autoplay'
    });
    addSource(audio);

    audio.appendTo('body');
  };

  this.destroyTank = function(message) {
    var i,
        tank;
    for (i=0; i<battlefield.tanks.length; i+=1) {
      if (battlefield.tanks[i].id.toString() === message.id.toString()) {
        tank = battlefield.tanks[i];
        break;
      }
    }
    if (!tank) { return; }

    tank["destroyed"] = true;

    if (message.suicide === true) {
      self.playSound("sounds/suicide.mp3");
    }
    else {
      var soundNumber = Math.floor(Math.random() * 3);
      self.playSound("sounds/destroy" + soundNumber.toString() + ".mp3");    
    }

    setTimeout(function() {
      self.removeTank(tank);
    }, 3000);
  };

  this.tankFired = function(angle, velocity) {
    var i,
        tank;
    for (i=0; i<battlefield.tanks.length; i+=1) {
      if (battlefield.tanks[i].id === id) {
        tank = battlefield.tanks[i];
        break; 
      }
    }
    if (!tank) { return; }
    if (canShoot) {
      self.playSound("sounds/shoot.mp3");
      self.client.publish("/shot", {'id': tank.id, 'x': tank.x, 'y': tank.y, 'angle': angle, 'velocity': velocity});
      canShoot = false;
      setTimeout(function() {canShoot = true;}, 1000);
    }
  };

  this.addProjectile = function(projectile_info) {
    var projectile = {
      path : physics.new_path(projectile_info.x + 20,projectile_info.y + 40,projectile_info.velocity,self.convertToRadians(projectile_info.angle)),
      id : projectile_info.id
    };
    self.getBattlefield().projectiles.push(projectile);
  };

  this.convertToRadians = function(angle) {
    return angle * Math.PI / 180;
  };

  this.updateCanvas = function() {
    self.updateProjectiles();
    self.draw();
  };

  this.draw = function() {
    ctx.clearRect(0, 0, canvas.getAttribute("width"), canvas.getAttribute("height"));
    self.drawBattlefield();
  };

  this.drawBattlefield = function() {
    var i;
    for (i=0; i<battlefield.tanks.length; i+=1) {
      self.drawTank(battlefield.tanks[i]);
    }

    for (i=0; i<battlefield.projectiles.length; i+=1) {
      self.drawProjectile(battlefield.projectiles[i]);
    }
  };

  this.drawTankName = function(tank) {
    var font = "10px Helvetica",
        name = tank.name;
    if (tank.id === id) {
      ctx.fillStyle = 'orange';
      font = "bold " + font;
      name = name + " (me)";
    } else {
      ctx.fillStyle = 'lightblue';
    }
    ctx.font = font;
    ctx.fillText(name, tank.x+7, self.y(tank.y)-TANK.height-15)

    ctx.fillStyle = 'black';
  };

  this.drawTank = function(tank) {
    if (tank["destroyed"]) {
      ctx.fillStyle = 'white';
      ctx.font = "40px Arial";
      ctx.fillText("☠", tank.x+5, self.y(tank.y)-TANK.height+33)
      ctx.fillStyle = 'black';
    }
    else {
      ctx.drawImage(tank["image"], tank.x, self.y(tank.y)-TANK.height);
    }

    self.drawTankName(tank);
  };

  this.updateProjectiles = function() {
    var deadProjectiles = [];
    for (i=0; i<battlefield.projectiles.length; i+=1) {
      var projectile = battlefield.projectiles[i];
      projectile.path.tick();
      if (projectile.path.getY() < 1) {
        deadProjectiles.push(i);
      }
    }

    for (i=0; i < deadProjectiles.length; i+=1) {
      battlefield.projectiles.splice(deadProjectiles[i], 1);
    }
  }

  this.drawProjectile = function(projectile) {   
    ctx.beginPath();
    ctx.arc(projectile.path.getX(), self.y(projectile.path.getY()), 3, 0, Math.PI*2, true); 
    ctx.fill();
    ctx.closePath();
  };

  // offsets y-coordinate to bring (0,0) coordinates to bottom-left corner
  this.y = function(n) {
    return canvas.getAttribute("height") - n;
  };

  this.getRandomImage = function() {
    var image = new Image();
    image.src = Math.round(Math.random()) ? '/images/tank_shoot_left_small.png' : '/images/tank_shoot_right_small.png';
    return image;
  };

  this.updateSelfTankImage = function(angle) {
    var image = new Image(),
        i;
    if (0 <= angle && angle <= 90) { 
      image.src = '/images/tank_shoot_left_small.png';
    } else {
      image.src = '/images/tank_shoot_right_small.png';
    }
    for (i=0; i<self.getBattlefield().tanks.length; i+=1) {
      if (self.getBattlefield().tanks[i].id === id) {
        self.getBattlefield().tanks[i]["image"] = image;
        break;
      }
    }
  };

  this.init();
}

var tanksClient;
jQuery(function() {
  tanksClient = new TanksClient();
});
