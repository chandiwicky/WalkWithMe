<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class WalkNow extends CI_Model {

    function updateStartUser($startTime,$walkId,$participantId){
        updateQuerryUser=this->db->querry("UPDATE `walkparticipants` SET `walkStartTime='".$startTime."',`walkingStatus`="2",`walkEndTime`="0" WHERE walkId='".$walkId."' And participantId='".$participantId."'");
    } 

    function updateEndUser($endTime,$walkId,$participantId){
        updateQuerryUser=this->db->querry("UPDATE `walkparticipants` SET `walkEndTime='".$endTime."',`walkingStatus`="3", WHERE walkId='".$walkId."' And participantId='".$participantId."'");
    } 

    function getJoinnedUsers($walkId){
    	selectJoinnedUsers=this->db->querry("SELECT walkparticipants.participantId as `Id`, user.nickName as 'NickName' , user.profilePicture as 'profilePic' , walkparticipants.walkingStatus as 'Status'
                                             FROM walkparticipants
                                             INNER JOIN user on user.id = walkparticipants.participantsId
                                             WHERE walkparticipants.walkId='".$walkId."');
    }
}
