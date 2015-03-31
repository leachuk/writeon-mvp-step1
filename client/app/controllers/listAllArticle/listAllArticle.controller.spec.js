'use strict';

describe('Controller: ListAllArticleCtrl', function () {

  // load the controller's module
  beforeEach(module('writeonMvpStep1App'));

  var ListAllArticleCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ListAllArticleCtrl = $controller('ListAllArticleCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
