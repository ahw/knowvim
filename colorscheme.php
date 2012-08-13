<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    // Assert: client just wants to read the colorscheme variable.
    echo $_SESSION['colorscheme'];
} else if ($_SERVER['REQUEST_METHOD'] == "POST") {
    // Assert: client wants to change the colorscheme session variable
    // value.
    $_SESSION['colorscheme'] = $_POST['colorscheme'];
}

?>
