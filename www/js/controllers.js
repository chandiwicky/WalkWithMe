/*

    RootScope variables
    $rootScope.userId       : userId returned by registration saved after validation ( add in login and reg-step2 )
    $rootScope.nickName     : used for greetings ( add in login and reg-step2 )
    
    $rootScope.menuTicker
    $rootScope.isMenuRefresh

    $rootScope.isWalkRefresh
    $rootScope.walkNowTicker
*/
angular.module('WalkWithMeApp.controllers', ['angularMoment'])

.controller('StartCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, $interval, userService, errorService) {

    $ionicLoading.show({ template: 'Loading...' });
    
    $rootScope.isMenuRefresh = true;
    $rootScope.isWalkRefresh = true;

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

    $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams){
            //console.log(event +","+ toState + "," + toParams +  "," + fromState + "," + fromParams);
            // TODO: scope.destroy not working using the state change since its working
            if ( fromState.name === "menu" ){
                // Stop the timer
                $rootScope.isMenuRefresh = false;
            }

            if ( toState.name === "menu" ){
                // Start the timer
                $rootScope.isMenuRefresh = true;
            }

            if ( fromState.name === "walkNow" ){
                // Stop the timer
                $rootScope.isWalkRefresh = false;
            }

            if ( toState.name === "walkNow" ){
                // Start the timer
                $rootScope.isWalkRefresh = true;
            }
            // transitionTo() promise will be rejected with
            // a 'transition prevented' error
        })

})

.controller('LoginCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, userService, errorService) {

    //TODO : From where is the mobile number added ?
    $scope.loginData = {};
    $scope.loginData.mobileNumber = '';
    $scope.loginData.nickName = '';
        
    $scope.login = function(){
        
         var mobileNo = $scope.loginData.mobileNumber;
            var nickName = $scope.loginData.nickName;

            // TODO: Repeated in registration also
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
        
        userService.LoginService(mobileNo , nickName)        
        .success(function(data) {
            
            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.ShowError('The credentials you entered are incorrect. Please try again.');
                $state.go('login');
                return;
            }            
            
            // Save user Id information and nickName
            $window.localStorage['userId'] = data.userId;
            $window.localStorage['nickName'] = $scope.loginData.nickName;   

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


.controller('RegisterCtrl', function($window, $rootScope, $scope, $ionicLoading, $state, $stateParams, userService, errorService) {
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
            
            $rootScope.userId = userId;
            $state.go('firstTime');  
            
            $ionicLoading.hide();            
        }).error( function(data, status) {
            // htpp error
            //show error message and exit the application
            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
            return;
        });
       
    }
})

