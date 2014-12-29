'use strict';

describe('Controller: CreateArticleCtrl', function () {

  // load the controller's module
  beforeEach(module('writeonMvpStep1App'));

  var CreateArticleCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreateArticleCtrl = $controller('CreateArticleCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
