/*

    RootScope variables
    $rootScope.userId       : userId returned by registration saved after validation ( add in login and reg-step2 )
    $rootScope.nickName     : used for greetings ( add in login and reg-step2 )
    
*/
angular.module('WalkWithMeApp.controllers', ['angularMoment'])

/*

    Application startup controller 

*/
.controller('StartCtrl', function($window, $rootScope, $scope, $state, $interval, userService, errorService, loadService) {

    loadService.show({ template: 'Loading...' });    
    userService.ServerStats()
        .success(function(data) {
            
            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.showError('Server appeared to be offline or in maintainance, Please try again later');
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
                
                console.log(" start state :"+$state.current.name );
                if ( $state.current.name === 'firstTime' ){
                    return;
                }
                
                // Go to motivation first
                $state.go('motivation');
            }
            
            loadService.hide();            
        });
})

/*

    Application Login controller 

*/
.controller('LoginCtrl', function($window, $rootScope, $scope, $state, userService, errorService, loadService) {

    //TODO : From where is the mobile number added ?
    $scope.loginData = {};
    $scope.loginData.mobileNumber = '';
    $scope.loginData.nickName = '';
        
    $scope.login = function(){
        
            var mobileNo = $scope.loginData.mobileNumber;
            var nickName = $scope.loginData.nickName;

            // TODO: Repeated in registration also
            if ( !mobileNo || mobileNo == "" ){
                errorService.showError('Mobile no cannot be empty');
                return;
            }

            if ( isNaN(mobileNo) ){
                errorService.showError('Mobile no has to contain numbers');
                return;
            }
            if ( !nickName || nickName == "" ){
                errorService.showError('Nick name no cannot be empty');
                return;
            }
            if ( nickName.length < 4 ){
                errorService.showError('Nick name no cannot be less than 4 characters');
                return;
            }

        loadService.show({ template: 'Loading...' });
        
        userService.LoginService(mobileNo , nickName)        
        .success(function(data) {
            
            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.showError('The credentials you entered are incorrect. Please try again.');
                $state.go('login');
                return;
            }            
            
            // Check if halfway registered
            if ( data.verificationCode != "DONE" ){
                $state.go('register-step2', {userId:data.userId, code:data.verificationCode } );
                loadService.hide();
                return;
            }

            // Save user Id information and nickName
            $window.localStorage['userId'] = data.userId;
            $window.localStorage['nickName'] = $scope.loginData.nickName;   

            // add to rootscope
            $rootScope.userId = $window.localStorage['userId'];
            $rootScope.nickName = $window.localStorage['nickName'];
            
            loadService.hide(); 
            $state.go('menu');
                                 
        });

    };
    
    $scope.register = function(){        
        $state.go('register-step1');
    }
})

/*

    Application registration controller

*/
.controller('RegisterCtrl', function($window, $rootScope, $scope, $state, $stateParams, userService, errorService, loadService) {
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
            errorService.showError('Mobile no cannot be empty');
            return;
        }

        if ( isNaN(mobileNo) ){
            errorService.showError('Mobile no has to contain numbers');
            return;
        }
        if ( mobileNo.length < 9 ){
            errorService.showError('Mobile number needs to be 9 digits');
            return;
        }
        if ( !nickName || nickName == "" ){
            errorService.showError('Nick name no cannot be empty');
            return;
        }
        if ( nickName.length < 4 ){
            errorService.showError('Nick name no cannot be less than 4 characters');
            return;
        }

        loadService.show({ template: 'Loading...' });
        userService.Register(mobileNo, nickName).success(function(data, status) {

            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.showError('Sorry cannot register you at this time,Please try again later');
                return;
            }

            //alert(data.content.code);
            // Save info for the second step
            // TODO: Params not working yet
            loadService.hide();
            $state.go('register-step2', { code: data.code, userId : data.userId, nickName: $scope.registrationData.nickName });                            
        });
        
    }

    $scope.validate = function(){        
        //compair with the entered code
        if ( $scope.registrationData.code != $stateParams.code ){
            errorService.showError('Sorry invalid code, please try again');
            return;  
        }

        userId = $stateParams.userId;
        userService.Validate(userId).success(function(data, status) {

            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.showError('Sorry cannot validate you at this time,Please try again later');
                return;
            }

                // Save user Id information and nickName
                $window.localStorage['userId'] = data.user.id;
                $window.localStorage['nickName'] = data.user.nickName;                
            
            $rootScope.userId = userId;            
            $rootScope.nickName = data.user.nickName;
            $state.go('firstTime');  
            
            loadService.hide();            
        });
       
    }
})

