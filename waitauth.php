<?php
    require_once("chorum.inc");
?>

<head>
<link rel='stylesheet' href='chorum.css'/>
<title><?php print $siteName; ?> :: Authentication Required</title>
</head>

<body>
<?php menu(); ?>
<div class='login'>
    <p>Thank you for signing up. An email has been sent to the address you specified with instructions
       telling you how to activate your account.</p>
    <p>If the email hasn't arrived please <a href='resendauth.php'>click here</a> to send it again.</p>
</div>
<br/>
<br/>
<br/>
<br/>
<?php footer(); ?>
</body>
