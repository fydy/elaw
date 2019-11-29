const fs = require("fs-extra");
const logger = require("./logger");
const { cleanFiles } = require("./utils");
cleanFiles().forEach(fs.removeSync);
logger.success('Clean up the file successfully！');
