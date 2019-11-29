const path = require("path");
const exec = require('child_process').exec;
const logger = require("./logger");
const { getConfig } = require("./utils");
const config = getConfig();
const themeDist = path.join(process.cwd(), "src/theme", config.theme);
exec(`cd ${themeDist} && npm install`, function (err, stdout, stderr) {
    if (err) logger.fatal(err);
    console.log(stdout);
});
