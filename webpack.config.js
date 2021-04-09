const path = require('path')

module.exports = {
    target: "webworker",
    entry: "./index.js",
    mode: "production",
    resolve: {
        alias: {
            jszip: path.resolve(__dirname, './jszip.min.js'),
        }
    }
}