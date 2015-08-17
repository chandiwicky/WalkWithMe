<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Walk extends CI_Model {

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
    //Extracts the walks where the user is a participant
    function getInvitations($userId)
    {        
        $invitationQuery = $this->db->query("SELECT wp.walkId, 
                                                    userwalks.userId inviterId, 
                                                    user.nickName inviterName, 
                                                    user.profilePicture profilePicture,
                                                    wp.status, 
                                                    userwalks.dateOfWalk, (SELECT count(*) FROM walkparticipants WHERE walkId= wp.walkId) participantCount
                                                    from walkparticipants wp 
                                                    INNER JOIN userwalks on userwalks.id = wp.walkId
                                                    INNER Join user on user.id = userwalks.userId
                                                    WHERE userwalks.dateOfWalk >= now() and wp.status != 3 and wp.status < 10 and
                                                    wp.participantId = '".$userId."' ORDER BY userwalks.dateOfWalk");
        // 2015.08.15 : Get all the invitations not only others
        //and userwalks.userId != '".$userId."'

        return $invitationQuery->result();
    
    }

    //Update the participant status of a user in a given walk
    function updateThisInvitation ($userId, $walkId, $status)
    {        
        $updateQuery = $this->db->query("UPDATE walkparticipants SET walkparticipants.status = ".$status."
                                         WHERE walkparticipants.walkId = '".$walkId."' AND walkparticipants.participantId = '".$userId."'");
        return 0;    
    }

    //Function to extract participants of a given walk excluding myself including the inviter
    function getParticipants ($walkId, $userId)
    {

        $participantsQuery = $this->db->query("SELECT walkparticipants.participantId userId , user.nickName, user.profilePicture  from walkparticipants                                             
                                            INNER Join user on user.id = walkparticipants.participantId
                                            WHERE walkparticipants.walkId = '".$walkId."' AND
                                            walkparticipants.participantId != '".$userId."'");         
        return $participantsQuery->result();
        
    }

  //Function to extract participants of a given walk excluding the inviter
    function getParticipantsOfInvitation ($walkIdentity, $myMobileNumber)
    {
        $participantsQuery = $this->db->query("SELECT user.mobileNumber as 'participantNumber', user.username as 'participantName', user.profilePicture as 'picture'
                                               FROM user
                                               INNER JOIN walkparticipants on user.id = walkparticipants.participantId
                                               WHERE (walkparticipants.participantStatus = 'Joined') AND (walkparticipants.walkId = '$walkIdentity') AND (walkparticipants.participantNum != $myMobileNumber)
                                               LIMIT 0,6"); 
        
        return $participantsQuery->result();
        
    }
    // Function to extract the next walk details
    // TODO : Replace hardcoded mobile number
    function getNextWalk ($userId)
    {

        $nextWalkQuery = $this->db->query("SELECT walkparticipants.walkId, userwalks.dateOfWalk, walkparticipants.status, userwalks.userId from walkparticipants 
                                            INNER JOIN userwalks on userwalks.id = walkparticipants.walkId
                                            INNER Join user on user.id = walkparticipants.participantId
                                            WHERE userwalks.dateOfWalk >= now() and ( walkparticipants.status = 1 OR walkparticipants.status = 2 OR walkparticipants.status = 10 )  and
                                            walkparticipants.participantId = '".$userId."' ORDER BY userwalks.dateOfWalk
                                            LIMIT 0,1");
      return $nextWalkQuery->result();
    }
    
    // Function to extract walking history
    // TODO : Replace hardcoded mobile number
    function getHistoryOfWalks ($userId){
        $historyQuery = $this->db->query( "SELECT DATE_FORMAT(userwalks.dateOfWalk, '%M') as `month`, COUNT(*) as `Count` FROM userwalks
                                          INNER JOIN walkparticipants on userwalks.id = walkparticipants.walkId 
                                          WHERE walkparticipants.`participantId` = '".$userId."' AND 
                                          userwalks.dateOfWalk < now() AND (MONTH(now()) - MONTH(userwalks.dateOfWalk) IN (0,1,2))
                                          GROUP BY DATE_FORMAT(userwalks.dateOfWalk, '%M')");
        return $historyQuery->result();
    }

    function getWalksOfMonth ($userId, $month){
        $historyQuery = $this->db->query("SELECT walkId , userwalks.dateOfWalk, walkparticipants.participantId,walkparticipants.status, userwalks.userId, If( userwalks.userId = 'CAB410D4-4A7F-B68B-ACA7-9123BD537E77', 0, 1) AS Type
                                          FROM userwalks
                                          INNER JOIN walkparticipants on userwalks.id = walkparticipants.walkId
                                          where walkparticipants.participantId = '".$userId."' AND
                                          walkparticipants.status = 1 AND         
                                          userwalks.dateOfWalk < now() AND
                                          (MONTH(now()) -  MONTH(userwalks.dateOfWalk))=".$month."
                                          ORDER BY userwalks.dateOfWalk");
        log_message('error', "SELECT walkId , userwalks.dateOfWalk, walkparticipants.participantId,walkparticipants.status, userwalks.userId, If( userwalks.userId = 'CAB410D4-4A7F-B68B-ACA7-9123BD537E77', 0, 1) AS Type
                                          FROM userwalks
                                          INNER JOIN walkparticipants on userwalks.id = walkparticipants.walkId
                                          where walkparticipants.participantId = '".$userId."' AND
                                          walkparticipants.status = 1 AND         
                                          userwalks.dateOfWalk < now() AND
                                          (MONTH(now()) -  MONTH(userwalks.dateOfWalk))=".$month."
                                          ORDER BY userwalks.dateOfWalk");
        return $historyQuery->result();
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
    function inviteWalk($inviteId,$walkId,$participantId, $status){
        $saveWalkQuery = $this->db->query("INSERT INTO `walkparticipants`(`Id`, `walkId`, `participantId`,`status`) 
                                          VALUES ('".$inviteId."','".$walkId."','".$participantId."',".$status.")");       
                               
    }

    function saveWalk($walkId,$userId,$dateOfWalk,$endOfWalk, $inviteId){
        $saveWalkQuery = $this->db->query("INSERT INTO `userwalks`(`id`, `userId`, `dateOfWalk`, `suggestedEndOfWalk`, `milestone`)
                                         VALUES ('".$walkId."','".$userId."','".$dateOfWalk."','".$endOfWalk."','p')");                                     
        // invite myself
        log_message('error', "INSERT INTO `userwalks`(`id`, `userId`, `dateOfWalk`, `suggestedEndOfWalk`, `milestone`)
                                         VALUES ('".$walkId."','".$userId."','".$dateOfWalk."','".$endOfWalk."','p')");
        $this->inviteWalk($inviteId, $walkId, $userId, 1);        
    }

    function deleteWalk($walkId){
        $deleteWalkQuery = $this->db->query("DELETE FROM `walkparticipants` WHERE `walkId`='".$walkId."'");                                     
        
        $deleteWalkQuery = $this->db->query("DELETE FROM `walkmessage` WHERE `walkId`='".$walkId."'");                                     

        $deleteWalkQuery = $this->db->query("DELETE FROM `userwalks` WHERE `id`='".$walkId."'");                                     
    }
    

}
