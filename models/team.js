const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('team', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    uuid: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "拼团的唯一标识"
    },
    subject_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "课程id"
    },
    project_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "项目id"
    },
    order_ids: {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: "[]",
      comment: "对应的订单ids"
    },
    user_ids: {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: "[]",
      comment: "报名的用户ids"
    },
    is_starter: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "1-是 2-不是"
    },
    num: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "已报名人员人数"
    },
    state: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "拼团状态 1-未开始 2-进行中 3-拼团成功 4-拼团失败 5-拼团结束"
    },
    create_time: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "创建时间"
    },
    end_time: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "结束时间"
    }
  }, {
    sequelize,
    tableName: 'team',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
