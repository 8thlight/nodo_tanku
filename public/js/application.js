jQuery(function() {
  jQuery('#angle').bind('change', function(event) {
    var angleDegrees = this.value;
    if (angleDegrees > 90) {
      angleDegrees = 180 - angleDegrees;
    }
    jQuery('#angle_value').text(angleDegrees);
    tanksClient.updateSelfTankImage(this.value);
  });
  
  jQuery('#velocity').bind('change', function(event) {
    jQuery('#velocity_value').text(this.value);
  });
  
  jQuery(document).bind('keypress', function(event) {
    // detect spacebar key for firing if playing game
    if (jQuery('#battlefield').is(':visible') && event.which === 32) {
      event.preventDefault();
      event.stopPropagation();
      
      var angle = 180 - jQuery('#angle')[0].value;
      var velocity = jQuery('#velocity')[0].value;
      tanksClient.tankFired(angle, velocity);
      
      return false;
    } else if (jQuery('#user_name').is(':visible') && event.which === 13) {
      event.preventDefault();
      event.stopPropagation();
      
      tanksClient.joinGame(jQuery('#user_name').val());
    }
  });
});