<?php

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    if (isset($_COOKIE["PHPSESSID"])) {
        $ftime = date("m/d/y h:i A");
        $fh = fopen("command_history.log", 'a');
        fwrite($fh, "[INFO $ftime] IP " . $_SERVER['REMOTE_ADDR'] . " " .$_POST['msg'] . "\n");
        fclose($fh);
    } else {
        $ftime = date("m/d/y h:i A");
        $fh = fopen("command_history.log", 'a');
        fwrite($fh, "[WARN $ftime] IP " . $_SERVER['REMOTE_ADDR'] . " attempted to POST directly to log.php\n");
        fclose($fh);
        echo "A man, a plan, a canal. Panama!\n";
    }
}

?>
