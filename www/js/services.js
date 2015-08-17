//TODO: Change the GET to a GET
// User services - authentication / server stat / registration

angular.module('WalkWithMeApp.services',[]).factory('userService', function(URLS,$http, errorService){
   
    return {      

      // Sucessfull : {"statusCode":0,"statusDes":"ok"}
      // Error      : {"statusCode":Not zero,"statusDes":"ok"}      
      ServerStats : function (){        
       
              return $http({
                  method : 'GET',
                  url: URLS.sURL_ServerStats
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      }, // end function    
      
      LoginService : function (mobileNumber, nickName){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_LoginService,
                  data : {"mobileNumber" : mobileNumber , "nickName" : nickName}
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      Register : function (mobileNumber, nickName){      
              return $http({
                  method : 'POST',
                  url: URLS.sURL_Register,
                  data : {"mobileNumber" : mobileNumber , "nickName" : nickName}
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      Validate : function (userId){      
              return $http({
                  method : 'POST',
                  url: URLS.sURL_Validate,
                  data : {"userId" : userId}
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      MenuService : function (userId){              
              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_MenuService,
                  data : {"userId" : userId}
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      CreateWalkService : function (userId, dateOfWalk){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_CreateWalkService,
                  data : {"userId" : userId , "dateOfWalk" : dateOfWalk}
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },
      
      DeleteWalkService : function (walkId){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_DeleteWalkService,
                  data : {"walkId" : walkId }
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      InviteUserService : function (walkId, userId){              
              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_InviteUserService,
                  data : {"walkId": walkId, "userId" : userId }
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      InviteService : function (walkId, userId){              
              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_InviteService,
                  data : {"walkId": walkId, "userId" : userId }
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      HistoryService : function (userId){              
              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_HistoryService,
                  data : {"userId" : userId }
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      JoinService : function ( walkId, userId, status){              
              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_JoinService,
                  data : { "walkId" : walkId, "userId":userId, "status" : status}
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      DisplayInvitationService : function (userId){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_DisplayInvitationService,
                  data : {"userId" : userId }
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      WalkNowService : function (walkId, userId){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_WalkNowService,
                  data : {"walkId" : walkId, "userId": userId}
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      WalkNowUpdateStatus : function (walkId, userId, statTime, status){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_WalkNowUpdateStatus,
                  data : {"walkId" : walkId , "userId" : userId, "time" : statTime, "status": status}
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      },

      SendWalkieService : function (walkId, fromId, toId, walkieId){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_SendWalkieService,
                  data : { "walkId": walkId, "fromId": fromId, "toId": toId, "walkieId" : walkieId}
              }).error(function(data){
                errorService.showError('Server appeared to be offline or in maintainance(HTTP), Please try again later');
                return;
              });
      }
      // end function

    }; // end return     
})

// Show error service
.factory('errorService', function($ionicLoading){
    return {      
      showError : function (msgHtml){              
      	$ionicLoading.show({ template: "<div class='error'><div><span>"+msgHtml+"</span></div></div>", noBackdrop: true, duration: 2000 });
      } // end function
    }; // end return     
})


.factory('loadService', function($ionicLoading){
    return {      
      show : function (){              
        $ionicLoading.show({ template: "<div class='animation'><div><span>Loading</span></div></div>" });
      }, // end function
      hide : function (){        
        $ionicLoading.hide();
      } // end function
    }; // end return         
})

