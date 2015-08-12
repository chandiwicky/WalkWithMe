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

      MenuService : function (mobileNumber, username){              
              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_MenuService,
                  data : {"mobileNumber" : mobileNumber , "username" : username}
        });
      },

      CreateWalkService : function (mobileNumber, username, dateOfWalk){              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_CreateWalkService,
                  data : {"mobileNumber" : mobileNumber , "username" : username, "dateOfWalk" : dateOfWalk}
              });
      },
      
      InviteService : function (mobileNumber, username){              
              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_InviteService,
                  data : {"mobileNumber" : mobileNumber , "username" : username}
        });
      },

      HistoryService : function (mobileNumber, username){              
              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_HistoryService,
                  data : {"mobileNumber" : mobileNumber , "username" : username}
        });
      },

      JoinService : function (mobileNumber, walkId, status){              
              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_JoinService,
                  data : {"mobileNumber" : mobileNumber , "walkId" : walkId , "status" : status}
        });
      },

      DisplayInvitationService : function (mobileNumber){              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_DisplayInvitationService,
                  data : {"mobileNumber" : mobileNumber }
              });
      },

      WalkNowService : function (walkId){              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_WalkNowService,
                  data : {"walkId" : walkId}
              });
      },


      SendStartTimeService : function (walkId){              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_WalkNowStartTimeService,
                  data : {"walkId" : walkId , "participantId" : participantId, "startTime" : startTime}
              });
      },

      SendEndTimeService : function (walkId){              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_WalkNowEndTimeService,
                  data : {"walkId" : walkId "participantId" : participantId, "endTime" : endTime}
              });
      },

      getJoinedUsersService : function (walkId){              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_JoinedUsersService,
                  data : {"walkId" : walkId}
              });
      },


      SendWalkieService : function (toId, walkieId){              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_SendWalkieService,
                  data : {"to":toId, "walkieId" : walkieId}
              });
      }
      // end function

    }; // end return     
})

// Show error service
.factory('errorService', function($ionicLoading){
    return {      
      ShowError : function (msgHtml){              
      	$ionicLoading.show({ template: msgHtml, noBackdrop: true, duration: 2000 });
      } // end function
    }; // end return     
})


