const serve = require("webpack-serve");
const webpackConfig = require("./webpack.config.js");
const { getConfig } = require("./utils");
const config = getConfig();

serve(
  {
    open: true,
    port: config.dev.port
  },
  {
    config: webpackConfig
  }
).then(result => {
  //
});