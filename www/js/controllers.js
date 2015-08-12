/*

    RootScope variables
    $rootScope.userId       : userId returned by registration saved after validation ( add in login and reg-step2 )
    $rootScope.nickName     : used for greetings ( add in login and reg-step2 )

*/
angular.module('WalkWithMeApp.controllers', ['angularMoment'])

.controller('StartCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, userService, errorService) {

    $ionicLoading.show({ template: 'Loading...' });

    userService.ServerStats()
        .success(function(data) {
            
            if ( data.statusCode > 0 ){
                errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                return;
            }

            //Check if the user is already logged in
            if ( !$window.localStorage['userId'] ){
                    // Delay a little before loading the 
                    var loginTimer = setInterval( function(){
                    clearInterval(loginTimer);                    
                    $state.go('login');
                    },1000);
            }else{
                
                // Save to the rootScope can be used anywhere in the application
                //$rootScope.mobileNo = $window.localStorage['mobileNo'];
                $rootScope.userId = $window.localStorage['userId'];
                $rootScope.nickName = $window.localStorage['nickName'];    
                $state.go('menu');
            }
            
            $ionicLoading.hide();            
        }).error( function(data, status) {
            // htpp error
            //show error message and exit the application
            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
            return;
        });

})

.controller('LoginCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, userService, errorService) {

    //TODO : From where is the mobile number added ?
    var userId          = '';
    var mobileNumber    = $scope.loginData.mobileNumber;
    var nickName        = $scope.loginData.nickName;
        
    $scope.login = function(){
        
        $ionicLoading.show({ template: 'Loading...' });
        userService.LoginService(mobileNumber, username, password)
        .success(function(data) {

            if ( data.statusCode > 0 ){
                errorService.ShowError('The credentials you entered are incorrect. Please try again.');
                $state.go('login');
                return;
            }            
            
            // Save user Id information and nickName
            $window.localStorage['userId'] = data.userId;
            $window.localStorage['nickName'] = nickName;   

            // add to rootscope
            $rootScope.userId = $window.localStorage['userId'];
            $rootScope.nickName = $window.localStorage['nickName'];
            
            $ionicLoading.hide(); 
            $state.go('menu');
                                 
        })
        .error(function(data) {
            // htpp error
            //show error message and exit the application
            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
            return;
        });

    };
    
    $scope.register = function(){        
        $state.go('register-step1');
    }
})


.controller('RegisterCtrl', function($window, $scope, $ionicLoading, $state, $stateParams, userService, errorService) {
    console.log("RegisterCtrl:Init");
    var registrationData = [];
    registrationData.mobileNo = "";
    registrationData.nickName = "";
    registrationData.code = "";

    $scope.registrationData = registrationData;
    // show login ctrl
    $scope.sendCode = function(){
        // Register in the database        
        // Get the code and 
        var mobileNo = $scope.registrationData.mobileNo;
        var nickName = $scope.registrationData.nickName;
        
        console.log("Registration data: mobile no: "+$scope.registrationData.mobileNo);
        console.log("Registration data: nickname: "+$scope.registrationData.nickName);
        
        if ( !mobileNo || mobileNo == "" ){
            errorService.ShowError('Mobile no cannot be empty');
            return;
        }

        if ( isNaN(mobileNo) ){
            errorService.ShowError('Mobile no has to contain numbers');
            return;
        }
        if ( !nickName || nickName == "" ){
            errorService.ShowError('Nick name no cannot be empty');
            return;
        }
        if ( nickName.length < 4 ){
            errorService.ShowError('Nick name no cannot be less than 4 characters');
            return;
        }
        $ionicLoading.show({ template: 'Loading...' });

        userService.Register(mobileNo, nickName).success(function(data, status) {

            if ( data.statusCode > 0 ){
                errorService.ShowError('Sorry cannot register you at this time,Please try again later');
                return;
            }

            //alert(data.content.code);
            // Save info for the second step
            // TODO: Params not working yet
            $state.go('register-step2', { code: data.code, userId : data.userId, nickName: $scope.registrationData.nickName });    
            
            $ionicLoading.hide();            
        }).error( function(data, status) {
            // htpp error
            //show error message and exit the application
            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
            return;
        });
        
    }

    $scope.validate = function(){        
        //compair with the entered code
        if ( $scope.registrationData.code != $stateParams.code ){
            errorService.ShowError('Sorry invalid code, please try again');
            return;  
        }

        userId = $stateParams.userId;
        userService.Validate(userId).success(function(data, status) {

            if ( data.statusCode > 0 ){
                errorService.ShowError('Sorry cannot validate you at this time,Please try again later');
                return;
            }

                // Save user Id information and nickName
                $window.localStorage['userId'] = userId;
                $window.localStorage['nickName'] = $stateParams.nickName;                

            $state.go('menu');  
            
            $ionicLoading.hide();            
        }).error( function(data, status) {
            // htpp error
            //show error message and exit the application
            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
            return;
        });

       
    }
})

