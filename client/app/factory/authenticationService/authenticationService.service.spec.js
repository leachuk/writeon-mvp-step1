'use strict';

describe('Service: authenticationService', function () {

  // load the service's module
  beforeEach(module('writeonMvpStep1App'));

  // instantiate service
  var authenticationService;
  beforeEach(inject(function (_authenticationService_) {
    authenticationService = _authenticationService_;
  }));

  it('should do something', function () {
    expect(!!authenticationService).toBe(true);
  });

});
