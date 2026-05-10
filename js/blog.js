const loggedUser = localStorage.getItem("loggedUser");

if(!loggedUser){

    window.location.href = "login.html";

}

const postForm = document.getElementById("postForm");
const postsContainer = document.getElementById("postsContainer");

let posts = JSON.parse(localStorage.getItem("posts")) || [];

renderPosts();

if(postForm){

    postForm.addEventListener("submit", function(e){

        e.preventDefault();

        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;

        const newPost = {
            id: Date.now(),
            title,
            content,
            date: new Date().toLocaleDateString()
        };

        posts.push(newPost);

        localStorage.setItem("posts", JSON.stringify(posts));

        postForm.reset();

        renderPosts();

    });

}

function renderPosts(){

    postsContainer.innerHTML = "";

    posts.forEach(post => {

        postsContainer.innerHTML += `

            <div class="post">

                <h3>${post.title}</h3>

                <small>${post.date}</small>

                <p>${post.content}</p>

                <div class="actions">

                    <button onclick="editPost(${post.id})">
                        Editar
                    </button>

                    <button onclick="deletePost(${post.id})">
                        Eliminar
                    </button>

                    <a href="post.html?id=${post.id}">
                        <button>Ver Más</button>
                    </a>

                </div>

            </div>

        `;

    });

}

function deletePost(id){

    posts = posts.filter(post => post.id !== id);

    localStorage.setItem("posts", JSON.stringify(posts));

    renderPosts();

}

function editPost(id){

    const post = posts.find(post => post.id === id);

    const newTitle = prompt("Nuevo título", post.title);
    const newContent = prompt("Nuevo contenido", post.content);

    if(newTitle && newContent){

        post.title = newTitle;
        post.content = newContent;

        localStorage.setItem("posts", JSON.stringify(posts));

        renderPosts();

    }

}

function logout(){

    localStorage.removeItem("loggedUser");

    window.location.href = "login.html";

}