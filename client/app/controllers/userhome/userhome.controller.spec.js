'use strict';

describe('Controller: UserhomeCtrl', function () {

  // load the controller's module
  beforeEach(module('writeonMvpStep1App'));

  var UserhomeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UserhomeCtrl = $controller('UserhomeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
