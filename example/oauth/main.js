var {Application} = require("stick");

var app = exports.app = Application();
app.configure("notfound", "error", "static", "params", "mount");

app.mount("/", require("./actions"));

if (require.main === module) {
    require("ringo/httpserver").main(module.id);
}
