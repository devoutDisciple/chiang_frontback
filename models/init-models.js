var Sequelize = require("sequelize").Sequelize;
var _detail = require("./detail");
var _project = require("./project");
var _subject = require("./subject");
var _swiper = require("./swiper");
var _teacher = require("./teacher");
var _type = require("./type");
var _user = require("./user");

function initModels(sequelize) {
  var detail = _detail(sequelize, Sequelize);
  var project = _project(sequelize, Sequelize);
  var subject = _subject(sequelize, Sequelize);
  var swiper = _swiper(sequelize, Sequelize);
  var teacher = _teacher(sequelize, Sequelize);
  var type = _type(sequelize, Sequelize);
  var user = _user(sequelize, Sequelize);


  return {
    detail,
    project,
    subject,
    swiper,
    teacher,
    type,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
