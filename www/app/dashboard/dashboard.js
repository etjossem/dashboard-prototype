'use strict';

angular.module('FooAnalytics.dashboard', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl: 'dashboard/dashboard.html',
    controller: 'DashboardCtrl'
  });
}])

.controller('DashboardCtrl', ['$scope', '$filter', function($scope, $filter) {
  $scope.sourceCSVPath = "/app/data/visitors.csv";

  $scope.dateRanges = [
    {
      name: 'Today',
      after: Date.parse('July 30 2014'),
      before: Date.parse('July 31 2014')
    },
    {
      name: '3 Days',
      after: Date.parse('July 28 2014'),
      before: Date.parse('July 31 2014')
    },
    {
      name: '7 Days',
      after: Date.parse('July 24 2014'),
      before: Date.parse('July 31 2014')
    },
    {
      name: '14 Days',
      after: Date.parse('July 17 2014'),
      before: Date.parse('July 31 2014')
    },
  ];

  $scope.loadJSONFromCSV = function() {
    d3.csv($scope.sourceCSVPath, function(d) {
      return {
        date: Date.parse(d.Date),
        time: d.Time,
        gender: d.Gender,
        device: d.Device,
        activity: +d.Activity
      };
    }, function(error, rows) {
      $scope.rawData = rows;
      console.log($scope.rawData);
    });
  }
 

  $scope.buildActivityChart = function() {
    $scope.activityChart = c3.generate({
      bindto: '#activity-chart',
      data: {
        x: 'x',
        xFormat: '%m/%d/%Y',
        columns: $scope.activityData
      },
      axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: '%m/%d/%Y'
            }
          },
          y: {
            tick: {
              format: d3.format('%,')
            }
          }
      }
    });
  }

  $scope.buildDeviceChart = function() {
    $scope.deviceChart = c3.generate({
      bindto: '#device-chart',
      data: {
        // iris data from R
        rows: $scope.deviceData,
        type : 'pie',
        onclick: function (d, i) { console.log("onclick", d, i); },
        onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        onmouseout: function (d, i) { console.log("onmouseout", d, i); }
      }
    });
  }

  $scope.countActivity = function() {
    d3.csv($scope.sourceCSVPath, function(error, csv_data) {
     console.log(csv_data);

     if (($scope.selectedSegment == 'male') || ($scope.selectedSegment == 'female')) {
       csv_data = $filter('filter')(csv_data, {'Gender': $scope.selectedSegment});
     }
     // csv_data = $filter('dateRange')(data, $scope.dateRange.after, $scope.dateRange.before);

     var data = d3.nest()
      .key(function(d) { return d.Date;})
      .rollup(function(d) { 
        return {
          "activity_recorded": d3.sum(d, function(g) {return g.Activity;}),
          "total_rows": d.length
        };
      }).entries(csv_data);

      $scope.activityData = [
        ['x'],
        ['Activity']
      ]

      angular.forEach(data, function(obj, key){
        var d = Date.parse(obj.key);
        if ((d >= $scope.dateRange.after) && (d <= $scope.dateRange.before)) {
          $scope.activityData[0].push(obj.key);
          $scope.activityData[1].push(obj.values.activity_recorded / obj.values.total_rows);
        }
      });
      console.log($scope.activityData);

      $scope.buildActivityChart();

    });
  }

  $scope.countDevices = function() {
    d3.csv($scope.sourceCSVPath, function(error, csv_data) {

     if (($scope.selectedSegment == 'male') || ($scope.selectedSegment == 'female')) {
       csv_data = $filter('filter')(csv_data, {'Gender': $scope.selectedSegment});
     }
     // csv_data = $filter('dateRange')(data, $scope.dateRange.after, $scope.dateRange.before);

     var data = d3.nest()
      .key(function(d) { return d.Device;})
      .rollup(function(d) { 
        return {
          "count": d.length
        };
      }).entries(csv_data);
      $scope.deviceData = [
        [],
        []
      ];

      angular.forEach(data, function(obj, key){
        console.log(obj);
        $scope.deviceData[0].push(obj.key.capitalize());
        $scope.deviceData[1].push(obj.values.count);
      });

      $scope.buildDeviceChart();

    });
  }


  $scope.countSegments = function() {
    d3.csv($scope.sourceCSVPath, function(error, csv_data) {
       // csv_data = $filter('dateRange')(csv_data, $scope.dateRange.after, $scope.dateRange.before);
       console.log(csv_data);
       var data = d3.nest()
        .key(function(d) { return d.Gender;})
        .rollup(function(d) { 
          return {
            "count": d.length
          };
        }).entries(csv_data);
        $scope.segmentData = data;
        $scope.segmentData[2] = {key: 'all', values: { count: csv_data.length }};
        console.log($scope.segmentData);
        $scope.$apply();
    });
  }

  $scope.setDateRange = function(idx) {
    $scope.dateRange = $scope.dateRanges[idx];
    console.log("Set date range " + $scope.dateRange.name);
    console.log("From " + $scope.dateRange.after + " to " + $scope.dateRange.before);
    $scope.countSegments();
    $scope.reloadAll();
  }

  $scope.changeSegment = function(key) {
    $scope.selectedSegment = key;
    console.log("changed segment to " + $scope.selectedSegment);
    $scope.reloadAll();
  }

  $scope.reloadAll = function() {
    $scope.countActivity();
    $scope.countDevices();
  }

  $scope.setDateRange(0);
  $scope.countSegments();
  $scope.reloadAll();


}]);