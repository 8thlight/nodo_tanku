var http = require('http'),
    sys  = require('sys'),
    static = require('node-static/lib/node-static'),
    url = require('url'),
		faye = require('faye/faye-node'),
		io = require('socket_io'),
		PlayerCollection = require(__dirname + "/../lib/player_collection"),
		physics = require(__dirname + "/../lib/Physics");

function Tanks(options) {
  if (! (this instanceof arguments.callee)) {
    return new arguments.callee(arguments);
  }

  var self = this;

  self.settings = {
    port: options.port
  };
	
	self.players = new PlayerCollection();
	
  self.init();
};

Tanks.prototype.init = function() {
  var self = this;
	
	self.bayeux = self.createBayeuxServer();
  self.httpServer = self.createHTTPServer();
	
	var socket = io.listen(self.httpServer),
			json = JSON.stringify;
	
	socket.on('connection', function(client) {
	  client.on('message', function(userName) {
			sys.log(userName + " is joining the battle...");
			
			var player = self.players.add(userName);		
			
			var credentials = { "id": player.id };
			client.send(json(credentials));
			
			sys.log("Added player: " + sys.inspect(player));
			self.bayeux.getClient().publish('/add_tank', player);
			self.bayeux.getClient().publish('/update_scoreboard', self.players.players);
		});
	});
	
	self.bayeux.attach(self.httpServer);
	
  self.httpServer.listen(self.settings.port);
  sys.log('Server started on port ' + self.settings.port);
};

Tanks.prototype.handleStaticResourceRequest = function (req, res) {
	var self = this,
	    file = new static.Server('./public', {
         cache: false
      });

  req.addListener('end', function() {
    var location = url.parse(req.url, true),
        params = (location.query || req.headers);
        
    if (location.pathname == '/config.json' && req.method == 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/x-javascript' });
      var jsonString = JSON.stringify({ port: self.settings.port });
      res.end(jsonString);
    } else if (location.pathname == '/gameState.json' && req.method == 'GET') {
			res.writeHead(200, { 'Content-Type': 'application/x-javascript' });
			var gameUpdate = { "tanks": self.players.players };
      var jsonString = JSON.stringify(gameUpdate);
      res.end(jsonString);
		} else if (location.pathname == '/remove_tank' && req.method == 'GET') {
		  res.writeHead(200, { 'Content-Type': 'application/x-javascript' });
		  res.end();
		  
		  var userId = location["query"]["id"];
		  self.bayeux.getClient().publish("/remove_tank", {"id": userId});
		} else {
       file.serve(req, res);
    }
  });
};

Tanks.prototype.createBayeuxServer = function() {
	var self = this;
	
	var bayeux = new faye.NodeAdapter({
		mount: '/faye',
		timeout: 45
	});
	
	bayeux.getClient().subscribe("/remove_tank", function(player) {
	  sys.log("removing tank " + player.id);
	  
	  self.players.removeById(player.id);
	  
	  self.bayeux.getClient().publish('/update_scoreboard', self.players.players);
	});
	
	bayeux.getClient().subscribe("/shot", function(shot) {
		sys.log("received shot event");
		var shooter = self.players.findById(shot.id);
		if (!shooter) {
			return;
		}
		var path = physics.new_path(shot.x + 20, shot.y + 40, shot.velocity, shot.angle * Math.PI / 180);
		
		for(var i = 0; i < self.players.players.length; i += 1) {
			var victim = self.players.players[i];
			
			// tank's hit area is from victim.x to victim.x + 40
			var x0 = path.end_point();
			if ((x0 >= victim.x) && (x0 <= victim.x + 40)) {
				sys.log("HIT: " + sys.inspect(victim));
				
				var suicide = false;
				if (victim.id.toString() === shooter.id.toString()) {
				  suicide = true;
				}
				
				if (shooter) {
				  if (suicide) {
				    victim["suicide"] = true;
				    shooter.score -= 1;
				  } else {
				    victim["suicide"] = false;
				    shooter.score += 1;
				  }
				}
				
				victim.x = self.players.randomizer();
				
				self.bayeux.getClient().publish('/destroy_tank', victim);
								
				setTimeout(function() {
					self.bayeux.getClient().publish('/update_scoreboard', self.players.players);
				}, 1000);
				
				setTimeout(function() {
				  sys.log("Added tank: " + sys.inspect(victim));
					self.bayeux.getClient().publish('/add_tank', victim);
				}, 5000);
				break;
			}
			else {
				sys.log("MISS: " + sys.inspect(shot));
			}
		}
	});
	
	return bayeux;
};

Tanks.prototype.createHTTPServer = function() {
  var self = this;
	
  var server = http.createServer(function(req, res) {
		
		switch (url.parse(req.url)["pathname"])  {
			default:
				self.handleStaticResourceRequest(req, res);
				break;
		}
		
  });

  return server;
};

module.exports = Tanks;
