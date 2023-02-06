const templates = [
    { name: "Html, Js, Css (Basic)", value: "html-js-css-basic" },
    { name: "Html, Js, Css (Advanced)", value: "html-js-css-advanced" },
    { name: "Html, Js, Css (Tailwind)", value: "html-js-css-tailwind" },
    { name: "NodeJs (Basic)", value: "nodejs-basic" },
    { name: "NodeJs (Express)", value: "nodejs-express" },
    { name: "Nuxt", value: "nuxt" },
];

const templateContainer = document.getElementById("templates");

function addTemplateOption(options) {
    const option = document.createElement("option");
    option.value = options.value;
    option.innerText = options.name;
    templateContainer.appendChild(option);
}

templates.forEach((template) => {
    addTemplateOption(template);
});
