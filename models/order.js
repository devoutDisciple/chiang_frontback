const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('order', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    uuid: {
      type: Sequelize.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    out_trade_no: {
      type: Sequelize.STRING(255),
      allowNull: false,
      primaryKey: true,
      comment: "内部订单号"
    },
    transaction_id: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "微信支付单号"
    },
    user_id: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "用户id"
    },
    open_id: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "1-报名 2-组团"
    },
    subject_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "课程id"
    },
    project_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "班级id"
    },
    create_time: {
      type: Sequelize.DATE,
      allowNull: true
    },
    is_delete: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "1-存在 2-删除"
    },
    pay_state: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "1-已支付 2-已退款"
    }
  }, {
    sequelize,
    tableName: 'order',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
          { name: "uuid" },
          { name: "out_trade_no" },
        ]
      },
    ]
  });
};
