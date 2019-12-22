const utils = require("./utils");
const db = require("./sqlite3");
const request = require('request');
const BASE_URL = "https://iprice.my/";
const START_URL = "https://iprice.my";
const QUEUE = 5;
let deep = 1;
let crawledURLs = [];
let outLinkURLs = [];
let foundedURLs = [];

let visitedURL = {};
const continueMain = async () => {
    let URLs = await warmUpData();
    if (URLs.length === 0) {
        if (foundedURLs.length > 0) {
            URLs = getValidFromURLs(foundedURLs);
        }
    }
    while (URLs.length) {
        console.time("level" + deep);
        URLs = await crawlMulti(URLs, foundedURLs);
        console.timeEnd("level" + deep);
        deep++;
        // if (deep === 12)
        //     return;

    }
};
const warmUpData = async () => {
    const previousFoundedURLs = await utils.getDataFromCSV("data/temp_founded.csv", ',');
    const previousCrawlingURLs = await utils.getArrDataFromCSV("data/temp_crawling_status.csv", ',');
    visitedURL = require("./data/visitedURL.json");
    let crawlingURLs = [];
    console.log(previousFoundedURLs.length);
    previousFoundedURLs.map((item) => {
        foundedURLs.push([item]);
    });
    previousCrawlingURLs.map((item) => {
        // console.log(item[1]);
        if (item[1] === 'crawling') { //crawling status
            crawlingURLs.push(item[0]); //url
        }
        if (item[4] === 'crawled') {
            utils.removeItem(crawlingURLs, item[0]);
            deep = item[5];
        }
    });
    console.log("foundedURLs", foundedURLs.length);
    console.log("crawlingURLs", crawlingURLs.length);
    return crawlingURLs;

};


const main = async () => {
    let URLs = [START_URL];
    while (URLs.length) {
        console.time("level" + deep);
        URLs = await crawlMulti(URLs);
        console.timeEnd("level" + deep);
        deep++;
        // if (deep === 12)
        //     return;

    }
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
const crawlMulti = async (URLs, foundedURLs) => {
    let result = foundedURLs || [];
    let crawlTasks = [];
    let i = 0;
    await utils.removeContent("data/temp_crawling_status.csv");
    await utils.removeContent("data/temp_founded.csv");
    await updateCrawlStatus(URLs, 'crawling');
    const addConvertTask = utils.createTasks(crawlTasks);
    URLs.map(url => addConvertTask(async () => {
        if (url.length > 5) {
            const urls = await crawlSingle(url, deep);
            result = [...result, ...urls];
            i++;
            if (i % (1000) === 0 || i === URLs.length) {
                console.log(`level ${deep}: founded ${result.length} out link, ${i}/${URLs.length}`);
                await updateDataToCSV();
            }
        }
    }));
    await utils.executeTasks(crawlTasks, {thread: QUEUE});
    console.log("Found:", result.length);
    const validURL = getValidFromURLs(result);
    // console.log(JSON.stringify(validURL));
    console.log("validURL:", validURL.length);

    return validURL;
};
const getValidFromURLs = (URLs) => {
    console.time("removeInvalidURL");
    const validURLs = removeInvalidURL(URLs);
    console.timeEnd("removeInvalidURL");
    return validURLs;
};

const updateCrawlStatus = async (URLs, status) => {
    let crawlStatusUrls = [];
    URLs.map(url => {
        crawlStatusUrls.push([url, status, deep]);
    });
    await utils.updateCSVFile("data/temp_crawling_status.csv", crawlStatusUrls);

};
const updateDataToCSV = async () => {
    await updateCrawlStatus(crawledURLs, 'crawled');
    await utils.updateCSVFile("data/content.csv", crawledURLs);
    await utils.exportJsonFile("data/visitedURL.json", visitedURL);
    await utils.updateCSVFile("data/temp_founded.csv", foundedURLs);
    await utils.updateCSVFile("data/out_link.csv", outLinkURLs);
    crawledURLs = [];
    outLinkURLs = [];
    foundedURLs = [];
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

const updateCrawlData = (url, statusCode, deep, took, outLinks) => {
    crawledURLs.push([url, statusCode, deep, took]);
    outLinks.map(link => {
        outLinkURLs.push([url, link]);
        foundedURLs.push([link]);
    })
};

const crawlSingle = (url, deep) => {
    visitedURL[url] = 1;
    // console.log("crawl", url);
    const start = +new Date();
    return new Promise((resolve, reject) => {
        request(url, function (error, response, body) {
            const finish = +new Date();
            const took = finish - start;
            let URLs = [];
            if (!error && response && response.statusCode === 200) {
                URLs = getURLs(body);
            } else {
                // console.log("Cannot crawl", url);
            }
            updateCrawlData(url, response.statusCode, deep, took, URLs);
            resolve(URLs);
        })

    });
};

// main();
continueMain();