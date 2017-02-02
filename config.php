<?php

$dbUsername = "chorum";
$dbPassword = "chorum";
$dbName = "chorum";
$dbHost = "localhost";

$siteName = "Chorum";
$siteRoot = "http://chorum.org";

$mailSender = "chorum@chorum.org";
$mailName = "Chorum";
$mailSMTPHost = "smtp.chorum.org";
$mailSMTPPort = 587;
$mailSMTPAuth = true;
$mailSMTPTLS = true;
$mailSMTPUser = "mail@chorum.org";
$mailSMTPPassword = "chorum";

$authSubject = "Chorum Account Validation";
$authBody = "
<p>Thank you for signing up for your very own Chorum account.</p>

<p>In order to use your account you must first validate your email
address. To do that, just click the link below. If you cannot
click the link, just copy and paste it into your browser.</p>

<p><a href='%AUTH_URL%'>%AUTH_URL%</a></p>

<p>Thanks, and good Choruming.</p>
";
