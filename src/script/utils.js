const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");
const importFresh = require("import-fresh");

exports.configPath = path.join(process.cwd(), "src/config");

exports.getConfig = function() {
  return importFresh(exports.configPath);
};

exports.themePath = function() {
  const paths = {};
  const config = exports.getConfig();
  const themeDir = glob.sync(
    path.join(process.cwd(), "src/theme", config.theme, "*")
  );
  themeDir.forEach(item => (paths[path.basename(item)] = item));
  return paths;
};

exports.htmlList = function() {
  const pages = exports.themePath().pages;
  return glob.sync(path.join(pages, "*.html")).map(item => {
    const filename = path.basename(item).toLowerCase();
    const chunkName = filename.replace(".html", "");
    return {
      filename: filename,
      template: path.resolve(item),
      chunkName: chunkName,
      chunkPath: path.join(exports.themePath().js, `${chunkName}.js`)
    };
  });
};

exports.cleanFiles = function() {
  const htmlFile = glob.sync(path.join(process.cwd(), "*.html"));
  const staticFile = glob.sync(path.join(process.cwd(), 'static', '*')).filter(item => {
    return path.basename(item) !== 'img';
  });
  return [...htmlFile, ...staticFile];
};