<?php
defined('BASEPATH') OR exit('No direct script access allowed');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: *");


/*

	0 	: Pending
	1   : Accepted
	2 	: Maybe
	3   : Decline
	10  : Walking
	11  : Completed
	12  : Completed-Forced

*/
class WalkController extends CI_Controller {

	public function index()
	{
		
	}

	public function serverStat()
	{
		$status = array('statusCode' => 0 , 'statusDesc' => "Server Running" );
		print_r(json_encode($status));		
	}

	/*
	*	Register the user and issue a validation code
	*/
	public function register()
	{
		try {
			// JSON object data
			$data 			= json_decode(file_get_contents("php://input"),TRUE);
			// Bypass get the post data
			$data 			= $_POST;
			$mobileNumber 	= (double) $data['mobileNumber'];
			$nickName 		= $data['nickName'];		
			$verificationCode = rand(100,900); 
			$userId 		= trim($this->getGUID(),'{}');

			//TODO: log entries
			// Save user	
			// TODO; how to put try catch statements
			$retVal = $this->User->create($userId, $mobileNumber, $nickName, $verificationCode);

			$registerRes = array('statusCode' => 0 , 'statusDesc' => "Ok", 'code' => $verificationCode, 'userId' => $userId );
			print_r(json_encode($registerRes));				
		}catch(Exception $e){
			log_message('error', "register-err:".$e->getMessage());
			$errorRes = array('statusCode' => 100 , 'statusDesc' => "Err-Register:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}
	}

	/*
	*	Validate and complete the registration - Error code : 110+
	*/
	public function validate()
	{
		try {
			// JSON object data
			$data 			= json_decode(file_get_contents("php://input"),TRUE);
			// Bypass get the post data
			$data 			= $_POST;
			$userId 		= $data['userId'];
			
			$this->User->validate($userId);

			$registerRes = array('statusCode' => 0 , 'statusDesc' => "Ok" );
			print_r(json_encode($registerRes));	
		}catch(Exception $e){
			log_message('error', "validate-err:".$e->getMessage());
			$errorRes = array('statusCode' => 101 , 'statusDesc' => "Err-Validate:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}	
	}

	/*
	*	login user; verify mobile no and nickname and return the userId - Error code : 120+
	*/
	public function loginUser()
	{
		try {
			$data = json_decode(file_get_contents("php://input"),TRUE);
			// Bypass get the post data
			$data 			= $_POST;

			$mobileNumber 	= (double) $data['mobileNumber'];
			$nickName 		= $data['nickName'];
			
			//Get the userId for the relevant mobile number
			$userId = $this->User->login($mobileNumber, $nickName);
				
			if($userId != -1)
				$status = array('statusCode' => 0 , 'statusDesc' => "Validated", 'userId' => $userId );
			else
				$status = array('statusCode' => 300 , 'statusDesc' => "Invalid Credentials" );

			print_r(json_encode($status));

		}catch(Exception $e){
			log_message('error', "login-err:".$e->getMessage());
			$errorRes = array('statusCode' => 301 , 'statusDesc' => "Err-Validate:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}
	}

	/*
	*	 Load menu - next walk /invitations/history- Error code : 130+
	*/
	public function loadMenu()
	{
		try{
			$data = json_decode(file_get_contents("php://input"),TRUE);
			// Bypass get the post data
			$data 			= $_POST;
			$userId 		= $data['userId'];
			
			$resultSet = array();
			$resultWalkInvitations = array();
			//Extracting the walking invitations			
			$resultWalkInvitations = $this->Walk->getInvitations($userId);

			//Extracting next walk details
			$nextFirstWalk = array();
			$nextWalk = $this->Walk->getNextWalk($userId);

	    	if(count($nextWalk) > 0)
	      	{
	      		$nextFirstWalk 	= $nextWalk[0];
	            $walkId 		= $nextFirstWalk->walkId;
	            $nextFirstWalk->participants = $this->Walk->getParticipants($walkId, $userId);
	            //$participants 	= $this->Walk->getParticipants($walkId, $userId);	               
	            //array_merge(array($nextFirstWalk) , array("participants" => $participants) );
	        }

			
	    	//Extracting the walking history	    	
	    	$walkHistory = array();
	    	$walkHistory = $this->Walk->getHistoryOfWalks($userId);
	        
	    	//merging the result array
	    	$resultSet = array_merge(array("statusCode" => 0, "nextWalk" => $nextFirstWalk), array("invitations" => $resultWalkInvitations), array("walkHistory" => $walkHistory));
	    	print_r(json_encode($resultSet));
	    }catch(Exception $e){
			log_message('error', "Menu-err:".$e->getMessage());
			$errorRes = array('statusCode' => 301 , 'statusDesc' => "Err-Menu:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}
	}

	// Error code : 140+
	public function getHistory()
	{
		try{
			$data = json_decode(file_get_contents("php://input"),TRUE);
			$data 		= $_POST;
			$userId 	= $data['userId'];
			
			//Extracting the walking history
			$monthZero 	= $this->Walk->getWalksOfMonth($userId, 0);
			$monthOne 	= $this->Walk->getWalksOfMonth($userId, 1);
			$monthTwo 	= $this->Walk->getWalksOfMonth($userId, 2);

			$walkHistory = array_merge(array("firstMonth" => $monthZero),array("secondMonth" => $monthOne),array("thirdMonth" => $monthTwo));
			
			if($walkHistory)
				$resultSet = array_merge(array("statusCode" => (int)0000), $walkHistory);
			else
				$resultSet = array("statusCode" => (int)140);
			
	    	print_r(json_encode($resultSet));
	    }catch(Exception $e){
			log_message('error', "History-err:".$e->getMessage());
			$errorRes = array('statusCode' => 141 , 'statusDesc' => "History-Menu:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}
	}

	/*
	*	 Load users for invite : Error code : 150+
	*/
	public function loadUser()
	{
		try {
			$data = json_decode(file_get_contents("php://input"),TRUE);
			//By pass
			$data 			= $_POST;
			$userId = $data['userId'];
			$walkId = $data['walkId'];
			$resultSet = array();
				
	    	//Extracting the walkwithmeusers
	    	$users = $this->User->getUsers($walkId,$userId);
	        
	    	//merging the result array
	    	$resultSet = array_merge(array("statusCode" => (int)0000),array("users" =>$users ));
	    	print_r(json_encode($resultSet));
	    }catch(Exception $e){
			log_message('error', "loadusers-err:".$e->getMessage());
			$errorRes = array('statusCode' => 150 , 'statusDesc' => "Err-loadusers:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}

	}

/*
	*	 Load users for invite : Error code : 150+
	*/
	public function invite()
	{
		try {
			$data = json_decode(file_get_contents("php://input"),TRUE);
			//By pass
			$data 			= $_POST;
			$inviteId 		= trim($this->getGUID(),'{}');					
			$walkId 		= $data['walkId'];
			$participantId	= $data['userId'];
			$resultSet 		= array();
				
	    	//Extracting the walkwithmeusers
	    	$users = $this->Walk->inviteWalk($inviteId,$walkId,$participantId,0);
	        
	    	//merging the result array
	    	$resultSet = array('statusCode' => 0 , 'statusDesc' => "Ok" );
	    	print_r(json_encode($resultSet));
	    }catch(Exception $e){
			log_message('error', "invite-err:".$e->getMessage());
			$errorRes = array('statusCode' => 150 , 'statusDesc' => "Err-invite:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}

	}

	// Error code : 160+
	public function getInvitations()
	{
		try {
			$data = json_decode(file_get_contents("php://input"),TRUE);
			//By pass
			$data 			= $_POST;
			$userId 		= $data['userId'];

			$resultWalkInvitations = array();
			$resultWalkInvitations = $this->Walk->getInvitations($userId);
			
	    	if(count($resultWalkInvitations) > 0)
	      	{
	      		foreach ($resultWalkInvitations as $row)
            	{	      			
	            	$walkId 		= $row->walkId;
	            	$row->participants = $this->Walk->getParticipants($walkId, $userId);
	            }	           
	        }
        	print_r(json_encode(array("statusCode" => (int)0000, "invitations" => $resultWalkInvitations)));
    	 }catch(Exception $e){
			log_message('error', "getInvites-err:".$e->getMessage());
			$errorRes = array('statusCode' => 160 , 'statusDesc' => "Err-getInvites:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}	
        
	}
	
	// Error code : 170+
	public function updateInvitation()
	{
		try {
			$data = json_decode(file_get_contents("php://input"),TRUE);
			//By pass
			$data 		= $_POST;
			$userId 	= $data['userId'];
			$walkId 	= $data['walkId'];
			$status 	= $data['status'];
			
	    	//Updating the walk status
	    	$result = $this->Walk->updateThisInvitation($userId, $walkId, $status);
	    	if($result == 0)
	    		print_r(json_encode(array("statusCode" => 0)));
        }catch(Exception $e){
			log_message('error', "updateInvitation-err:".$e->getMessage());
			$errorRes = array('statusCode' => 160 , 'statusDesc' => "Err-updateInvitation:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}	
	}

	/*
	*	Register the user and issue a validation code // Error code : 180+
	*/	
	public function createWalk()
	{
		try {
			// JSON object data
			$data 			= json_decode(file_get_contents("php://input"),TRUE);
			// Bypass POST
			$walkId 		= trim($this->getGUID(),'{}');
			$inviteId 		= trim($this->getGUID(),'{}');
			$data 			= $_POST;
			$userId 		= $data['userId'];
			$dateOfWalk		= $data['dateOfWalk'];			
			$endOfWalkDt	= new DateTime($dateOfWalk);
			$startOfWalk	= $endOfWalkDt->format('Y-m-d h:i:s a');
			$endOfWalkDt->modify("+1 hours");
			$endOfWalk 		= $endOfWalkDt->format('Y-m-d h:i:s a');

			$resultSet 		= array();

			//save a walk & get WalkId
			$this->Walk->saveWalk($walkId,$userId,$startOfWalk,$endOfWalk,$inviteId);

			$resultSet = array("statusCode" => 0 , "walkId" =>$walkId );
	    	print_r(json_encode($resultSet));
		}catch(Exception $e){
			log_message('error', "createWalk-err:".$e->getMessage());
			$errorRes = array('statusCode' => 180 , 'statusDesc' => "Err-Register:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}
	}

	
	public function setStartWalk()
	{
		try{

		$data          = json_decode(file_get_contents("php://input"),TRUE);
		$walkId        = $data['walkId'];
		$participantId = $data['participantId'];
		$startTime     = $data['startTime'];

		$this->walkNow->updateStartUser($startTime,$walkId,$participantId);
		}

		catch(Exception $e){
		log_message('error', "validate-err:".$e->getMessage());
		$errorRes = array('statusCode' => 200 , 'statusDesc' => "Err-Validate:".$e->getMessage() );
		print_r(json_encode($errorRes));
		}
	}


	public function setEndWalk()
	{
		try{

		$data          = json_decode(file_get_contents("php://input"),TRUE);
		$walkId        = $data['walkId'];
		$participantId = $data['participantId'];
		$endTime       = $data['endTime'];

		$this->walkNow->updateEndUser($endTime,$walkId,$participantId);
			}

		catch(Exception $e){
		log_message('error', "validate-err:".$e->getMessage());
		$errorRes = array('statusCode' => 200 , 'statusDesc' => "Err-Validate:".$e->getMessage() );
		print_r(json_encode($errorRes));
		}
	}


	public function getJoinedUsers()
	{
		try {
			// JSON object data
			$data 			= json_decode(file_get_contents("php://input"),TRUE);
			// Bypass get the post data
			$walkId 		= $data['walkId'];
			
			$WalkingUsers=$this->WalkNow->getWalkingUsers($WalkId);

			$registerRes = array_merge(array("statusCode" => (int)0000),array("participants" =>$WalkingUsers )); 
			print_r(json_encode($registerRes));	
		}catch(Exception $e){
			log_message('error', "validate-err:".$e->getMessage());
			$errorRes = array('statusCode' => 101 , 'statusDesc' => "Err-Validate:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}	
	}


	/** 
	* Utility functions area
	*/
	public function getGUID(){
	    if (function_exists('com_create_guid')){
	        return com_create_guid();
	    }else{
	        mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
	        $charid = strtoupper(md5(uniqid(rand(), true)));
	        $hyphen = chr(45);// "-"
	        $uuid = chr(123)// "{"
	            .substr($charid, 0, 8).$hyphen
	            .substr($charid, 8, 4).$hyphen
	            .substr($charid,12, 4).$hyphen
	            .substr($charid,16, 4).$hyphen
	            .substr($charid,20,12)
	            .chr(125);// "}"
	        return $uuid;
	    }
	}
	/*
	//Function to get the details of the current walk
	public function walkingNow()
	{
		$data = json_decode(file_get_contents("php://input"),TRUE);
		$walkId = "290c8997-34c5-11e5-9493-ec0ec40a1250"; //$data['walkId'];
		$myMobileNumber = 713456781;

		$walkEnd = $this->Walk->getWalkEndTime($walkId);
		$participants = $this->Walk->getParticipants ($walkId, $myMobileNumber);
		$lastMessage = $this->Walk->getLastMessage($walkId);
		print_r(json_encode(array('statusCode' => 0000 , 'statusDesc' => "OK" , 'walkId' => $walkId, 'endTime' => $walkEnd, 'participants' => $participants, "lastMessage" => $lastMessage)));
        
	}*/

	public function testWalkies()
	{

        $walkId = "0244469F-7CD6-8E32-31FB-ADA274EF4242";
        $sender = "0232f355-aed7-4567-8754-7184d631125a";
        $receiver = "0132f355-aed7-4567-8754-7184d631125a";
        $walkie = "WALKIE_001";

		/*
        $lastMessage = $this->Message->getLastMessage($walkId,$receiver);
        if($lastMessage->messageTo == "All"){
        	$lastMessage->messageTo = getWalkingUsers($walkId); Getting the participants
        }
        print_r(json_encode($lastMessage)); */

        //Creating a new GUID
        $id = trim(com_create_guid(), '{}');
        $walkie = $this->Message->sendWalkie($id,$walkId, $sender, $receiver, $walkie);
        print_r(json_encode($walkie));

	}

}
