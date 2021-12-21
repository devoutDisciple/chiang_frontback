var Sequelize = require("sequelize").Sequelize;
var _user = require("./user");

function initModels(sequelize) {
  var user = _user(sequelize, Sequelize);


  return {
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
