const inquirer = require('inquirer');
const isColor = require('is-color');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const hbs = require('handlebars');
const path = require('path');

let _developerFavColor = 'white';
let _developerGitHubUsername = '';

const compile = async(templateName, data) => {
    const filepath = path.join(process.cwd(), 'profile.hbs');
    const html = await fs.readFile(filepath, 'utf-8');
    return hbs.compile(html)(data);
}

const generatePDF = async(json) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const content = await compile('profile', json);

    await page.setContent(content);
    await page.emulateMediaType('screen');
    await page.pdf({
        path: 'output.pdf',
        format: "A4",
        printBackground: true
    })

    console.log('done');
    await browser.close();
    process.exit();
}

const getGitHubDeveloperProfile = async() => {
    try {
        let url = `https://api.github.com/users/${_developerGitHubUsername}`;
        await fetch(url, ).then((res) => {
            if (res.status >= 200 && res.status < 300) {
                return res.json();
            } else {
                return { "error": "Something went wrong! Try again later." };
            }
        }).then((json) => {
            if (json.error) {
                console.log(json.error);
            } else {
                json['color'] = _developerFavColor;

                generatePDF(json);
            }
        });
    } catch (er) {
        console.log(er)
    }
}

const askQuestions = () => {
    try {
        var questions = [{
                type: 'input',
                name: 'color',
                message: 'whats your fav color?',
                validate: function(value) {
                    if (value !== null && value !== '' && isColor(value.toLowerCase())) {
                        return true;
                    }

                    return 'Please enter a valid color';
                }
            },
            {
                type: 'input',
                name: 'username',
                message: 'what is your github username?',
                validate: function(value) {
                    if (value !== null && value !== '') {
                        return true;
                    }

                    return 'Please enter a valid username:';
                }
            }
        ];

        inquirer.prompt(questions).then(answers => {
            console.log('fav color: ' + answers['color']);
            console.log('fav color: ' + answers['username']);

            _developerFavColor = answers['color'];
            _developerGitHubUsername = answers['username'];

            getGitHubDeveloperProfile();
        });
    } catch (er) {
        console.log(er)
    }
}

askQuestions();