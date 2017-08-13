<?php
    require_once 'chorum.inc';

    $session->set("uid", -1);

    setCookie("ChorumAuthKey", "", 0);
    setCookie("ChorumAuthUser", "", 0);

    header("Location: index.php");