.controller('MenuCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, $interval, userService, errorService) {
    console.log("MenuCtrl:Init");
    //$ionicLoading.show({ template: 'Loading...' });
    // TODO : Remove Hard coding in live
    var mobileNumber = 713456781;
    var username = "Mandy Moore";
    
    // Call the menu update every 1 minute and update it
    $scope.reloadMenu = function(mobileNumber, username) {
        console.log("Reloading menu");
        userService.MenuService(mobileNumber, username)
            .success(function(data) {

                if (data.statusCode > 0) {
                    errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                    $state.go('start');
                    return;
                } else {

                    // Setting my next walk data
                    $scope.myNextWalk = data.nextWalk;
                    // Setting the walking invitiations
                    $scope.inviteWalk = data.invitations;
                    // Setting the walking history
                    $scope.historyWalk = data.walkHistory;

                    $scope.isStartWalking = true;   //TODO : Check date and time difference

                    $ionicLoading.hide();

                    $scope.range = function(n) {
                        return new Array(n);
                    };

                    $scope.isFirstTime = function() {
                        return data.statusCode;
                    };

                }

            })
            .error(function(data) {
                // htpp error
                //show error message and exit the application
                errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
            });
    }
        
    $scope.walkNow = function(){
        // Send the start command - if not started..start it now
        // Go to walk now state
    }
    
    
    /*
    menuReloadTicker = $interval( function(){        
        // hacked because dont know how to clear a interval when moving away from the current state.
        console.log("Menu:"+$state.current.name);
        if ( !$state.is('menu')){
            $interval.cancel(menuReloadTicker);
        }else{
            $scope.reloadMenu(mobileNumber, username);
        }
    }, 10000);
    */
    
    $scope.$on('$destroy', function () {
        console.log("MenuCtrl:destroy");        
    });
    
    //Load it first time
    //$scope.reloadMenu(mobileNumber, username);
    
})


.controller('WalkCtrl', function($scope,$ionicLoading, $state, $window, $rootScope, userService, errorService) {

    //Setting date
    $scope.date     = moment().format("DD"); 
    $scope.dateCopy = $scope.date;
    $scope.month    = moment().format("MMM"); 
    $scope.year     = moment().format("YY"); 
    $scope.calTitle = moment().format("MMM YYYY");
    $scope.weekOne  = [];
    $scope.weekTwo  = [];

    $scope.setThisWeek = function(){
        $scope.isFirstWeek = 1;
        $scope.selectedDate = null;
        $scope.dateCopy = $scope.date;
        for(var i=0;i<=6;i++){
            $scope.weekOne[i] = moment().weekday(i).format("DD");
        }
        
    }

    $scope.setNextWeek = function(){
        //$scope.dateCopy = null;
        $scope.selectedDate = null;
        $scope.isFirstWeek = 0;
        
        for(var i=7,j=0;i<=13,j<=6;i++,j++){
            $scope.weekTwo[j] = moment().weekday(i).format("DD");
        }

    }
    //Setting current week on the calender
    $scope.setThisWeek();

    //Calender click event
    $scope.selectDate = function(_index){

        $scope.selectedDate = _index;
        $scope.setClass(_index);
        
    }

    //function to set the class of the days
    $scope.setClass = function(_date){
       if($scope.selectedDate == _date)
            return "selected";
        if($scope.dateCopy == _date)
            return "today";
    }

    //Setting the time
    $scope.hour = 05;
    $scope.minutes = 30;
    $scope.am = "AM";
    $scope.increaseHour = function()
    {      
          $scope.increaseHour =  function () {
            if ($scope.hour == "12") {
                $scope.hour = 1;
            }
            else {
                $scope.hour = $scope.hour + 1;
            }
        }
    }

    $scope.increaseMinutes = function()
    {
        if($scope.minutes == "45")
        {
            $scope.minutes = "00";
        }
        else
        {
            $scope.minutes = parseInt($scope.minutes) + 15;
        }
        
    }

    $scope.change = function()
    {
        if($scope.am == "AM")
            $scope.am = "PM";
        else
            $scope.am = "AM";
        
    }

    $scope.onCreate = function(){
        $rootScope.walkDate = $scope.selectedDate + " " + $scope.month + " " + $scope.year;
        $rootScope.walkTime = $scope.hour + "." + $scope.minutes + " " + $scope.am;
        var mobileNumber = 713456781;
    var username = "Sachini Chathurika";
    var dateOfWalk ="2015-10-17 20:30:00";

         userService.CreateWalkService(mobileNumber, username, dateOfWalk)
                .success(function(data) {

                    if ( data.statusCode > 0 ){
                        errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                        $state.go('newWalk');
                        return;
                    }
            
                    else{

                        $rootScope.walkId = data.walkId;
                        console.log(data.walkId);
                          $state.go('invite');


                    }                       
                })

                .error(function(data) {
                 // htpp error
                //show error message and exit the application
                errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
                }); 

    }

    $scope.onSwipeRight = function(){
         $state.go('menu');
    }

       
    
})


