<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Message extends CI_Model {

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
    }

    //Function to return the latest message of a given walk
    function getLastMessage($walkId, $userId){
      $lastMessage = $this->db->query("SELECT `id`,`type`, `content`, `from`, 
                                              (SELECT nickName from user where user.id = walkmessage.from) 'fromNickName',  `to`, 
                                              (SELECT nickName from user where user.id = walkmessage.to) 'toNickName',
                                              `time` 
                                       FROM `walkmessage` 
                                       WHERE walkId = '".$walkId."' AND (walkmessage.to = '".$userId."' OR walkmessage.to = 'All')
                                       ORDER BY `time` DESC
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

    //Function to send a walkie to a specific user
    function sendMessage($id,$walkId, $sender, $receiver, $content, $type){
        $sendWalkie = $this->db->query("INSERT INTO `walkmessage`
                                                    (`id`,`walkId`, `type`, `content`, `from`, `to`)
                                                    VALUES ('".$id."','".$walkId."', ".$type.", '".$content."', '".$sender."' , '".$receiver."')");

        return 0;
    }

}