.controller('MenuCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, $interval, userService, errorService, loadService) {
    console.log("MenuCtrl:Init");
    
    $scope.myNextWalk = {};
    $scope.myNextWalk.date ='';
    $scope.myNextWalk.time ='';
    
    $scope.myInvitations = [];

    // Call the menu update every 1 minute and update it
    var userId = $rootScope.userId;    
    $scope.reloadMenu = function(userId) {
        
        console.log("Refresh menu");   
        //loadService.Show();     
        userService.MenuService(userId)
            .success(function(data) {

                if (!angular.isDefined(data.statusCode) || data.statusCode > 0) {
                    errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                    $state.go('start');
                    return;
                }

                // Setting my next walk data
                $scope.myNextWalk = {};
                if ( angular.isDefined(data.nextWalk.dateOfWalk) ){
                    $scope.myNextWalk.date = moment(data.nextWalk.dateOfWalk).format("ddd D, MMM YYYY");
                    $scope.myNextWalk.time = moment(data.nextWalk.dateOfWalk).format("hh:mm a");
                    $scope.myNextWalk.walkDate = data.nextWalk.dateOfWalk;
                    $scope.myNextWalk.participants = data.nextWalk.participants;
                    $scope.myNextWalk.walkId = data.nextWalk.walkId;
                    $scope.myNextWalk.status = parseInt(data.nextWalk.status);
                    $scope.myNextWalk.userId = data.nextWalk.userId;
                }
                // Setting the walking invitiations
                $scope.myInvitations = data.invitations;
                // Setting the walking history
                $scope.historyWalk = data.walkHistory;

                $scope.isStartWalking = true;   //TODO : Check date and time difference

                //loadService.Hide();

                $scope.range = function(n) {
                    return new Array(n);
                };

                $scope.isNextWalk = function() {
                    return !angular.equals($scope.myNextWalk, {});
                };
                
                loadService.Hide();

            })
            .error(function(data) {
                // htpp error
                //show error message and exit the application
                errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
            });
    }
        
    // Change walk status
    $scope.showWalk = function(){
        // Show invite if its only my walk
        if ( $scope.myNextWalk.status < 10 && $scope.myNextWalk.userId == $rootScope.userId ){
            //invite({ 'walkId':myNextWalk.walkId , 'walkDate': myNextWalk.walkDate })
            $state.go('invite', { 'walkId':$scope.myNextWalk.walkId , 'walkDate': $scope.myNextWalk.walkDate } );
        }        
    }    
    // 
    $scope.startWalk = function(walkId){

        var userId      = $rootScope.userId;      
        
        console.log("Start walk:"+walkId);
        //$ionicLoading.show({ template: '<div class="animation"><div><span>Loading</span></div></div>' });  
        loadService.Show();
        userService.WalkNowUpdateStatus(walkId, userId, moment().format("YYYY-MM-DD hh:mm a"), 10 )
                .success(function(data) {
                    if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                        errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');                        
                        return;
                    }                               
                    
                    loadService.Hide();
                    $state.go('walkNow', { "walkId":data.walkId } );                    
                })
                .error(function(data) {
                    errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                    return;
                }); 
    }

    // Define the ticker if not already defined
        // Clear the previous interval if defined and create a new one
    if ( angular.isDefined($rootScope.menuTicker) ){
        $interval.cancel($rootScope.menuTicker);
    }

    $rootScope.menuTicker = $interval( 
        function(){
            console.log("Menu:Tick = isRef : "+ $rootScope.isMenuRefresh);        
            // hacked because dont know how to clear a interval when moving away from the current state.
            if ( $rootScope.isMenuRefresh ){
                console.log("Menu:Tick !");
                $scope.reloadMenu(userId);
            }
        }, 
    10000);
    
    // Do it the first time
    $scope.reloadMenu(userId);    
})


.controller('WalkCtrl', function($scope,$ionicLoading, $state, $window, $rootScope, userService, errorService, loadService) {

    //Setting date
    $scope.date     = moment().format("DD"); 
    $scope.dateCopy = $scope.date;
    $scope.month    = moment().format("MMM"); 
    $scope.year     = moment().format("YY"); 
    $scope.calTitle = moment().format("MMM YYYY");
    $scope.weekOne  = [];
    $scope.weekTwo  = [];
    // 2015.08.12 : Get the date in one variable
    $scope.walkDate = moment().format("YYYY-MM-DD") + " " + $scope.hour + ":"+ $scope.minutes + " " + $scope.am;

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
        // 2015.08.12 : Get the date in one variable

        $scope.walkDate = moment().format("YYYY-MM-") +$scope.selectedDate+ " " + $scope.hour + ":"+ $scope.minutes + " " + $scope.am;
        console.log("Selected date " + $scope.walkDate );
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
    $scope.am = "am";
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
        $scope.walkDate = moment().format("YYYY-MM-") +$scope.selectedDate+ " " + $scope.hour + ":"+ $scope.minutes + " " + $scope.am;
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
        $scope.walkDate = moment().format("YYYY-MM-") +$scope.selectedDate+ " " + $scope.hour + ":"+ $scope.minutes + " " + $scope.am;
    }

    $scope.change = function()
    {
        if($scope.am == "am")
            $scope.am = "pm";
        else
            $scope.am = "pm";
        $scope.walkDate = moment().format("YYYY-MM-") +$scope.selectedDate+ " " + $scope.hour + ":"+ $scope.minutes + " " + $scope.am;
    }

    $scope.createWalk = function(){
        
        var userId      = $rootScope.userId;        
        var dateOfWalk  = moment($scope.walkDate).format('YYYY-MM-DD HH:mm:ss');

        console.log("Create new walk:"+dateOfWalk);
        //$ionicLoading.show({ template: '<div class="animation"><div><span>Loading</span></div></div>' });  
        loadService.Show();
        userService.CreateWalkService(userId, dateOfWalk)
                .success(function(data) {
                    if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                        errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');                        
                        return;
                    }                               

                    $rootScope.walkId = data.walkId;
                    console.log("Create new walk-Ok,walkId="+data.walkId);
                    loadService.Hide();
                    $state.go('invite', { "walkId":data.walkId, "walkDate": $scope.walkDate } );                    
                })
                .error(function(data) {
                    errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                    return;
                }); 
    }

    

    $scope.onSwipeRight = function(){
         $state.go('menu');
    }      
    
})


