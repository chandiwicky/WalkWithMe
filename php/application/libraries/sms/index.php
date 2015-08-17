<?php
require 'class-Clockwork.php';
 $API_KEY="3fa54e045e7eaa9bbe311c3ad3c8ebd7829cbbd0";
$rand = rand(10000,99999); //generates a random number
//$number=0711737449;
try
{
    // Create a Clockwork object using your API key
    $clockwork = new Clockwork( $API_KEY );
 
    // Setup and send a message
	$options = array( 'ssl' => false );
    $clockwork = new Clockwork( $API_KEY, $options );
    $message = array( 'to' =>'0777331370', 'message' =>$rand ,'from' =>'WalkWithMe'); //Remove the hard coded number
    $result = $clockwork->send( $message );
 
    // Check if the send was successful
    if($result['success']) {
        echo 'Message sent - ID: ' . $result['id'];
    } else {
        echo 'Message failed - Error: ' . $result['error_message'];
    }
}
catch (ClockworkException $e)
{
    echo 'Exception sending SMS: ' . $e->getMessage();
	
	
	
}

 
 
 
 
?>
	 




