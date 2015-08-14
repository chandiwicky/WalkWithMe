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
      $lastMessage = $this->db->query("SELECT `id` as `messageId`, `type` as `messageType`, `content` as `messageContent`, `from` as `messageFrom`, `to` as `messageTo`, `time` as `messageTime`
                                       FROM `walkmessage` 
                                       WHERE walkId = '$walkId' AND (walkmessage.to = '$userId' OR walkmessage.to = 'All')
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

    //Function to send a walkie to a specific user
    function sendWalkie($id,$walkId, $sender, $receiver, $walkie){

        $sendWalkie = $this->db->query("INSERT INTO `walkmessage`
                                                    (`id`,`walkId`, `type`, `content`, `from`, `to`)
                                                    VALUES ('$id','$walkId', 0, '$walkie', '$sender' , '$receiver')
                                      ");

        return "Walkie Sent";
    }

}
