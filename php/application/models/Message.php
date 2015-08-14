<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Message extends CI_Model {

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
    }

    //Function to return the latest message of a given walk
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

    //Function to send a walkie to a specific user
    function sendWalkie($walkId, $sender, $receiver, $walkie){

        $sendWalkie = $this->db->query("INSERT INTO `walkmessage`
                                                    (`walkId`, `messageType`, `messageContent`, `messageFrom`, `messageTo`)
                                                    VALUES ('$walkId', 0, '$walkie', '$sender' , '$receiver')
                                      ");

        return "Walkie Sent";
    }

}
