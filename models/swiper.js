const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('swiper', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    url: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    create_time: {
      type: Sequelize.DATE,
      allowNull: false
    },
    is_delete: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1-存在 2-删除"
    }
  }, {
    sequelize,
    tableName: 'swiper',
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