.controller('WalkNowCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, $ionicModal, $interval, userService, errorService) {
    // WalkCtrl initialization
    console.log("WalkCtrl:Init");
    // Initialize the last played message Id / Dont play the same message again and again
    $scope.lastPlayedMessageId = 0;
    //Initialize the modal for walkies
    $ionicModal.fromTemplateUrl('templates/walkies.html', function($ionicModal) {
            $scope.modal = $ionicModal;
            }, {
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-up',
            focusFirstInput: true
            });

    // Set interval and get information from server
    // If exceeding the planned time "doneWalking"
    // Update the list of users and their walking states
    $scope.reloadWalkNow = function(){
        console.log("reload walk now" );
        userService.WalkNowService("905c5312-344d-11e5-9493-ec0ec40a1250")
            .success(function(data) {

                if ( data.statusCode > 0 ){
                    errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                    $state.go('menu');
                    return;
                }            
                
                $scope.walkId = data.walkId;
                $scope.participants = data.participants;
                $scope.lastMessage = data.lastMessage;              
                
            })
            .error(function(data, status) {
                // htpp error
                //show error message and exit the application            
                errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later:Error:'+status+','+data);
                $state.go('menu');
                return;
            }); 
    } // end reloadWalkNow

    // Done walking
    $scope.doneWalking = function(){        
        // Send the request to the server saying done
         $state.go('menu');
    }

    $scope.showWalkies = function(toId, toNickName){
        $scope.panelType = 0; 
        $scope.sendWalkiesTo = {};
        $scope.sendWalkiesTo.id = toId;
        $scope.sendWalkiesTo.nickName = toNickName;
        $scope.modal.show();        
    }

    $scope.showPicture = function(picId){
        $scope.panelType = 1; 
        $scope.picId = picId;       
        $scope.modal.show();        
    }

    $scope.sendWalkie = function(walkieId){
        $ionicLoading.show({ template: 'Loading...' });
        console.log("Sending walkie to "+$scope.sendWalkiesTo.nickName + ","+ $scope.sendWalkiesTo.id + ",walkieId:"+walkieId);
        userService.SendWalkieService($scope.sendWalkiesTo.id, walkieId)
        .success(function(data) {

            if ( data.statusCode > 0 ){
                errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');                
                return;
            }            
            
            $scope.lastMessage  = data.lastMessage;  
            $scope.playSound();
            $scope.modal.hide();
            $ionicLoading.hide();
        })
        .error(function(data, status) {
            // htpp error
            //show error message and exit the application            
            $scope.modal.hide();
            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');            
            return;
        }); 

    }

    $scope.showCamera = function(){
        
         navigator.camera.getPicture(function(imageURI) {
            
            //$scope.lastPhoto = imageURI;
            //$scope.modal.show();    
        
        // imageURI is the URL of the image that we can use for
        // an <img> element or backgroundImage.
            //alert("Done");
        }, function(err) {
            alert("Err"+err);
        }, { quality: 50,   targetWidth: 320, targetHeight: 320 });
    }

    $scope.playSound = function(){
        try{
            // TODO: play a sound
            if ( $scope.lastMessage ){//&& $scope.lastMessage.messageId != $scope.lastPlayedMessageId ){
                $scope.lastPlayedMessageId = $scope.lastMessage.messageId;
                var media = new Media("/android_asset/www/walkies/WALKIE_001.mp3",  null, function(e){ alert("err:"+JSON.stringify(e))}, mediaStatusCallback);
                media.play();        
            }
        }catch(e){
            console.log("error playing walkie:"+e);
        }
        
    }

    var mediaStatusCallback = function(status) {
        //$ionicLoading.show({ template: "media"+status, noBackdrop: true, duration: 1000 });        
    }

   
    //$scope.reloadWalkNow();
    /*
    walkNowReloadTicker = $interval( function(){        
        // hacked because dont know how to clear a interval when moving away from the current state.        
        console.log("WN:"+$state.current.name);
        if ( !$state.is('walkNow')){
            $interval.cancel(walkNowReloadTicker);
        }else{
            $scope.reloadWalkNow();
        }
    }, 10000)
    */
    // Clear the modal window
    $scope.$on('$destroy', function() {
        console.log("WalkNowCtrl:destroy");
        $scope.modal.remove();
    });
})

