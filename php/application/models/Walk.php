<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Walk extends CI_Model {

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
    }

    //Extracts the walks where the user is a participant
     function getInvitations ($mobileNumber)
    {
        
        $invitationQuery = $this->db->query("SELECT userwalks.id as `walkId`, userwalks.inviterId as 'inviterId' , userwalks.inviterName as `inviter`, user.profilePicture as 'inviterPicture' , DATE_FORMAT(userwalks.dateOfWalk, '%a %d %b %Y') as `date` , DATE_FORMAT(userwalks.dateOfWalk, '%h.%i %p') as `time`, walkparticipants.participantStatus as 'myStatus'
                                             FROM userwalks
                                             INNER JOIN walkparticipants on userwalks.id = walkparticipants.walkId
                                             INNER JOIN user on user.mobileNumber = userwalks.inviterId
                                             WHERE walkparticipants.participantStatus = 'Pending' AND userwalks.dateOfWalk >= now() AND walkparticipants.participantNum = $mobileNumber
                                             ORDER BY userwalks.dateOfWalk");

        

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
    function getParticipants ($walkIdentity, $myMobileNumber)
    {
        $participantsQuery = $this->db->query("SELECT participantNumber, participantName, picture
                                               FROM(
                                               (SELECT user.mobileNumber as 'participantNumber', user.username as 'participantName', user.profilePicture as 'picture'
                                               FROM user
                                               INNER JOIN walkparticipants on user.id = walkparticipants.participantId
                                               WHERE (walkparticipants.participantStatus <> 'Denied') AND (walkparticipants.walkId = '$walkIdentity') AND (walkparticipants.participantNum != $myMobileNumber))

                                               UNION ALL

                                               (SELECT userwalks.inviterId as 'participantNumber', userwalks.inviterName as 'participantName', user.profilePicture as 'picture'
                                               FROM userwalks
                                               INNER JOIN user on user.mobileNumber = userwalks.inviterId
                                               WHERE userwalks.id = '$walkIdentity' AND userwalks.inviterId != $myMobileNumber))

                                               t
                                               LIMIT 0,6"); 
        
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
    function getNextWalk ($mobileNumber)
    {
        $nextWalkQuery = $this->db->query("SELECT walkId, inviter, date ,time
                                           FROM(
                                          (SELECT userwalks.id as 'walkId', userwalks.inviterName as 'inviter', DATE_FORMAT(userwalks.dateOfWalk, '%a %d %b %Y') as 'date' , DATE_FORMAT(userwalks.dateOfWalk, '%h.%i %p') as 'time'
                                           FROM userwalks
                                           WHERE userwalks.dateOfWalk >=  now() AND userwalks.inviterId = $mobileNumber) 
                                          
                                          UNION ALL

                                          (SELECT userwalks.id as 'walkId', userwalks.inviterName as 'inviter', DATE_FORMAT(userwalks.dateOfWalk, '%a %d %b %Y') as 'date' , DATE_FORMAT(userwalks.dateOfWalk, '%h.%i %p') as 'time'
                                           FROM userwalks
                                           INNER JOIN walkparticipants on userwalks.id = walkparticipants.walkId
                                           WHERE  userwalks.dateOfWalk >= now() AND walkparticipants.participantNum =  $mobileNumber)
                                           )t
                                          ORDER BY date DESC
                                          LIMIT 0,1");
      return $nextWalkQuery->result();
    }
    
    // Function to extract walking history
    // TODO : Replace hardcoded mobile number
    function getHistoryOfWalks ($mobileNumber){
        $historyQuery = $this->db->query("SELECT  month, SUM(Count) as 'countWalks'
                                          FROM(
                                          (SELECT DATE_FORMAT(userwalks.dateOfWalk, '%M') as `month`, COUNT(*) as `Count`
                                          FROM userwalks
                                          WHERE userwalks.inviterId = $mobileNumber AND userwalks.dateOfWalk < now() AND (MONTH(now()) - MONTH(userwalks.dateOfWalk) IN (0,1,2)) GROUP BY DATE_FORMAT(userwalks.dateOfWalk, '%M'))
                                          
                                          UNION ALL

                                          (SELECT DATE_FORMAT(userwalks.dateOfWalk, '%M') as `month`, COUNT(*) as `Count`
                                          FROM userwalks
                                          INNER JOIN walkparticipants
                                          WHERE userwalks.id = walkparticipants.walkId AND walkparticipants.participantNum = $mobileNumber AND 
                                                userwalks.dateOfWalk < now() AND (MONTH(now()) - MONTH(userwalks.dateOfWalk) IN (0,1,2))
                                          GROUP BY DATE_FORMAT(userwalks.dateOfWalk, '%M'))
                                          ) t
                                          GROUP BY month");
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

    function saveWalk($walkId,$mobileNumber,$username,$dateOfWalk,$endOfWalk){
        $saveWalkQuery = $this->db->query("INSERT INTO `userwalks`(`id`, `inviterId`, `inviterName`, `dateOfWalk`, `suggestedEndOfWalk`, `milestone`)
                                         VALUES ('".$walkId."','".$mobileNumber."','".$username."','".$dateOfWalk."','".$endOfWalk."','p')");                                     
    }


}
