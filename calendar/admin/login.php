<?php
(session_id() === '') ? session_start() : '';

if (isSet($_SESSION['admin'])) {
    header('location: index.php');
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    require 'settings.php';

    $inputUser = trim($_POST['user']);
    $inputPass = trim($_POST['psw']);
    
    if ($inputUser == $admin_user && $inputPass == $admin_pass) {
        $_SESSION['admin'] = $admin_user;

        header('location: index.php');
    }
    else {
        echo "<script>alert(\"Username or password incorrect. Try again\")</script>";
    }
}

?>
<!DOCTYPE html>
<html>
    <head>
        <title>Agendamento Online - Área Administrativa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="utf-8">
        <!-- Bootstrap style -->
            <link href="../css/bootstrap.min.css" rel="stylesheet" media="screen">
        <!-- Main style -->
            <link rel="StyleSheet" href="login/css/main.css" type="text/css" />
    </head>
    <body>
        <div class="container">
            <div class="box">
                <header>Painel de Controle</header>
                <section>
                    <form action="" method="post">
                        <input type="text" name="user" placeholder="Usuário" /><br />
                        <input type="password" name="psw" placeholder="Senha" /><br />
                        <input type="submit" value="Acessar" />
                    </form>
                </section>
            </div>
        </div>
    </body>
</html>