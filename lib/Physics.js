var sys = require("sys");

exports.new_path = function(x_start,y_start, velocity, angle, scale, gravity) {
  var SCALE_VELOCITY  = 1.5;
  var g = 2;
  if (scale){
    SCALE_VELOCITY = scale;
  }
  if (gravity) {
    g = gravity;
  }
  var x_velocity = function(velocity, angle) { return velocity * Math.cos(angle) / SCALE_VELOCITY;}
  var y_velocity = function(velocity, angle) { return velocity * Math.sin(angle) / SCALE_VELOCITY;}
  var distance = function(velocity, angle, y_start) {
    var x_comp = (x_velocity(velocity, angle) / g);
    var yVel = y_velocity(velocity,angle);
    var y_comp = (yVel + Math.sqrt(yVel * yVel + 2 * g * y_start));
    return (x_comp * y_comp);
  };
  var current_x = x_start,
      current_y = y_start,
      dx = x_velocity(velocity,angle),
      dy = y_velocity(velocity,angle),
      tick_count = 0;

  var calc_y = function(tick) {
    current_y += dy*tick - 0.5 * g * tick*tick;
  };
  return {
    setG :  function(new_g) {g = new_g; },
    setScale :  function(new_scale) { SCALE_VELOCITY = new_scale;},
    getX : function() {
      return current_x;
    },

    getY : function() {
      return current_y;
    },

    getdx : function() {
      return dx;
    },

    getdy : function() {
      return dy;
    },

    tick : function() {
      tick_count += 1;
      current_x += dx;
      calc_y(tick_count);
    },

    end_point : function() {
      var dist = distance(velocity,angle,y_start);
      return x_start + dist;
    },

    flight_time : function() {
      return distance(velocity,angle,y_start) / dx;
    }
  };
};
