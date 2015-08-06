//TODO: Change the GET to a POST
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
      
      LoginService : function (mobileNumber, username, password){              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_LoginService,
                  data : {"mobileNumber" : mobileNumber , "username" : username, "password" : password}
              });
      },

      Register : function (){              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_Register
              });
      },
      MenuService : function (mobileNumber, username){              
              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_MenuService,
                  data : {"mobileNumber" : mobileNumber , "username" : username}
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

      WalkNowService : function (walkId){              
              return $http({
                  method : 'GET',
                  url: URLS.sURL_WalkNowService,
                  data : {"walkId" : walkId }
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


