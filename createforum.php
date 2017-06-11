<?php
    require_once("chorum.inc");
    if (!isAdmin($user->id)) {
        header("HTTP/1.1 403 Forbidden");
        exit(0);
    }

    if (array_key_exists("name", $_POST)) {
        $id = db_insert("forums", array(
            "name" => $_POST['name'],
            "locked" => ($_POST['locked'] == 'on') ? 'Y' : 'N',
            "hidden" => ($_POST['hidden'] == 'on') ? 'Y' : 'N'
        ));
        header("Location: manage.php?forum=" . $id);
        exit(0);
    }
    header("HTTP/1.0 400 Bad Request");
