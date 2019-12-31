const sqlite3 = require('sqlite3').verbose();
let db;
const getConnect = (file) => {
    return new Promise(resolve => {
        db = new sqlite3.Database(file, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to the SQLite database.');
            resolve();
        })
    });
};

const createTable = () =>
    new Promise(resolve => {
        db.serialize(async function () {
            console.log("create table");
            db.run(`CREATE TABLE content (
                url VARCHAR(255),
                statusCode INTEGER,
                status VARCHAR(255),
                googleSearchVolume INTEGER,
                totalSearchVolume INTEGER,
                session INTEGER,
                took INTEGER,
                deep INTEGER,
                PRIMARY KEY(url)
            );`);
            db.run(`CREATE TABLE out_link (
                url VARCHAR(255),
                outUrl VARCHAR(255)
            );`);
            // db.run(`CREATE INDEX tag_content_url ON content (url);`);
            // db.run(`CREATE INDEX tag_content_status ON content (status);`);
            // db.run(`CREATE INDEX tag_out_link_url ON out_link (url);`);
            setTimeout(() => {
                resolve();
            }, 100);
        })
    });

const getCrawlingURLs = async () => {
    return await execQuery("select url from content where status ='crawling'");
};

function execQuery(query) {
    return new Promise(resolve => {
        db.all(query, (err, rows) => {
            if (err) {
                console.error(err.message);
            }
            resolve(rows);
        });
    });
}

const insertDataContent = (url, statusCode, googleSearchVolume, totalSearchVolume, session,took, deep) => {
    return new Promise(resolve => {
        let query = `INSERT INTO content (url, statusCode, googleSearchVolume, totalSearchVolume, session,took, deep) VALUES
             ('${url}',${statusCode},'${googleSearchVolume}','${totalSearchVolume}','${session}', '${took}', '${deep}')
            `;
        db.run(query, function (error) {
            if (error) {
                console.log(error);
                console.log(query);
            }
            resolve();
        });

    });
};

const updateDataContent = (url, statusCode, took) => {
    let query = `UPDATE content  set statusCode = '${statusCode}', status = 'crawled', took = ${took}
            where url = '${url}'`;
    db.run(query, function (error) {
        if (error) {
            console.log(error);
            console.log(query);
        }
    });
};

const insertDataOutLink = (url, outUrl) => {
    return new Promise(resolve => {
        let query = `INSERT INTO out_link (url, outUrl) VALUES
             ('${url}', '${outUrl}')
            `;
        db.run(query, function (error) {
            if (error) {
                console.log(error);
                console.log(query);
            }
            resolve();
        });


    });
};

module.exports = {
    createTable,
    getConnect,
    insertDataContent,
    insertDataOutLink,
    getCrawlingURLs,
    updateDataContent,
};
