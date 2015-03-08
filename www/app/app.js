'use strict';

// Declare app level module which depends on views, and components
angular.module('FooAnalytics', [
  'ngRoute',
  'FooAnalytics.dashboard',
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}])
.filter('dateRange', function(){
    return function(input, after, before) {
        angular.forEach(input, function(obj, key){
          var d = Date.parse(obj.Date);
          if ((d <= before) && (d >= after)) {
            return obj;
            console.log("match");
          } else {
            console.log("no match");
          }
        });
    };
});

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}