.controller('InviteCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, userService, errorService) {

    // TODO : Remove Hard coding in live
    var mobileNumber = 713456781;
    var username = "Mandy Moore";
        
    userService.InviteService(mobileNumber, username)
        .success(function(data) {

            if ( data.statusCode > 0 ){
                errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                $state.go('newWalk');
                return;
            }
            
            else{

                $scope.myInvities = data.users;
            }
                     
        })

        .error(function(data) {
            // htpp error
            //show error message and exit the application
            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
            return;
        }); 
  

})


.controller('HistoryCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, userService, errorService) {

    
    // TODO : Remove Hard coding in live
    var mobileNumber = 713456781;
    var username = "Mandy Moore";
        
    userService.HistoryService(mobileNumber, username)
        .success(function(data) {

            if ( data.statusCode > 0 ){
                errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                $state.go('menu');
                return;
            }
            
            else{
                $scope.secondMonth = moment().subtract(1, 'months').format("MMM");
                $scope.thirdMonth = moment().subtract(2, 'months').format("MMM");
                $scope.historyMonthOne = data.firstMonth;
                $scope.historyMonthTwo = data.secondMonth;
                $scope.historyMonthThree = data.thirdMonth;
    
                $scope.isFirstTime = function() {
                    return data.statusCode;
                };

                $scope.isInvited=function(n){
                    if(n=="Created"){return 1;}
                    else return 0;
     
                };

                $scope.isJoined=function(n){
                    if(n=="Joined"){return 1;}
                    else return 0;
     
                };

            }
                     
        })

        .error(function(data) {
            // htpp error
            //show error message and exit the application
            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
            return;
        });

})

.controller('JoinCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, userService, errorService) {

    var mobileNumber = 713456781;
    
    userService.DisplayInvitationService(mobileNumber)
        .success(function(data) {

            if ( data.statusCode > 0 ){
                errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                $state.go('menu');
                return;
            }
            
            else{
                $scope.invites = data.invitations;
    
                $scope.isFirstTime = function() {
                    return data.statusCode;
                };
        
                $scope.onSwipeLeft = function(){
                    $state.go('menu');
                };

                $scope.changeStatus = function(_walkId, _status){
                    
                    userService.JoinService(mobileNumber,_walkId,_status)
                        .success(function(data){

                            if ( data.statusCode > 0 ){
                                errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                                $state.go('join');
                                return;
                            }

                            else{
                                errorService.ShowError('Successfully Updated'); 
                            }
                        })
                };
            }    
    }) 
       
        .error(function(data) {
            // htpp error
            //show error message and exit the application
            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
            return;
        });

})

.controller('MotivationCtrl', function($scope,$ionicLoading, $state) {

    // show login ctrl
    $scope.onSwipeLeft = function(){
        
        $state.go('menu');
    }
})
;


