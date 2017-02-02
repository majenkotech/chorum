<?php
    require_once("chorum.inc");

    $caps = array(
        array("What is three plus four?", "7", "seven"),
        array("What is nine minus four?", "5", "five"),
        array("What is half of twelve?", "6", "six"),
        array("What is the square root of 391?", "19", "nineteen")
    );

    $goto = $_SESSION['goto'];
    if ($goto == "") {
        $goto = $_SERVER['HTTP_REFERER'];
        $_SESSION['goto'] = $goto;
    }
    if (substr($goto, -11, 11) == "/signup.php") {
        $goto = "index.php";
    }

    if ($_POST['username'] != "") {
        if ($_POST['password'] != $_POST['password2']) {
            $error = "Error: your passwords do not match.";
        } else {
            if (!preg_match("/^(.*)@(.*)$/", trim($_POST['email']), $m)) {
                $error = "Error: could not validate your email.";
            } else {
                $capok = false;
                $cnum = $_POST['capnum'];
                $ans = $_POST['captcha'];
                $cap = $caps[$cnum];
                array_shift($cap);
                while (count($cap) > 0) {
                    $a = array_shift($cap);
                    if (strtolower($a) == trim(strtolower($ans))) {
                        $capok = true;
                    }
                }
                if ($capok == false) {
                    $error = "Error: you failed the captcha.";
                } else {
                    $pw = hash('sha256', $_POST['password']);
                    $sides = array("left", "right");
                    $colors = array("red", "green", "blue", "yellow", "purple", "cyan");
                    $id = db_insert("users", array(
                        "name" => $_POST['username'],
                        "password" => $pw,
                        "email" => $_POST['email'],
                        "side" => $sides[rand(0, count($sides)-1)],
                        "color" => $colors[rand(0, count($colors)-1)],
                        "auth" => "N"
                    ));
                    sendEmailAuth($_POST['username']);
                    header("Location: waitauth.php");    
                    exit(0);
                }
            }
        }
    }

    $capno = rand(0, count($caps)-1);
    $capq = $caps[$capno][0];
?>

<head>
<link rel='stylesheet' href='chorum.css'/>
<title><?php print $siteName; ?> :: Sign Up</title>
</head>

<body>
<?php menu(); ?>
<div class='login'>
    <form action='signup.php' method='POST'>
        <table>
            <tr>
                <td>Username:</td>
                <td><input type='text' name='username' value='<?php print $_POST['username']; ?>'/></td>
            </tr>
            <tr>
                <td>Password:</td>
                <td><input type='password' name='password' value='<?php print $_POST['password']; ?>'/></td>
            </tr>
            <tr>
                <td>Password (again):</td>
                <td><input type='password' name='password2' value='<?php print $_POST['password2']; ?>'/></td>
            </tr>
            <tr>
                <td>Email Address:</td>
                <td><input type='text' name='email' value='<?php print $_POST['email']; ?>'/></td>
            </tr>
            <input type='hidden' name='capnum' value='<?php print $capno; ?>'/>
            <tr>
                <td colspan=2>
                    <br/>
                    <p>Please answer this question:</p>
                    <p><?php print $capq; ?></p>
                    <input type='text' name='captcha'/>
                </td>
            </tr>
            <tr>
                <td colspan=2 align="right">
                    <input type="submit" value="Sign Up" />
                </td>
            </tr>
        </table>
    </form>
<p>Already have an account? <a href='signin.php'>Click here</a> to sign in!</p>
</div>
<?php
    if ($error != "") {
?>
<div class='error'>
<?php print $error; ?>
</div>
<?php
    }
    footer();
?>
</body>
