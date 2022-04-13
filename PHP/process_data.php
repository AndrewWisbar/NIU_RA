<?php
if(strlen($_GET["data"]) > 0) {
    file_put_contents("in.data", $_GET["data"]);

    $output=null;
    $exit=null;
    exec("lcm MqI in.data 4 out.data", $output, $exit);

    if($exit == 0)
        $out = file_get_contents("out.data");
    else
        $out = "An error occured.";
        //echo($_GET["data"]);
    //echo(strlen($_GET["data"]));
    echo($out);
}
else {
    echo("Error: Recieved no input");
}
?>