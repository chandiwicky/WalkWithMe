<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User extends CI_Model {

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
    }

    //Extracts the walks where the user is a participant
     function getUsers ($mobileNumber)
    {
        $getUsersQuery = $this->db->query("SELECT * FROM user where mobileNumber != '".$mobileNumber."'");
        return $getUsersQuery->result();
    }

    //Extracts the userId for a given mobile number
     function getUserId($mobileNumber)
    {
        $userId = $this->db->query("SELECT user.id as 'id' FROM user where user.mobileNumber = $mobileNumber");
        return $userId->row()->id;
    }

    //Chech credentials of a user at login
     function login($userId,$password)
    {
        $credentials = null;
        $credentials = $this->db->query("SELECT user.mobileNumber as 'mobileNumber', user.username as 'username' 
            FROM user where user.id = '$userId' AND user.password = '$password' ");
        return $credentials->row();
    }
  }
