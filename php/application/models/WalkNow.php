<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Walknow extends CI_Model {
    
    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
    }
/*

  0   : Pending
  1   : Accepted
  2   : Maybe
  3   : Decline
  10  : Walking
  11  : Completed
  12  : Completed-Forced

*/

    /*
        Update walking status for 10 or 11
    */
    function updateWalkStatus($walkId,$participantId,$startTime, $status){
        $updateQuerryUser=$this->db->query("UPDATE `walkparticipants` SET walkStartTime='".$startTime."',`status`=".$status." WHERE walkId='".$walkId."' And participantId='".$participantId."'");
    } 

    /*
        Get stats of walking ; who is walking and who is not
    */
    function getWalkingStats($walkId){
        $selectJoinnedUsers = $this->db->query("SELECT walkparticipants.participantId as `id`, user.nickName as 'nickName' , user.profilePicture as 'profilePic' , walkparticipants.status as 'status'
                                                FROM walkparticipants
                                                INNER JOIN user on user.id = walkparticipants.participantId
                                                WHERE walkparticipants.walkId='".$walkId."'");

        log_message('error', "SELECT walkparticipants.participantId as `id`, user.nickName as 'nickName' , user.profilePicture as 'profilePic' , walkparticipants.status as 'status'
                                                FROM walkparticipants
                                                INNER JOIN user on user.id = walkparticipants.participantId
                                                WHERE walkparticipants.walkId='".$walkId."'");

        return $selectJoinnedUsers->result();
    }
/*    
    function updateEndUser($endTime,$walkId,$participantId){
        $updateQuerryUser=$this->db->query("UPDATE `walkparticipants` SET `walkEndTime='".$endTime."',`walkingStatus`="3", WHERE walkId='".$walkId."' And participantId='".$participantId."'");
    }

    function getJoinnedUsers($walkId){
    	$selectJoinnedUsers = $this->db->query("SELECT walkparticipants.participantId as `Id`, user.nickName as 'NickName' , user.profilePicture as 'profilePic' , walkparticipants.walkingStatus as 'Status'
                                             FROM walkparticipants
                                             INNER JOIN user on user.id = walkparticipants.participantsId
                                             WHERE walkparticipants.walkId='".$walkId."'");
    }
    */

}
