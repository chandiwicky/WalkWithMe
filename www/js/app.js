// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('WalkWithMeApp', ['ionic', 'WalkWithMeApp.controllers', 'WalkWithMeApp.services', 'ui.router', 'angularMoment'])

.run(function($ionicPlatform, $state) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
    // Start application here
    $state.go('start');
})

.constant('URLS', {      
    sURL_ServerStats: 'http://www.embla.no/jm_json/serverStat.json',
    sURL_LoginService: 'http://www.embla.no/jm_json/login.json',
    sURL_Register: 'http://www.embla.no/jm_json/register.json',
    sURL_MenuService: 'http://www.embla.no/jm_json/menu.json',
    sURL_InviteService: 'http://www.embla.no/jm_json/invite.json',    
    sURL_HistoryService: 'http://www.embla.no/jm_json/history.json',
    sURL_WalkNowService: 'http://www.embla.no/jm_json/walkNow.json'
})

/*
.constant('URLS', {      
    sURL_ServerStats: '/json/serverStat.json',
    sURL_LoginService: '/json/login.json',
    sURL_Register: '/json/register.json',
    sURL_MenuService: '/json/menu.json',
    sURL_InviteService: '/json/invite.json',    
    sURL_HistoryService: '/json/history.json',
    sURL_WalkNowService: '/json/walkNow.json'
})

.constant('URLS', {      
    sURL_ServerStats: 'http://localhost/WalkWithMe/php/index.php/WalkController/serverStat',
    sURL_LoginService: 'http://localhost/WalkWithMe/php/index.php/WalkController/loginUser',
    sURL_Register: '/json/register.json',
    sURL_MenuService: 'http://localhost/WalkWithMe/php/index.php/WalkController/loadMenu',
    sURL_InviteService: 'http://localhost/WalkWithMe/php/index.php/WalkController/loadUser',    
    sURL_HistoryService: 'http://localhost/WalkWithMe/php/index.php/WalkController/getHistory',
    sURL_WalkNowService: '/json/walkNow.json'
})
*/
// Create configuration parameter for
.constant('angularMomentConfig', {
    
    timezone: 'Asia/Colombo' // optional
})

.config(function($stateProvider, $urlRouterProvider) {

    // State transition setup
    $stateProvider        
        // Starting state // Application startup
        .state('start', {
            url: "/start",
            templateUrl: "templates/start.html",
            controller: 'StartCtrl'
        })

        .state('login', {
            url: "/login",
            templateUrl: "templates/login.html",
            controller: 'LoginCtrl'
        })

        .state('register-step1', {
            url: "/register-step1",
            templateUrl: "templates/registerStep1.html",
            controller: 'RegisterCtrl'
        })

        .state('register-step2', {
            url: "/register-step2",
            templateUrl: "templates/registerStep2.html",
            controller: 'RegisterCtrl'
        })

        .state('menu', {
            url: "/menu",
            templateUrl: "templates/menu.html",
            controller: 'MenuCtrl'
        })
        
        .state('newWalk', {
            url: "/newWalk",
            templateUrl: "templates/newWalk.html",
            controller: 'WalkCtrl'
        })

        .state('walkNow', {
            url: "/walkNow",
            templateUrl: "templates/walkNow.html",
            controller: 'WalkNowCtrl'
        })

        .state('join', {
            url: "/join",
            templateUrl: "templates/join.html",
            controller: 'JoinCtrl'
        })

        .state('history', {
            url: "/history",
            templateUrl: "templates/history.html",
            controller: 'HistoryCtrl'
        })

         .state('motivation', {
            url: "/motivation",
            templateUrl: "templates/motivation.html",
            controller: 'MotivationCtrl'
        })

        .state('invite', {
            url: "/invite",
            templateUrl: "templates/invite.html",
            controller: 'InviteCtrl'
        })
});