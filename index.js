const utils = require("./utils");
const db = require("./sqlite3");
const request = require('request');
const BASE_URL = "https://iprice.my/";
const QUEUE = 10;
let deep = 1;
let visitedURL = {};
const main = async () => {

    await db.getConnect();
    await db.createTable();

    console.time("level1");
    let level1 = await crawlMulti(["https://iprice.my"]);
    console.timeEnd("level1");


    console.time("level2");
    deep = 2;
    let level2 = await crawlMulti(level1);
    console.timeEnd("level2");

    return;

    console.time("level3");
    deep = 3;
    let level3 = await crawlMulti(level2);
    console.timeEnd("level3");

    console.time("level4");
    deep = 4;
    let level4 = await crawlMulti(level3);
    console.timeEnd("level4");

    console.time("level5");
    deep = 5;
    let level5 = await crawlMulti(level4);
    console.timeEnd("level5");

    console.time("level6");
    deep = 6;
    let level6 = await crawlMulti(level5);
    console.timeEnd("level6");

    console.time("level7");
    deep = 7;
    let level7 = await crawlMulti(level6);
    console.timeEnd("level7");

    console.time("level8");
    deep = 8;
    let level8 = await crawlMulti(level7);
    console.timeEnd("level8");
};

const IGNORE_URL = [
    "/r/",
    "http://",
    "/insights/",
    "?",
    "iema",
    "{{",
    "#"
];

const removeInvalidURL = (arr) => {
    let result = arr.filter((v, i) => {
        if (visitedURL[v]) { //Remove visited URL
            return false;
        }
        return arr.indexOf(v) === i; // Remove duplicate URL
    });
    return result;
};
const crawlMulti = async (URLs) => {
    let result = [];
    let crawlTasks = [];
    const addConvertTask = utils.createTasks(crawlTasks);
    URLs.map(url => addConvertTask(async () => {

        const urls = await crawlSingle(url);
        result = [...result, ...urls];
    }));
    await utils.executeTasks(crawlTasks, {thread: QUEUE});
    console.log("Found:", result.length);
    const validURL = removeInvalidURL(result);
    // console.log(JSON.stringify(validURL));
    console.log("validURL:", validURL.length);

    return validURL;
};
const getURLs = (str) => {
    const anchorTagRegex = /(<a)(.+?)(href=")(.+?)(")(.+?)(>)/sg;
    const anchorTagRegexMatching = utils.regexMatchingSync(anchorTagRegex);
    let result = [];
    anchorTagRegexMatching(str, matches => {
        const url = getValidURL(matches[4]);
        if (url) {
            result.push(url);
        }
    });
    return result;

};
const getValidURL = (url) => {
    if (existed(url, IGNORE_URL)) {
        return false;
    }

    if (url.indexOf("https://") === -1) {
        return `${BASE_URL}${url}`;
    }
    if (url.indexOf(BASE_URL) === -1) {
        return false;
    }

    return url;
};

function existed(str, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (str.indexOf(arr[i]) > -1) {
            return true;
        }
    }
    return false;
}

const updateOutLink = (url, outLinks) => {
    outLinks.map(link => {
        db.insertDataOutLink(url, link);
    })
};

const crawlSingle = (url) => {
    visitedURL[url] = 1;
    console.log("crawl", url);
    db.insertDataContent(url, deep);
    const start = +new Date();
    return new Promise((resolve, reject) => {
        request(url, function (error, response, body) {
            const finish = +new Date();
            const took = finish - start;
            db.updateDataContent(url, response.statusCode, took);
            if (!error && response.statusCode === 200) {
                const URLs = getURLs(body);
                updateOutLink(url, URLs);
                resolve(URLs);
            } else {
                console.log("Cannot crawl", url);
                resolve([]);
            }
        })

    });
};

main();
