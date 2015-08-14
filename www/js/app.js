// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('WalkWithMeApp', ['ionic', 'WalkWithMeApp.controllers', 'WalkWithMeApp.services', 'ui.router', 'angularMoment'])

.run(function($ionicPlatform, $state, $ionicLoading, $rootScope) {
    // For back button counter
    $rootScope.backButtonClickCount = 0;
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

    // Disable back button and exit on the second press    
    $ionicPlatform.registerBackButtonAction(function (event) {
        
         event.preventDefault();

         $rootScope.backButtonClickCount++;
         if ( $rootScope.backButtonClickCount == 1){
            $ionicLoading.show({ template: "Press back again to exit app", noBackdrop: true, duration: 1000 });
            var backCountTimer = setInterval( function(){
                    clearInterval(backCountTimer);                    
                        $rootScope.backButtonClickCount=0;
                    },10000);
         }
         if ( $rootScope.backButtonClickCount == 2){
            navigator.app.exitApp();    
         }
    }, 100);
    // Start application here
    $state.go('start');
})
/*
.constant('URLS', {      
    sURL_ServerStats: 'http://www.embla.no/jm_json/serverStat.json',
    sURL_LoginService: 'http://www.embla.no/jm_json/login.json',
    sURL_Register: 'http://www.embla.no/jm_json/register.json',
    sURL_MenuService: 'http://www.embla.no/jm_json/menu.json',
    sURL_InviteService: 'http://www.embla.no/jm_json/invite.json',    
    sURL_HistoryService: 'http://www.embla.no/jm_json/history.json',
    sURL_WalkNowService: 'http://www.embla.no/jm_json/walkNow.json',
    sURL_SendWalkieService : 'http://www.embla.no/jm_json/sendWalkie.json'
})
*/
// juztMov server

.constant('URLS', {      
    sURL_Register: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/register',
    sURL_Validate: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/validate',
    sURL_ServerStats: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/serverStat',
    sURL_LoginService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/loginUser',    
    sURL_MenuService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/loadMenu',
    sURL_InviteUserService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/loadUser',  
    sURL_InviteService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/invite',  
    sURL_CreateWalkService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/createWalk', //added Service latest 
    sURL_HistoryService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/getHistory',
    sURL_WalkNowUpdateStatus:'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/updateWalkStatus',
    sURL_WalkNowService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/walkStats',
    sURL_SendWalkieService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/sendWalkie',
    sURL_DisplayInvitationService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/getInvitations',
    sURL_JoinService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/updateInvitation',
    sURL_UploadService: 'http://dev.juztmove.com/dev/walkwithme/index.php/WalkController/sendPicture'
})


/*
.constant('URLS', {      
    sURL_ServerStats: '/json/serverStat.json',
    sURL_LoginService: '/json/login.json',
    sURL_Register: '/json/register.json',
    sURL_MenuService: '/json/menu.json',
    sURL_InviteService: '/json/invite.json',    
    sURL_HistoryService: '/json/history.json',
    sURL_WalkNowService: '/json/walkNow.json',
    sURL_SendWalkieService : 'http://www.embla.no/jm_json/walkNow.json'
})
*/
/*
.constant('URLS', {      
    sURL_ServerStats: 'http://localhost/WalkWithMe/php/index.php/WalkController/serverStat',
    sURL_LoginService: 'http://localhost/WalkWithMe/php/index.php/WalkController/loginUser',
    sURL_Register: '/json/register.json',
    sURL_MenuService: 'http://localhost/WalkWithMe/php/index.php/WalkController/loadMenu',
    sURL_InviteService: 'http://localhost/WalkWithMe/php/index.php/WalkController/loadUser',  
    sURL_CreateWalkService: 'http://localhost/WalkWithMe/php/index.php/WalkController/createWalk', //added Service latest 
    sURL_HistoryService: 'http://localhost/WalkWithMe/php/index.php/WalkController/getHistory',
    sURL_WalkNowService: 'http://localhost/WalkWithMe/php/index.php/WalkController/walkingNow',
    sURL_SendWalkieService: 'http://www.embla.no/jm_json/walkNow.json',
    sURL_DisplayInvitationService: 'http://localhost/WalkWithMe/php/index.php/WalkController/getInvitations',
    sURL_JoinService: 'http://localhost/WalkWithMe/php/index.php/WalkController/updateInvitation'

})
*/

// Create configuration parameter for
.constant('angularMomentConfig', {
    
    timezone: 'Asia/Colombo' // optional
})
//FIX to avoid browser request method goes to "OPTIONS"

.config(['$httpProvider', function ($httpProvider) {
  // Intercept POST requests, convert to standard form encoding
  $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
  //$httpProvider.defaults.headers.post["Content-Type"] = "application/json";
  
  $httpProvider.defaults.transformRequest.unshift(function (data, headersGetter) {
    var key, result = [];

    if (typeof data === "string")
      return data;

    for (key in data) {
        if (data.hasOwnProperty(key)){
            console.log(key+":"+data[key]);
            result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
        }
    }
    return result.join("&");
  });

}])

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
            url: "/register-step2/:code/:userId/:nickName",
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
            url: "/walkNow/:walkId",
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
            url: "/invite/:walkDate/:walkId",
            templateUrl: "templates/invite.html",
            controller: 'InviteCtrl'
        })
})

.filter('moment', function() {
    return function(dateString, format) {
        return moment(dateString).format(format);
    };
});