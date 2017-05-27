<?php
    require_once 'chorum.inc';

    $_SESSION['uid'] = -1;

    setCookie("ChorumAuthKey", "", 0);
    setCookie("ChorumAuthUser", "", 0);

    header("Location: index.php");
