const registerForm = document.getElementById("registerForm");

if(registerForm){

    registerForm.addEventListener("submit", function(e){

        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const userExists = users.find(
            user => user.username === username
        );

        if(userExists){

            alert("El usuario ya existe");
            return;

        }

        users.push({
            username,
            password
        });

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );

        alert("Usuario registrado correctamente");

        window.location.href = "login.html";

    });

}

const loginForm = document.getElementById("loginForm");

if(loginForm){

    loginForm.addEventListener("submit", function(e){

        e.preventDefault();

        const username =
            document.getElementById("loginUsername").value;

        const password =
            document.getElementById("loginPassword").value;

        let users =
            JSON.parse(localStorage.getItem("users")) || [];

        const validUser = users.find(user =>

            user.username === username &&
            user.password === password

        );

        if(validUser){

            localStorage.setItem(
                "loggedUser",
                username
            );

            alert("Bienvenido");

            window.location.href = "index.html";

        }else{

            alert("Credenciales incorrectas");

        }

    });

}