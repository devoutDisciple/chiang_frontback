const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const order = require('../models/order');
const responseUtil = require('../util/responseUtil');

const orderModal = order(sequelize);

module.exports = {
	// 获取课程详情
	getOrderDetailByUserid: async (req, res) => {
		try {
			const { userid, subId, proId } = req.query;
			if (!userid) return res.send(resultMessage.success([]));
			const data = await orderModal.findOne({
				where: { user_id: userid, subject_id: subId, project_id: proId, is_delete: 1 },
			});
			const result = responseUtil.renderFieldsObj(data, ['id', 'team_uuid', 'pay_state', 'type']);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
