'use strict';

describe('Controller: GetArticleCtrl', function () {

  // load the controller's module
  beforeEach(module('writeonMvpStep1App'));

  var GetArticleCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GetArticleCtrl = $controller('GetArticleCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
