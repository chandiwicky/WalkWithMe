//TODO: Change the GET to a GET
// User services - authentication / server stat / registration

angular.module('WalkWithMeApp.services',[]).factory('userService', function(URLS,$http){
   
    return {      

      // Sucessfull : {"statusCode":0,"statusDes":"ok"}
      // Error      : {"statusCode":Not zero,"statusDes":"ok"}      
      ServerStats : function (){        
       
              return $http({
                  method : 'GET',
                  url: URLS.sURL_ServerStats
              });
      }, // end function    
      
      LoginService : function (mobileNumber, nickName){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_LoginService,
                  data : {"mobileNumber" : mobileNumber , "nickName" : nickName}
              });
      },

      Register : function (mobileNumber, nickName){      
              return $http({
                  method : 'POST',
                  url: URLS.sURL_Register,
                  data : {"mobileNumber" : mobileNumber , "nickName" : nickName}
              });
      },

      Validate : function (userId){      
              return $http({
                  method : 'POST',
                  url: URLS.sURL_Validate,
                  data : {"userId" : userId}
              });
      },

      MenuService : function (userId){              
              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_MenuService,
                  data : {"userId" : userId}
        });
      },

      CreateWalkService : function (userId, dateOfWalk){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_CreateWalkService,
                  data : {"userId" : userId , "dateOfWalk" : dateOfWalk}
              });
      },
      
      DeleteWalkService : function (walkId){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_DeleteWalkService,
                  data : {"walkId" : walkId }
              });
      },

      InviteUserService : function (walkId, userId){              
              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_InviteUserService,
                  data : {"walkId": walkId, "userId" : userId }
        });
      },

      InviteService : function (walkId, userId){              
              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_InviteService,
                  data : {"walkId": walkId, "userId" : userId }
        });
      },

      HistoryService : function (userId){              
              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_HistoryService,
                  data : {"userId" : userId }
        });
      },

      JoinService : function ( walkId, userId, status){              
              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_JoinService,
                  data : { "walkId" : walkId, "userId":userId, "status" : status}
        });
      },

      DisplayInvitationService : function (userId){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_DisplayInvitationService,
                  data : {"userId" : userId }
              });
      },

      WalkNowService : function (walkId, userId){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_WalkNowService,
                  data : {"walkId" : walkId, "userId": userId}
              });
      },

      WalkNowUpdateStatus : function (walkId, userId, statTime, status){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_WalkNowUpdateStatus,
                  data : {"walkId" : walkId , "userId" : userId, "time" : statTime, "status": status}
              });
      },

      SendWalkieService : function (walkId, fromId, toId, walkieId){              
              return $http({
                  method : 'POST',
                  url: URLS.sURL_SendWalkieService,
                  data : { "walkId": walkId, "fromId": fromId, "toId": toId, "walkieId" : walkieId}
              });
      }
      // end function

    }; // end return     
})

// Show error service
.factory('errorService', function($ionicLoading){
    return {      
      ShowError : function (msgHtml){              
      	$ionicLoading.show({ template: "<div class='error'><div><span>"+msgHtml+"</span></div></div>", noBackdrop: true, duration: 2000 });
      } // end function
    }; // end return     
})


.factory('loadService', function($ionicLoading){
    return {      
      Show : function (){              
        $ionicLoading.show({ template: "<div class='animation'><div><span>Loading</span></div></div>" });
      }, // end function
      Hide : function (){        
        $ionicLoading.hide();
      } // end function
    }; // end return         
})

