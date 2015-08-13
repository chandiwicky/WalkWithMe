<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Walk extends CI_Model {

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
    }

    //Extracts the walks where the user is a participant
    function getInvitations($userId)
    {        
        $invitationQuery = $this->db->query("SELECT wp.walkId, 
                                                    userwalks.userId inviterId, 
                                                    user.nickName inviterName, 
                                                    user.profilePicture profilePicture, 
                                                    userwalks.dateOfWalk, (SELECT count(*) FROM walkparticipants WHERE walkId= wp.walkId) participantCount
                                                    from walkparticipants wp 
                                                    INNER JOIN userwalks on userwalks.id = wp.walkId
                                                    INNER Join user on user.id = userwalks.userId
                                                    WHERE userwalks.dateOfWalk >= now() and 
                                                    wp.participantId = '".$userId."' and userwalks.userId != '".$userId."' ORDER BY userwalks.dateOfWalk");

        return $invitationQuery->result();
    
    }

    //Update the participant status of a user in a given walk
    function updateThisInvitation ($mobileNumber, $walkId, $status)
    {
        
        $updateQuery = $this->db->query("UPDATE walkparticipants
                                         SET walkparticipants.participantStatus = '$status'
                                         WHERE walkparticipants.walkId = '$walkId' AND walkparticipants.participantNum = $mobileNumber
                                       ");
        return "Success";    
    }

    //Function to extract participants of a given walk excluding myself including the inviter
    function getParticipants ($walkId, $userId)
    {
<<<<<<< HEAD
        $participantsQuery = $this->db->query("SELECT walkparticipants.participantId userId , user.nickName, user.profilePicture  from walkparticipants                                             
                                            INNER Join user on user.id = walkparticipants.participantId
                                            WHERE walkparticipants.walkId = '".$walkId."' AND
                                            walkparticipants.participantId != '".$userId."'");         
=======
        $participantsQuery = $this->db->query("SELECT id, participantNumber, participantName as 'nickName', picture as 'profilePic', status
                                               FROM(
                                               (SELECT user.id as 'id', user.mobileNumber as 'participantNumber', user.username as 'participantName', user.profilePicture as 'picture', walkparticipants.walkingStatus as 'status'
                                               FROM user
                                               INNER JOIN walkparticipants on user.id = walkparticipants.participantId
                                               WHERE (walkparticipants.participantStatus <> 'Denied') AND (walkparticipants.walkId = '$walkIdentity') AND (walkparticipants.participantNum != $myMobileNumber))

                                               UNION ALL

                                               (SELECT user.id as 'id', userwalks.inviterId as 'participantNumber', userwalks.inviterName as 'participantName', user.profilePicture as 'picture', userwalks.walkingStatus as 'status'
                                               FROM userwalks
                                               INNER JOIN user on user.mobileNumber = userwalks.inviterId
                                               WHERE userwalks.id = '$walkIdentity' AND userwalks.inviterId != $myMobileNumber))

                                               t
                                               LIMIT 0,6"); 
        
>>>>>>> origin/master
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

        $nextWalkQuery = $this->db->query("SELECT walkparticipants.walkId, userwalks.dateOfWalk from walkparticipants 
                                            INNER JOIN userwalks on userwalks.id = walkparticipants.walkId
                                            INNER Join user on user.id = walkparticipants.participantId
                                            WHERE userwalks.dateOfWalk >= now() and walkparticipants.status = 1 and
                                            walkparticipants.participantId = '".$userId."' ORDER BY userwalks.dateOfWalk DESC
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

    function getWalksOfMonth ($mobileNumber, $month){
        $historyQuery = $this->db->query("SELECT * 
                                          FROM (
                                          (SELECT id as 'walkId', DATE_FORMAT(userwalks.dateOfWalk, '%d, %a') as `walkDate`, DATE_FORMAT (userwalks.dateOfWalk, '%h.%i %p') as 'walkTime', 'Created' AS Type
                                          FROM userwalks
                                          WHERE userwalks.inviterId = $mobileNumber AND (MONTH(now()) - MONTH(userwalks.dateOfWalk) IN ($month)) AND userwalks.dateOfWalk < now())

                                          UNION ALL

                                          (SELECT walkId , DATE_FORMAT(userwalks.dateOfWalk, '%d, %a') as `walkDate`, DATE_FORMAT (userwalks.dateOfWalk, '%h.%i %p') as 'walkTime', 'Joined' AS Type
                                          FROM userwalks
                                          INNER JOIN walkparticipants
                                          WHERE userwalks.id = walkparticipants.walkId AND walkparticipants.participantNum = $mobileNumber AND walkparticipants.participantStatus = 'Joined' AND userwalks.dateOfWalk < now() AND 
                                          (MONTH(now()) -  MONTH(userwalks.dateOfWalk) IN ($month)))) as t
                                          ORDER BY walkDate");
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
        $this->inviteWalk($inviteId, $walkId, $userId, 1);        
    }

<<<<<<< HEAD
    
=======
    //Function to get the latest message of a given walk
    function getLastMessage($walkId){
        $lastMessage = $this->db->query("SELECT `messageId`, `messageType`, `messageContent`, `messageFrom`, `messageTo`, `messageTime`
                                         FROM `walkmessage` 
                                         WHERE walkId = '$walkId'
                                         ORDER BY `messageTime` DESC
                                         LIMIT 0,1");

        return $lastMessage->row();
    }

    //Function to get the end time of a given walk
    function getWalkEndTime($walkId){
        $walkEnd = $this->db->query("SELECT `suggestedEndOfWalk` as 'endTime'
                                     FROM userwalks
                                     WHERE id = '$walkId'
                                   ");

        return $walkEnd->row()->endTime;
    }
>>>>>>> origin/master

}
