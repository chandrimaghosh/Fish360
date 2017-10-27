module.exports = function (app, db) {
    var model = require("./models/reports.model.server.js")(db);
    require("./services/reports.service.server.js")(app, model);
    require("./services/sunmoon.service.server.js")(app);
    require("./services/tidal.service.server.js")(app);
}