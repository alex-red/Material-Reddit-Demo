(function() {
  var DisplayController, app, homeCtrl,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  app = angular.module('dash', ['ngAnimate', 'mgcrea.ngStrap', 'ui.router', 'ngSanitize', 'ngMaterial']);

  app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/index");
    return $stateProvider.state('main', {
      url: '/index',
      views: {
        'main': {
          templateUrl: 'partials/home.html',
          controller: homeCtrl
        }
      }
    });
  });

  app.filter('trusted', [
    '$sce', function($sce) {
      return function(url) {
        return $sce.trustAsResourceUrl(url);
      };
    }
  ]);

  homeCtrl = function($scope, $interval, $http, $mdDialog, $location, $anchorScroll) {
    var checkImgurAlbum, checkWEBM, debug, init, log, parseData, testData;
    log = function(str) {
      return console.log(str);
    };
    $scope.curPage = 1;
    $scope.test = "test";
    debug = true;
    $scope.log = function(t) {
      return console.log(t);
    };
    checkImgurAlbum = function(str) {
      if (str.match('imgur.com/a/')) {
        return true;
      } else {
        return false;
      }
    };
    checkWEBM = function(str) {
      if (str.match('gfycat')) {
        return true;
      }
      return false;
    };
    $scope.checkContent = function(str) {
      var fileEnding, fileEndingArray, fileEndingArray2, res_type;
      if (checkImgurAlbum(str)) {
        res_type = 'imgurAlbum';
      } else if (checkWEBM(str)) {
        res_type = 'WEBM';
      } else {
        fileEnding = str.split(".").pop();
        fileEndingArray = ['gif', 'jpg', 'png', 'jpeg'];
        fileEndingArray2 = ['gifv'];
        log(fileEnding);
        if (__indexOf.call(fileEndingArray, fileEnding) >= 0) {
          res_type = 'pic';
        } else if (__indexOf.call(fileEndingArray2, fileEnding) >= 0) {
          res_type = fileEndingArray2[0];
        } else {
          res_type = 'imgurPic';
        }
      }
      log("Type of Img : [" + res_type + "]");
      return res_type;
    };
    $scope.showDialog = function(ev, url) {
      return $mdDialog.show({
        controller: DisplayController,
        templateUrl: 'partials/image_dialog.html',
        targetEvent: ev,
        locals: {
          currentImg: url,
          contentType: $scope.checkContent(url)
        }
      });
    };
    testData = '';
    $scope.getRedditKeyDown = function(e) {
      if (e.keyCode === 13) {
        return $scope.getReddit($scope.inputSubreddit);
      }
    };
    parseData = function(d) {
      var dataList, err;
      try {
        dataList = d.data.children;
        $scope.srData = dataList;
      } catch (_error) {
        err = _error;
        console.log("Error: " + err);
      }
      return console.log(typeof dataList);
    };
    $scope.getReddit = function(sr) {
      var URL;
      $scope.curPage = 1;
      $scope.test = sr;
      URL = "http://www.reddit.com/r/" + sr + "/.json?count=25&jsonp=JSON_CALLBACK";
      console.log(URL);
      return $http.get(URL).success(function(d) {
        var data;
        data = d.substr(d.indexOf('(') + 1);
        data = data.substr(0, data.length - 1);
        data = JSON.parse(data);
        return parseData(data);
      }).error(function(e) {
        return console.log(e, 'error!');
      });
    };
    $scope.grabNext = function() {
      var URL, id, last, subreddit;
      last = $scope.srData[24];
      id = last.data.name;
      subreddit = $scope.inputSubreddit;
      URL = "http://www.reddit.com/r/" + subreddit + "/.json?count=25&after=" + id + "&jsonp=JSON_CALLBACK";
      $scope.srData = null;
      return $http.get(URL).success(function(d) {
        var data;
        data = d.substr(d.indexOf('(') + 1);
        data = data.substr(0, data.length - 1);
        data = JSON.parse(data);
        return parseData(data);
      }).error(function(e) {
        return console.log(e, 'error!');
      });
    };
    init = function() {};
    return init();
  };

  DisplayController = function($scope, $mdDialog, currentImg, contentType) {
    $scope.currentImg = currentImg;
    $scope.contentType = contentType;
    $scope.sanitizeImgurAlbum = function(str) {
      if (!str) {
        return;
      }
      return str.replace("http:", "") + "/embed";
    };
    $scope.sanitizeWEBM = function(str) {
      var ID;
      ID = str.slice(str.lastIndexOf('/') + 1);
      return "http://gfycat.com/ifr/" + ID;
    };
    return $scope.sanitizeImgur = function(str) {
      return "" + str + ".jpg";
    };
  };

}).call(this);
