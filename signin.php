<?php
    session_start();
    require_once("chorum.inc");

    if ($_SESSION['goto'] == "") {
        $_SESSION['goto'] = $_SERVER['HTTP_REFERER'];
    }

print_r($_POST);

    if ($_POST['username'] != "") {
        $q = db_query("SELECT * FROM users WHERE name=:name", array("name" => $_POST['username']));
        if ($r = db_next($q)) {
            $goto = $_SESSION['goto'];
            $_SESSION['goto'] = "";
            $_SESSION['uid'] = $r->id;
            if (substr($goto, -11, 11) == "/signin.php") {
                $goto = "";
            }
            if ($goto == "") {
                $goto = "index.php?topic=1";
            }
            header("Location: " . $goto);
            exit(0);
        }
        echo "Error logging in";
    }
?>
<?php echo $_SESSION['goto']; ?>
<form action='signin.php' method='POST'>
    Username: <input type='text' name='username'><br/>
    Password: <input type='password' name='password'><br/>
    <input type="submit" />
</form>
