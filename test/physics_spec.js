var physics = require(__dirname + "/../lib/Physics");
var sys = require('sys');
describe("Physics", function() {

  describe("A Path", function() {
    it("can define a curving line starting at a point", function() {
      var initial_velocity = 1,
          angle = 0;
      path = physics.new_path(1,2, initial_velocity, angle,1, 9.8)
      expect(path.getX()).toEqual(1);
      expect(path.getY()).toEqual(2);
      expect(path.getdx()).toEqual(1);
      expect(path.getdy()).toEqual(0);
    });

    it ("can define a vertical path", function() {
      var initial_velocity = 9.8 ,
          angle = Math.PI/2;
      path = physics.new_path(0,0, initial_velocity, angle, 1, 9.8)
      orig = path.initial;
      expect(path.getX()).toEqual(0);
      expect(path.getY()).toEqual(0);
      expect(path.getdx() < .001).toBeTruthy();
      expect(path.getdy()).toEqual(9.8);
    });

    it("can increment y in a vertical path by one tick", function() {
      var initial_velocity = 9.8 ,
          angle = Math.PI/2;
      path = physics.new_path(0,0, initial_velocity, angle, 1, 9.8);
      path.tick();
      expect(path.getY()).toEqual(4.9);
      expect(Math.abs(path.getY() - 4.9) < .001).toBeTruthy();
      expect(Math.abs(path.getX()) < .001).toBeTruthy();
    });

    it("can find the end point and flight time of a simple curve", function() {
      var initial_velocity = 1,
          angle = 0;
      path = physics.new_path(1,4.9, initial_velocity, angle,1,9.8);
      expect(path.end_point()).toEqual(2);
      expect(path.flight_time()).toEqual(1);
    });
  });
});
