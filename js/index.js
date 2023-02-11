const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

if (!params.code) {
    window.location.href =
        "https://github.com/login/oauth/authorize?scope=repo codespace admin:org&client_id=10e8db4ed250e4ac72a0";
}

console.log("ParamsCode is given");

fetch("http://127.0.0.1:5000/https://github.com/login/oauth/access_token", {
    //method post
    method: "POST",
    //no cors
    headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        client_id: "10e8db4ed250e4ac72a0",
        client_secret: "cc14f5e149f83526df2b99ed2c9ace5a41c604e6",
        code: params.code,
    }),
})
    .then((response) => response.json())
    .then((data) => {
        if (!data.access_token) {
            window.location.href =
                "https://github.com/login/oauth/authorize?scope=repo codespace admin:org&client_id=10e8db4ed250e4ac72a0";
        }
        window.initOctoKit(data.access_token);
        console.log(data);
        window
            .getRepos()
            .then((response) => {
                templateRepos = response.data.filter(
                    (repo) => repo.is_template
                );
                templateRepos.forEach((repo) => {
                    templates.push({
                        name: repo.description,
                        value: repo.name,
                    });
                });
                templates.forEach((template) => {
                    addTemplateOption(template);
                });
                console.log(templates);
            })
            .catch((err) => {
                console.error(err);
                swal.fire({
                    title: "Error",
                    text: "An error occured while fetching your repositories",
                    icon: "error",
                });
            });
    })
    .catch((err) => {
        console.error(err);
    });

let templateRepos = [];
let templates = [];

/*
const templates = [
    { name: "Html, Js, Css (Basic)", value: "html-js-css-basic" },
    { name: "Html, Js, Css (Advanced)", value: "html-js-css-advanced" },
    { name: "Html, Js, Css (Tailwind)", value: "html-js-css-tailwind" },
    { name: "NodeJs (Basic)", value: "nodejs-basic" },
    { name: "NodeJs (Express)", value: "nodejs-express" },
    { name: "Nuxt", value: "nuxt" },
];
*/

const templateContainer = document.getElementById("templates");
const projectNameInputElement = document.getElementById("projectNameInput");
const visibilitySwitchElement = document.getElementById("visibilitySwitch");
const createButton = document.getElementById("createButton");
let projectNameInputState = { value: 0 };

var projectNameInputStateProxy = new Proxy(projectNameInputState, {
    set: function (target, key, value) {
        if (key != "value") return;
        if (projectNameInputState.value != value) {
            console.log("projectNameInputStateValue changed to: " + value);
            changeProjectNameInputColor(value);
            projectNameInputState.value = value;
        }
        return true;
    },
});

function changeProjectNameInputColor(color) {
    switch (color) {
        case 0:
            projectNameInputElement.classList.remove("border-red-500");
            projectNameInputElement.classList.remove("border-green-500");
            break;
        case 1:
            projectNameInputElement.classList.remove("border-green-500");
            projectNameInputElement.classList.add("border-red-500");
            break;
        case 2:
            projectNameInputElement.classList.remove("border-red-500");
            projectNameInputElement.classList.add("border-green-500");
            break;
    }
}

function addTemplateOption(options) {
    const option = document.createElement("option");
    option.value = options.value;
    option.innerText = options.name;
    templateContainer.appendChild(option);
}

projectNameInputElement.addEventListener("input", (e) => {
    console.log(e.target.value);
    if (e.target.value.length == 0) {
        projectNameInputStateProxy.value = 0;
        return;
    }
    if (e.target.value.length > 3) {
        projectNameInputStateProxy.value = 2;
        return;
    } else {
        projectNameInputStateProxy.value = 1;
        return;
    }
});

document.querySelectorAll(".visibilitySwitchButton").forEach((e) => {
    e.addEventListener("click", () => {
        visibilitySwitchElement.classList.toggle("left-1");
        visibilitySwitchElement.classList.toggle("left-[calc(50%_-_0.25rem)]");
        if (visibilitySwitchElement.classList.contains("left-1")) {
            visibilitySwitchElement.innerHTML = "Public";
        } else {
            visibilitySwitchElement.innerHTML = "Private";
        }
    });
});

function createCodeSpaceForRepository(id) {
    window
        .createCodespaceForRepo(id)
        .then((response) => {
            console.log("Codespace created successfully", response);
            window.location.href = response.data.web_url;
        })
        .catch((err) => {
            console.log(err);
            swal.fire({
                title: "Error",
                text: "An error occured while creating the codespace",
                icon: "error",
            });
        });
}

createButton.addEventListener("click", async () => {
    if (projectNameInputState.value != 2) {
        swal.fire({
            title: "Error",
            text: "Project name must be at least 4 characters long",
            icon: "error",
        });
        return;
    }
    if (!templateContainer.value) {
        swal.fire({
            title: "Error",
            text: "Please select a template",
            icon: "error",
        });
        return;
    }
    window
        .creteRepoFromTemplate(
            templateContainer.value,
            projectNameInputElement.value,
            visibilitySwitchElement.classList.contains("left-1")
        )
        .then(async (response) => {
            console.log("Repository created successfully", response);
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 3000);
            }).then(() => {
                createCodeSpaceForRepository(response.data.id);
            });
        })
        .catch((err) => {
            console.log(err);
            swal.fire({
                title: "Error",
                text: "An error occured while creating the repository",
                icon: "error",
            });
        });
});
