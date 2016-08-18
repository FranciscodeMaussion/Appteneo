// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'controllers', 'services','ngCordova', 'ngCordovaOauth', 'ionic-toast', 'ionic-timepicker', 'ionic-datepicker'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('welcome', {
    url: '/welcome',
    templateUrl: "views/welcome.html",
    controller: 'WelcomeCtrl'
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "views/sidemenu.html",
    controller: 'AppCtrl'
  })

  .state('app.create', {
    url: "/create",
    views: {
      'menuContent': {
        templateUrl: "views/create.html",
        controller: 'CreateCtrl',
      }
    }
  })

  .state('app.events', {
    url: "/events",
    views: {
      'menuContent': {
        templateUrl: "views/events.html",
        controller: 'EventsCtrl',
      }
    }
  })
/*  .state('app.news', {
    url: "/news",
    views: {
      'menuContent': {
        templateUrl: "views/news.html",
        controller: 'NewsCtrl',
      }
    }
  })*/

  .state('app.blog', {
    url: "/blog",
    views: {
      'menuContent': {
        templateUrl: "views/blog.html",
        controller: 'BlogCtrl',
      }
    }
  })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/blog');
})
