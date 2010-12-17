var PlayerCollection = require(__dirname + "/../lib/player_collection");

describe("PlayerCollection", function() {
	it("is created with an empty list of players", function() {
		var playerCollection = new PlayerCollection();
		expect(playerCollection.players).toEqual([]);
	});
	
	it("can add a new player with a name", function() {
		var playerCollection = new PlayerCollection();
		var randomizer = playerCollection.randomizer;
		playerCollection.randomizer = function(thing) {return 5;};
		playerCollection.add("bob loblaw");
		playerCollection.randomizer = randomizer;
		
		player = playerCollection.players[0];
		expect(player.id).toEqual(0);
		expect(player.name).toEqual("bob loblaw");
		expect(player.x).toEqual(5);
		expect(player.y).toEqual(0);
		expect(player.score).toEqual(0);
	});
	
	it("increments the player ids", function() {
		var playerCollection = new PlayerCollection();
		playerCollection.add("RobLobLizzle");
		playerCollection.add("bob loblaw");
		
		expect(playerCollection.players[0].id !== playerCollection.players[1].id).toBeTruthy();
	});
	
	it("returns the added player", function() {
		var playerCollection = new PlayerCollection();
		
		var player = playerCollection.add("your mama");
		
		expect(player.name).toEqual("your mama");
	});
	
	it("finds a player by id", function() {
		var playerCollection = new PlayerCollection();
		playerCollection.add("your mama");
		
		var player = playerCollection.findById(playerCollection.players[0].id);
		
		expect(player).toEqual(playerCollection.players[0]);
	});
	
	it("returns null if player with id not found", function() {
		var playerCollection = new PlayerCollection();
		
		var player = playerCollection.findById(42);
		
		expect(player).toBeNull();
	});
	
	it("removes a player", function() {
		var playerCollection = new PlayerCollection();
		playerCollection.add("your mama");
		
		playerCollection.removeById(playerCollection.players[0].id);
		
		expect(playerCollection.players).toEqual([]);
	});
});