/*

    Application Menu controller 

*/
.controller('MenuCtrl', function($window, $rootScope, $scope, $state, $interval, userService, errorService, loadService) {
    console.log("MenuCtrl:Init");
    
    $scope.myNextWalk = {};
    $scope.myNextWalk.date ='';
    $scope.myNextWalk.time ='';
    
    $scope.myInvitations = [];

    // Call the menu update every 1 minute and update it
    var userId = $rootScope.userId;    
    $scope.reloadMenu = function(userId) {
        
        console.log("Refresh menu");   
        //loadService.show();     
        userService.MenuService(userId)
            .success(function(data) {

                if (!angular.isDefined(data.statusCode) || data.statusCode > 0) {
                    errorService.showError('Server appeared to be offline or in maintainance, Please try again later');
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

                //loadService.hide();

                $scope.isNextWalk = function() {
                    return !angular.equals($scope.myNextWalk, {});
                };
                
                loadService.hide();

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

    $scope.createWalk = function(){
        // Show invite if its only my walk            
          $state.go('newWalk');      
    }  

    $scope.join = function(){
        // Show invite if its only my walk         
          $state.transitionTo('join', null , { location: true, inherit: true, notify: true, reload : true} );   
          //$state.go('join');      
    }    
    // 
    $scope.startWalk = function(walkId){

        var userId      = $rootScope.userId;      
        
        console.log("Start walk:"+walkId);
         
        loadService.show();
        userService.WalkNowUpdateStatus(walkId, userId, moment().format("YYYY-MM-DD hh:mm a"), 10 )
                .success(function(data) {
                    if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                        errorService.showError('Server appeared to be offline or in maintainance, Please try again later');                        
                        return;
                    }                               
                    
                    loadService.hide();
                    $state.go('walkNow', { "walkId":data.walkId } );                    
                }); 
    }

    // Define the ticker if not already defined
        // Clear the previous interval if defined and create a new one
    

    $scope.menuTicker = $interval( 
        function(){
            console.log("Menu:Tick !");
            $scope.reloadMenu(userId);            
        }, 
    10000);
    
     // Clear the modal window
    $scope.$on('$destroy', function() {
        console.log("MenuCtrl:destroy");
        $interval.cancel($scope.menuTicker);
    });


    // Do it the first time
    $scope.reloadMenu(userId);    
})

/*

    Application Walk controller 

*/
.controller('WalkCtrl', function($scope, $state, $window, $rootScope, userService, errorService, loadService) {

    //Setting date
    $scope.date     = moment().format("DD"); 
    $scope.month    = moment().format("MMM"); 
    $scope.year     = moment().format("YY"); 
    $scope.calTitle = moment().format("MMM YYYY");

    $scope.weekCurrent  = [];
    $scope.weekOne  = [];
    $scope.weekTwo  = [];
    
    //Setting the time
    $scope.hour     = 05;
    $scope.minutes  = 30;
    $scope.am       = "AM";

    // 2015.08.12 : Get the date in one variable
    $scope.walkDate = moment().format("YYYY-MM-DD") + " " + $scope.hour + ":"+ $scope.minutes + " " + $scope.am;
    $scope.selectedDay = moment().format("DD");

    // Get status in parallel
    //loadService.Show();
    userService.DisplayInvitationService($rootScope.userId)
        .success(function(data) {

            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.showError('Server appeared to be offline or in maintainance, Please try again later');
                $state.go('menu');
                return;
            }
            
            $scope.invites = data.invitations;

            for(var x=0; x< $scope.weekOne.length; x++){
                for(var y=0; y< $scope.invites.length; y++){
                    if ( $scope.weekOne[x].day == moment($scope.invites[y].dateOfWalk).format("DD") ){                        
                        $scope.weekOne[x].isInUse = true;                        
                    }
                    if ( $scope.weekTwo[x].day == moment($scope.invites[y].dateOfWalk).format("DD") ){                        
                        $scope.weekTwo[x].isInUse = true;                        
                    }
                }
            }
            
            //Setting current week on the calender
            $scope.setThisWeek();
            //$scope.selectDate({day:moment().format("DD"), isInUse: false});
            loadService.hide();
        });

  
    
    // Todays day
    var nowDay = moment().format("DD");

    var weekOne  = [];
    var weekTwo  = [];

    for(var i=0;i<=6;i++){
        
        var firstWeekDay = moment().weekday(i).format("DD");
        var secondWeekDay = moment().weekday(i+7).format("DD");

        weekOne[i] = { day:firstWeekDay, isInUse : false, isToday : firstWeekDay === nowDay , isPast : firstWeekDay < nowDay };
        weekTwo[i] = { day:secondWeekDay, isInUse : false,  isToday : secondWeekDay === nowDay , isPast : secondWeekDay < nowDay };
    }
    
    $scope.weekOne = weekOne;
    $scope.weekTwo = weekTwo;

    $scope.setThisWeek = function(){
        $scope.isFirstWeek      = true;        
        $scope.weekCurrent      = $scope.weekOne;        
    }

    $scope.setNextWeek = function(){                
        $scope.isFirstWeek = false;
        $scope.weekCurrent = $scope.weekTwo;    
    }


    //Calender click event
    $scope.selectDate = function(dayInfo){

        if ( dayInfo.isInUse ){
            errorService.showError('Opps ! already booked , try another day!');
            return;
        }

        if ( dayInfo.isPast ){            
            return;
        }

        $scope.selectedDay = dayInfo.day;
        $scope.setClass(dayInfo.day, dayInfo.isInUse, dayInfo);
        // 2015.08.12 : Get the date in one variable

        $scope.walkDate = moment().format("YYYY-MM-") +$scope.selectedDay+ " " + $scope.hour + ":"+ $scope.minutes + " " + $scope.am;
        console.log("Selected date " + $scope.walkDate );
    }

    

    //function to set the class of the days
    $scope.setClass = function(day, isInUse, dayInfo){
        
        if ( dayInfo.isInUse ) return "isInUse";
        // can select todays day so return selected first before today
        if($scope.selectedDay == day) return "selected";
        if ( dayInfo.isToday ) return "today";
    }


    $scope.increaseHour = function()
    {      
          
        if ($scope.hour == "12") {
            $scope.hour = 1;
        } else {
           $scope.hour = $scope.hour + 1;
        }
        
        $scope.walkDate = moment().format("YYYY-MM-") +$scope.selectedDay+ " " + $scope.hour + ":"+ $scope.minutes + " " + $scope.am;
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
        $scope.walkDate = moment().format("YYYY-MM-") +$scope.selectedDay+ " " + $scope.hour + ":"+ $scope.minutes + " " + $scope.am;
    }

    $scope.change = function()
    {
        if($scope.am == "AM")
            $scope.am = "PM";
        else
            $scope.am = "AM";
        $scope.walkDate = moment().format("YYYY-MM-") +$scope.selectedDay+ " " + $scope.hour + ":"+ $scope.minutes + " " + $scope.am;
    }

    

    $scope.createWalk = function(){
        
        var userId      = $rootScope.userId;        
        var dateOfWalk  = moment($scope.walkDate).format('YYYY-MM-DD HH:mm:ss');

        console.log("Create new walk:"+dateOfWalk);
         
        loadService.show();
        userService.CreateWalkService(userId, dateOfWalk)
                .success(function(data) {
                    if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                        errorService.showError('Server appeared to be offline or in maintainance, Please try again later');                        
                        return;
                    }                               

                    $rootScope.walkId = data.walkId;
                    console.log("Create new walk-Ok,walkId="+data.walkId);
                    loadService.hide();
                    $state.go('invite', { "walkId":data.walkId, "walkDate": $scope.walkDate } );                    
                }); 
    }


    
    $scope.onSwipeRight = function(){
         $state.go('menu');
    }      

})

/*

    Application Walk Now controller 

*/
.controller('WalkNowCtrl', function($window, $rootScope, $scope, $state, $stateParams, $ionicModal, $interval, $timeout, URLS, userService, errorService, loadService) {
    // WalkCtrl initialization
    console.log("WalkCtrl:Init");
    // Initialize the last played message Id / Dont play the same message again and again
    $scope.lastPlayedMessageId = 0;
    $scope.walkId   = $stateParams.walkId;
    var walkId      = $stateParams.walkId;
    $scope.aniStyle = {};

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

                if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                    errorService.showError('Server appeared to be offline or in maintainance, Please try again later');
                    $state.go('menu');
                    return;
                }            
                
                $scope.walkId = data.walkId;
                $scope.participants = data.participants;
                $scope.lastMessage = data.lastMessage;              
                $scope.playSound();
            })
            .error(function(data, status) {
                $state.go('menu');
                return;
            }); 
    } // end reloadWalkNow

    // Done walking
    $scope.doneWalking = function(){        
        // Send the request to the server saying done
         $state.go('menu');
    }

    $scope.showWalkies = function(toId, toNickName, status){
        if ( status != 10 ) return;
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
        loadService.show({ template: 'Loading...' });
        console.log("Sending walkie to "+$scope.sendWalkiesTo.nickName + ","+ $scope.sendWalkiesTo.id + ",walkieId:"+walkieId);

        var userId = $rootScope.userId;
        userService.SendWalkieService($stateParams.walkId, userId, $scope.sendWalkiesTo.id, walkieId)
        .success(function(data) {

            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.showError('Server appeared to be offline or in maintainance, Please try again later');                
                return;
            }                        
            /*
            $scope.lastMessage  = data.lastMessage;  
            $scope.playSound();
            $scope.modal.hide();
            */
            $scope.modal.hide();
            loadService.hide();
        })
        .error(function(data, status) {
            // htpp error
            //show error message and exit the application            
            $scope.modal.hide();            
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

                // Play animation
                //animation-name: messageAnimation;
                //$scope.aniStyle =  {'-webkit-animation-name': 'messageAnimation'};
                //$timeout( function(){ $scope.aniStyle ={} }, 10000);

                var media = new Media("/android_asset/www/walkies/WALKIE_001.mp3",  null, function(e){ alert("err:"+JSON.stringify(e))}, mediaStatusCallback);
                media.play();        
            }
        }catch(e){
            console.log("error playing walkie:"+e);
        }
        
    }

    var mediaStatusCallback = function(status) {
        
    }

    $scope.endWalk = function(){

        var userId      = $rootScope.userId;      
        var walkId      = $stateParams.walkId;

        console.log("End walk:"+walkId);
        
        loadService.show();
        userService.WalkNowUpdateStatus(walkId, userId, moment().format("YYYY-MM-DD hh:mm a"), 11 )
                .success(function(data) {
                    if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                        errorService.showError('Server appeared to be offline or in maintainance, Please try again later');                        
                        return;
                    }                               
                    
                    loadService.hide();
                    $state.go('menu');                    
                }); 
    }

    // Clear the modal window
    $scope.$on('$destroy', function() {
        console.log("WalkNowCtrl:destroy");
        $interval.cancel($scope.walkNowTicker);
        $scope.modal.remove();
    });

    $scope.walkNowTicker = $interval( 
        function(){            
            console.log("Walk:Tick !");
            $scope.reloadWalkNow(walkId);            
        }, 
    10000);
    

    $scope.reloadWalkNow(walkId);
    
})

