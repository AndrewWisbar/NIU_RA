<?php
    file_put_contents("in.data", $_GET["data"]);
    exec("lcm MqI in.data 1 out.data");

    $out = file_get_contents("out.data");

    echo($out);
?>