.controller('WalkNowCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, $stateParams, $ionicModal, $interval, URLS, userService, errorService, loadService) {
    // WalkCtrl initialization
    console.log("WalkCtrl:Init");
    // Initialize the last played message Id / Dont play the same message again and again
    $scope.lastPlayedMessageId = 0;
    $scope.walkId   = $stateParams.walkId;
    var walkId      = $stateParams.walkId;
    console.log(">>>>>>>>>>>>>"+walkId);
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
    $scope.reloadWalkNow = function(wId){
        
        var userId = $rootScope.userId;        
        console.log("reload walk now : " + wId );
        userService.WalkNowService(wId, userId)
            .success(function(data) {

                if ( data.statusCode > 0 ){
                    errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                    $state.go('menu');
                    return;
                }            
                
                $scope.walkId = data.walkId;
                $scope.participants = data.participants;
                $scope.lastMessage = data.lastMessage;              
                $scope.playSound();
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

        var userId = $rootScope.userId;
        userService.SendWalkieService($stateParams.walkId, userId, $scope.sendWalkiesTo.id, walkieId)
        .success(function(data) {

            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');                
                return;
            }                        
            /*
            $scope.lastMessage  = data.lastMessage;  
            $scope.playSound();
            $scope.modal.hide();
            */
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
            
            console.log( ">>>>> Image url >>>> "+imageURI );


            var options = new FileUploadOptions();
                options.fileKey     = "file";
                options.fileName    = imageURI.substr(imageURI.lastIndexOf('/')+1);
                options.mimeType    = "image/jpeg";
                    var params = {};
                    params.walkId = $stateParams.walkId; // some other POST fields
                    params.fromId = $rootScope.userId;
                    params.toId   = 'All';                    
                options.params = params;


                var ft = new FileTransfer();
                ft.upload(imageURI, encodeURI(URLS.sURL_UploadService), uploadSuccess, uploadError, options);
                function uploadSuccess(r) {
                        console.log("Code = " + r.responseCode);
                        console.log("Response = " + r.response);
                        console.log("Sent = " + r.bytesSent);
                }
                
                function uploadError(error) {
                    console.log("upload error source " + error.source);
                    console.log("upload error target " + error.target);
                }
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
            console.log( $scope.lastMessage.id + "," + $scope.lastPlayedMessageId );
            if ( $scope.lastMessage && $scope.lastMessage.id != $scope.lastPlayedMessageId ){
                $scope.lastPlayedMessageId = $scope.lastMessage.id;
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

    $scope.endWalk = function(){

        var userId      = $rootScope.userId;      
        var walkId      = $stateParams.walkId;

        console.log("End walk:"+walkId);
        //$ionicLoading.show({ template: '<div class="animation"><div><span>Loading</span></div></div>' });  
        loadService.Show();
        userService.WalkNowUpdateStatus(walkId, userId, moment().format("YYYY-MM-DD hh:mm a"), 11 )
                .success(function(data) {
                    if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                        errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');                        
                        return;
                    }                               
                    
                    loadService.Hide();
                    $state.go('menu');                    
                })
                .error(function(data) {
                    errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                    return;
                }); 
    }

    // Clear the modal window
    $scope.$on('$destroy', function() {
        console.log("WalkNowCtrl:destroy");
        $scope.modal.remove();
    });

    // Clear the previous interval if defined and create a new one
    if ( angular.isDefined($rootScope.walkNowTicker) ){
        $interval.cancel($rootScope.walkNowTicker);
    }

    $rootScope.walkNowTicker = $interval( 
        function(){
            console.log("Walk:Tick = isRef : "+ $rootScope.isWalkRefresh);        
            // hacked because dont know how to clear a interval when moving away from the current state.
            if ( $rootScope.isWalkRefresh ){
                console.log("Walk:Tick !");
                $scope.reloadWalkNow(walkId);
            }
        }, 
    10000);
    

    $scope.reloadWalkNow(walkId);
    
})

.controller('InviteCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, $stateParams, userService, errorService, loadService) {
    
    
    console.log("InviteCtrl:Init");

    var userId      = $rootScope.userId;
    $scope.walkDate = moment($stateParams.walkDate).format("ddd D, MMM YYYY");
    $scope.walkTime = moment($stateParams.walkDate).format("hh:mm a");
    $scope.walkId   = $stateParams.walkId;

    //For testing
    //$scope.walkId   = '7079BFAC-9C56-2808-E346-0B11060701F8';
    //userId  = 'CAB410D4-4A7F-B68B-ACA7-9123BD537E77';

    $scope.listUsers = function(){
        loadService.Show();
        userService.InviteUserService($scope.walkId, userId)
            .success(function(data) {

                if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                    errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                    $state.go('menu');
                    return;
                }
                
                loadService.Hide();
                $scope.myInvities = data.users;                    
            })
            .error(function(data) {
                // htpp error
                //show error message and exit the application
                errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
            });
    }

    $scope.invite = function(participantId){
        loadService.Show();
        
        userService.InviteService($scope.walkId, participantId)
            .success(function(data) {

                if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                    errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                    return;
                }                
                $scope.listUsers();
            })
            .error(function(data) {
                errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
            });
    }
    $scope.listUsers();
})


