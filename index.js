const profileName = "Eduardo-YGIAH "
const fetch = require(`node-fetch`);

fetch(`https://api.github.com/users/${profileName}`)
    .then(response => response.json())
    .then(profileInfo => {
        console.log(profileInfo);
    })