<?php
if(strlen($_GET["data"]) > 0) {
    file_put_contents("in.data", $_GET["data"]);
    $output=null;
    $exit=null;
    $exec_str = "lcm MqI in.data " . $_GET["param"] . " out.data";
    exec($exec_str, $output, $exit);
    if($exit == 0)
        $out = file_get_contents("out.data");
    else
        $out = "An error occured.";
        //echo($_GET["data"]);
    //echo(strlen($_GET["data"]));
    echo( $_GET["from"] . " " . $_GET["to"] . "\n" . $out);
}
else {
    echo("Error: Recieved no input");
}
?>