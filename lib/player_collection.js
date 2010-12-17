var currentId = 0;
function PlayerCollection() {
	var self = this;
	
	this.randomizer = function() {
	  var maximum = 1000 - 40; // canvas width - tank width
	  
	  var validStartPoint = function(x) {
	    for (var i = 0; i < self.players.length; i += 1) {
	      if (x >= self.players[i].x && x <= self.players[i].x + 50 ) {
	        return false;
	      }
      }
      return true;
	  };
	  
	  var candidate;
	  for (var i=0; i < 10; i += 1) {
	    candidate = Math.floor(Math.random() * maximum);
	    if (validStartPoint(candidate)) {
	      return candidate;
	    }
	  }
	  
	  sys.log("couldn't find a good place");
	  return candidate;
	};
	
	this.players = [];
	
	this.add = function(name) {
		var player = {
			"id": currentId++,
			"name": name,
			"x": self.randomizer(), 
			"y": 0,
			"score": 0
		};
		self.players.push(player);
		return player;
	};
	
	this.findIndexById = function(id) {
		for (var i = 0; i < self.players.length; i += 1) {
			var candidate = self.players[i];
			if (candidate.id === id) {
				return i;
			}
		}
	};
	
	this.findById = function(id) {
		candidate = self.players[self.findIndexById(id)];
		if (candidate !== undefined) {
			return candidate;
		}
		else {
			return null;
		}
	};
	
	this.removeById = function(id) {
		var index = self.findIndexById(id);
		delete self.players[index];
		self.players.splice(index, 1);
	};
}

module.exports = PlayerCollection;
