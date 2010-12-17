require.paths.unshift(__dirname + "/vendor");
var Logger = require('./lib/logger')

process.addListener('uncaughtException', function (err, stack) {
	var logger = new Logger();
	logger.logError(err);
});

var Tanks = require('./lib/tanks');

new Tanks({
  port: parseInt(process.env.PORT) || 3000
});