.controller('HistoryCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, userService, errorService, loadService) {

    console.log("HistoryCtrl:Init");
    var userId      = $rootScope.userId;
    
    loadService.Show();
    userService.HistoryService(userId)
        .success(function(data) {

            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                $state.go('menu');
                return;
            }
            
            $scope.secondMonth      = moment().subtract(1, 'months').format("MMM");
            $scope.thirdMonth       = moment().subtract(2, 'months').format("MMM");
            $scope.historyMonthOne  = data.firstMonth;
            $scope.historyMonthTwo  = data.secondMonth;
            $scope.historyMonthThree = data.thirdMonth;
    
            loadService.Hide();
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
                     
        })

        .error(function(data) {
            // htpp error
            //show error message and exit the application
            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
            return;
        });

})

.controller('JoinCtrl', function($window, $rootScope, $scope,$ionicLoading, $state, userService, errorService, loadService) {

    
    var userId      = $rootScope.userId;
    loadService.Show();
    userService.DisplayInvitationService(userId)
        .success(function(data) {

            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                $state.go('menu');
                return;
            }
            
            
            $scope.invites = data.invitations;
            loadService.Hide();
            
            $scope.isFirstTime = function() {
                return data.statusCode;
            };
        
            $scope.onSwipeLeft = function(){
                $state.go('menu');
            };

            $scope.changeStatus = function(walkId, status){

                    var userId      = $rootScope.userId;
                    userService.JoinService(walkId, userId, status)
                        .success(function(data){
                            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                                errorService.ShowError('Server appeared to be offline or in maintainance, Please try again later');
                                $state.go('join');
                                return;
                            }
                            $state.go('menu');
                            errorService.ShowError('Updated!');
                            loadService.Hide();
                        })
                        .error(function(data) {
                            // htpp error
                            //show error message and exit the application
                            errorService.ShowError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                            return;
                        });
            };
                
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


