function Logger() {

}

Logger.prototype.logError = function(err) {

  var printSeperator = function() {
    console.log("**********************************************");
  }

  printSeperator();
  console.log('Exception: ' + err);
  console.log(err.stack);
  printSeperator();
}

module.exports = Logger;
