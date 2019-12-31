const utils = require("./utils");
const db = require("./sqlite3");
const config = require('./config.json');

const main = async () => {
    await db.getConnect(config.sql_out);
    await db.createTable();
    const contentData = await utils.getArrDataFromCSV(config.content, ',');
    const outLinkData = await utils.getArrDataFromCSV(config.out_link, ',');
    let plpData = await utils.getArrDataFromCSV(config.plp_data, ',');
    plpData = convertArrToDictionary(plpData);
    let insertTasks = [];
    const addConvertTask = utils.createTasks(insertTasks);

    contentData.map(item => addConvertTask(async () => {
        {
            const url = item[0];
            const statusCode = item[1];
            const deep = item[2];
            const took = item[3];
            const plpItem = plpData[url] || {};
            const googleSearchVolume = plpItem[1];
            const totalSearchVolume = plpItem[2];
            const session = plpItem[3];
            console.log(url);
            console.log(plpItem);
            if (url) {
                await db.insertDataContent(url, statusCode, googleSearchVolume, totalSearchVolume, session, took, deep);
            }
        }
    }));
    await utils.executeTasks(insertTasks, {thread: 50});
    // outLinkData.map(item => {
    //     const url = item[0];
    //     const outLink = item[1];
    //     db.insertDataOutLink(url, outLink);
    // })
};

const convertArrToDictionary = (arr) => {
    let result = {};
    arr.map(item => {
        const url = config.base_url + item[0] + '/';
        result[url] = [...item];
    });
    return result;
};


main();