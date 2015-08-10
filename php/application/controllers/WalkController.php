<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class WalkController extends CI_Controller {

	public function index()
	{
		
	}

	public function serverStat()
	{
		$status = array('statusCode' => 0 , 'statusDesc' => "Server Running" );
		print_r(json_encode($status));
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

		$resultSet = [];
		$resultWalkInvitations = [];
		
		
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
		$resultSet = [];
		//$resultWalkInvitations = [];
				
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

		$resultWalkInvitations = [];

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
		$resultSet = [];

		//save a walk & get WalkId
		$this->Walk->saveWalk($walkId,$mobileNumber,$username,$dateOfWalk,$endOfWalk);

		$resultSet = array_merge(array("statusCode" => (int)0000),array("walkId" =>$walkId ));
    	print_r(json_encode($resultSet));

	}

}