/*

    Application Invite controller 

*/
.controller('InviteCtrl', function($window, $rootScope, $scope, $state, $stateParams, userService, errorService, loadService) {
    
    
    console.log("InviteCtrl:Init");

    var userId      = $rootScope.userId;
    $scope.walkDate = moment($stateParams.walkDate).format("ddd D, MMM YYYY");
    $scope.walkTime = moment($stateParams.walkDate).format("hh:mm a");
    $scope.walkId   = $stateParams.walkId;

    //For testing
    //$scope.walkId   = '7079BFAC-9C56-2808-E346-0B11060701F8';
    //userId  = 'CAB410D4-4A7F-B68B-ACA7-9123BD537E77';

    $scope.listUsers = function(){
        loadService.show();
        userService.InviteUserService($scope.walkId, userId)
            .success(function(data) {

                if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                    errorService.showError('Server appeared to be offline or in maintainance, Please try again later');
                    $state.go('menu');
                    return;
                }
                
                loadService.hide();
                $scope.myInvities = data.users;                    
            });
    }

    $scope.invite = function(participantId){
        loadService.show();
        
        userService.InviteService($scope.walkId, participantId)
            .success(function(data) {

                if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                    errorService.showError('Server appeared to be offline or in maintainance, Please try again later');
                    return;
                }                
                $scope.listUsers();
            });
    }

    $scope.getClass = function(status){
        console.log("status : " + status);
        if ( status == null ) return 'invite';
        if ( status == 0 ) return 'invited';
        if ( status == 1 ) return 'accepted';
        if ( status == 2 ) return 'maybe';
        if ( status == 3 ) return 'declined';        
    }

    $scope.deleteWalk = function(){
        
        console.log("Delete walk:"+$scope.walkId); 
        var userId      = $rootScope.userId;

        loadService.show();
        userService.DeleteWalkService($scope.walkId)
                .success(function(data) {
                    if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                        errorService.showError('Server appeared to be offline or in maintainance, Please try again later');                        
                        return;
                    }                               
                    
                    errorService.showError('Walk deleted');                    
                    $state.go('menu');                    
                });
    }

    $scope.listUsers();
})

