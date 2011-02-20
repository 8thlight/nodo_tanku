var Logger = require('../lib/logger');

describe("Logger", function() {

  beforeEach(function () {

  });

  it("logs an error", function() {
    spyOn(console, "log");
    var err = {"stack": "stack here"};
    var logger = new Logger();

    logger.logError(err);

    expect(console.log).wasCalled();
  });
});
