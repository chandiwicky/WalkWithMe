<?php
defined('BASEPATH') OR exit('No direct script access allowed');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: *");

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
			$this->User->create($userId, $mobileNumber, $nickName, $verificationCode);

			$registerRes = array('statusCode' => 0 , 'statusDesc' => "Ok", 'code' => $verificationCode, 'userId' => $userId );
			print_r(json_encode($registerRes));	
		}catch(Exception $e){
			log_message('error', "register-err:".$e->getMessage());
			$errorRes = array('statusCode' => 100 , 'statusDesc' => "Err-Register:".$e->getMessage() );
			print_r(json_encode($errorRes));	
		}
	}

	/*
	*	Validate and complete the registration
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

	public function loginUser()
	{
		$data = json_decode(file_get_contents("php://input"),TRUE);
		$mobileNumber = (int) $data['mobileNumber'];
		$username = $data['username'];
		$password = $data['password'];

		//Get the userId for the relevant mobile number
		$userId = $this->User->getUserId($mobileNumber);
			
		if($userId)
			$result = $this->User->login($userId,$password);
		if($result)
			$status = array('statusCode' => 0 , 'statusDesc' => "Valid Credentials" );
		else
			$status = array('statusCode' => 1100 , 'statusDesc' => "Invalid Credentials" );
		print_r(json_encode($status));
	}

	public function loadMenu()
	{
		$data = json_decode(file_get_contents("php://input"),TRUE);
		$mobileNumber = (int) $data['mobileNumber'];
		$username = $data['username'];

		$resultSet = array();
		$resultWalkInvitations = array();
		
		
		//Extracting the walking invitations
		$result = $this->Walk->getInvitations($mobileNumber);
		if (count($result) > 0)
        {
            foreach ($result as $row)
            {
                
               $walkId = $row->walkId;
               $row->participants = $this->Walk->getParticipantsOfInvitation($walkId, $mobileNumber);
               array_push($resultWalkInvitations, $row);
               
            }
        }
    
		//Extracting next walk details
		$nextWalk = $this->Walk->getNextWalk($mobileNumber);
    	if(count($nextWalk) > 0)
      	{
            foreach ($nextWalk as $row)
            {
                
               $walkId = $row->walkId;
               $row->participants = $this->Walk->getParticipants($walkId, $mobileNumber);
               
            }
        }

		
    //Extracting the walking history
    $walkHistory = $this->Walk->getHistoryOfWalks($mobileNumber);
        
    //merging the result array
    $resultSet = array_merge(array("statusCode" => (int)0000),array("nextWalk" => $nextWalk), array("invitations" => $resultWalkInvitations), array("walkHistory" => $walkHistory));
    print_r(json_encode($resultSet));

	}

	public function getHistory()
	{
		$data = json_decode(file_get_contents("php://input"),TRUE);
		$mobileNumber = (int) $data['mobileNumber'];
		$username = $data['username'];

		//Extracting the walking history
		$monthZero = $this->Walk->getWalksOfMonth($mobileNumber, 0);
		$monthOne = $this->Walk->getWalksOfMonth($mobileNumber, 1);
		$monthTwo = $this->Walk->getWalksOfMonth($mobileNumber, 2);

		$walkHistory = array_merge(array("firstMonth" => $monthZero),array("secondMonth" => $monthOne),array("thirdMonth" => $monthTwo));
		
		if($walkHistory)
			$resultSet = array_merge(array("statusCode" => (int)0000), $walkHistory);
		else
			$resultSet = array("statusCode" => (int)1000);
		
    	print_r(json_encode($resultSet));
	}

	public function loadUser()
	{
		$data = json_decode(file_get_contents("php://input"),TRUE);
		$mobileNumber = (int) $data['mobileNumber'];
		$username = $data['username'];
		$resultSet = array();
		//$resultWalkInvitations = array();
				
    	//Extracting the walkwithmeusers
    	$users = $this->User->getUsers($mobileNumber);
        
    	//merging the result array
    	$resultSet = array_merge(array("statusCode" => (int)0000),array("users" =>$users ));
    	print_r(json_encode($resultSet));

	}

	public function getInvitations()
	{
		$data = json_decode(file_get_contents("php://input"),TRUE);
		$mobileNumber = (int) $data['mobileNumber'];

		$resultWalkInvitations = array();

		//Extracting the walking invitations
		$result = $this->Walk->getInvitations($mobileNumber);
		if (count($result) > 0)
        {
            foreach ($result as $row)
            {
                
               $walkId = $row->walkId;
               $row->participants = $this->Walk->getParticipantsOfInvitation($walkId, $mobileNumber);
               array_push($resultWalkInvitations, $row);
               
            }
        }

        print_r(json_encode(array("statusCode" => (int)0000, "invitations" => $resultWalkInvitations)));
    		
        
	}
	
	public function updateInvitation()
	{
		$data = json_decode(file_get_contents("php://input"),TRUE);
		
		$mobileNumber = (int) $data['mobileNumber'];//713456781;
		$walkId = $data['walkId'];
		$status = $data['status'];
		
    	//Updating the walk status
    	$result = $this->Walk->updateThisInvitation($mobileNumber, $walkId, $status);
    	if($result == "Success")
    		print_r(json_encode(array("statusCode" => (int)0000)));
        
	}

	public function createWalk()
	{
		$data = json_decode(file_get_contents("php://input"),TRUE);
		$mobileNumber = (int) $data['mobileNumber'];
		$username = $data['username'];
		$dateOfWalk=$data['dateOfWalk'];
		$endOfWalk ="2015-10-17 22:30:00";
		$walkId = trim(com_create_guid(),'{}');
		$resultSet = array();

		//save a walk & get WalkId
		$this->Walk->saveWalk($walkId,$mobileNumber,$username,$dateOfWalk,$endOfWalk);

		$resultSet = array_merge(array("statusCode" => (int)0000),array("walkId" =>$walkId ));
    	print_r(json_encode($resultSet));

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

}