/*

    Application History controller 

*/
.controller('HistoryCtrl', function($window, $rootScope, $scope, $state, userService, errorService, loadService) {

    console.log("HistoryCtrl:Init");
    var userId      = $rootScope.userId;
    
    loadService.show();
    userService.HistoryService(userId)
        .success(function(data) {

            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.showError('Server appeared to be offline or in maintainance, Please try again later');
                $state.go('menu');
                return;
            }
            
            $scope.secondMonth      = moment().subtract(1, 'months').format("MMM");
            $scope.thirdMonth       = moment().subtract(2, 'months').format("MMM");
            $scope.historyMonthOne  = data.firstMonth;
            $scope.historyMonthTwo  = data.secondMonth;
            $scope.historyMonthThree = data.thirdMonth;
    
            loadService.hide();
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
                     
        });

})

/*

    Application Join walk controller 

*/
.controller('JoinCtrl', function($window, $rootScope, $scope, $state, userService, errorService, loadService) {
    
    $scope.invites = {};
    var userId      = $rootScope.userId;

    loadService.show();
    userService.DisplayInvitationService(userId)
        .success(function(data) {

            if ( !angular.isDefined(data.statusCode) || data.statusCode > 0 ){
                errorService.showError('Server appeared to be offline or in maintainance, Please try again later');
                $state.go('menu');
                return;
            }
                        
            $scope.invites = data.invitations;
            loadService.hide();
            
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
                                errorService.showError('Server appeared to be offline or in maintainance, Please try again later');
                                $state.go('join');
                                return;
                            }
                            $state.go('menu');
                            errorService.showError('Updated!');
                            loadService.hide();
                        });
            };
                
        });

    $scope.showWalk = function(walkId, userId, walkDate){
        // Show invite if its only my walk
        if ( userId == $rootScope.userId ){            
            $state.transitionTo('invite', { 'walkId':walkId , 'walkDate': walkDate }, { location: true, inherit: false, relative: null, notify: true } );
        }        
    }   
})

/*

    Application Motivational screen controller : TODO

*/
.controller('MotivationCtrl', function($scope, $state, loadService) {

    // show login ctrl
    $scope.onSwipeLeft = function(){
        
        $state.go('menu');
    }
})
;


