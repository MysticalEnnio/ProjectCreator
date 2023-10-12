const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

let clientId =
    window.location.hostname == "localhost"
        ? "3fb67bc2b25156f984ec"
        : "10e8db4ed250e4ac72a0";
let clientSecret =
    window.location.hostname == "localhost"
        ? "6d69ea5e4ba661f14d617db7a6e1258cc96b4175"
        : "cc14f5e149f83526df2b99ed2c9ace5a41c604e6";

if (!params.code) {
    window.location.href = `https://github.com/login/oauth/authorize?scope=repo codespace admin:org&client_id=${clientId}`;
}

console.log("ParamsCode is given");

fetch(
    "https://cors-proxy-bngj.onrender.com/https://github.com/login/oauth/access_token",
    {
        //method post
        method: "POST",
        //no cors
        headers: {
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: params.code,
        }),
    }
)
    .then((response) => response.json())
    .then((data) => {
        if (!data.access_token) {
            window.location.href = `https://github.com/login/oauth/authorize?scope=repo codespace admin:org&client_id=${clientId}`;
        }
        window.initOctoKit(data.access_token);
        console.log(data);
        log("Loading repositories...");
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
                log("Repositories loaded");
                console.log(templates);
            })
            .catch((err) => {
                console.error(err);
                log("An error occured while fetching your repositories");
                swal.fire({
                    title: "Error",
                    text: "An error occured while fetching your repositories",
                    icon: "error",
                });
            });
    })
    .catch((err) => {
        console.error(err);
        log("An error occured while logging you in");
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

var outputElement = document.getElementById("output");
var log = (input) => {
    outputElement.innerText = outputElement.innerText + input + "\n";
};

const templateContainer = document.getElementById("templates");
const projectNameInputElement = document.getElementById("projectNameInput");
const visibilitySwitchElement = document.getElementById("visibilitySwitch");
const locationSwitchElement = document.getElementById("locationSwitch");
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

document.querySelectorAll(".switchButton").forEach((e) => {
    e.addEventListener("click", () => {
        console.log(e.parentElement.parentElement.lastElementChild);
        e.parentElement.parentElement.lastElementChild.classList.toggle(
            "left-1"
        );
        e.parentElement.parentElement.lastElementChild.classList.toggle(
            "left-[calc(50%_-_0.25rem)]"
        );
        if (
            e.parentElement.parentElement.lastElementChild.classList.contains(
                "left-1"
            )
        ) {
            console.log(1);
            e.parentElement.parentElement.lastElementChild.innerHTML =
                e.parentElement.parentElement.firstElementChild.innerHTML;
        } else {
            console.log(2);
            e.parentElement.parentElement.lastElementChild.innerHTML =
                e.parentElement.parentElement.children[1].innerHTML;
        }
    });
});

function createCodeSpaceForRepository(id) {
    window
        .createCodespaceForRepo(id)
        .then((response) => {
            console.log("Codespace created successfully", response);
            log("Codespace created successfully");
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
    log("Creating repository from template...");
    window
        .creteRepoFromTemplate(
            templateContainer.value,
            projectNameInputElement.value,
            visibilitySwitchElement.classList.contains("left-1")
        )
        .then(async (response) => {
            console.log("Repository created successfully", response);
            log("Repository created successfully");
            if (!locationSwitchElement.classList.contains("left-1")) {
                //copy clone git url to clipboard
                await navigator.clipboard.writeText(
                    `git clone ${response.data.clone_url}`
                );
                log("git clone url command to clipboard");
                return;
            }
            log("Creating codespace...");
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
