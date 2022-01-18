const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const team = require('../models/team');
const responseUtil = require('../util/responseUtil');

const teamModal = team(sequelize);

module.exports = {
	// 获取组团详情根据team uuid
	getTeamDetailByTeamUuid: async (req, res) => {
		try {
			const { team_uuid } = req.query;
			if (!team_uuid) return res.send(resultMessage.success({}));
			const data = await teamModal.findOne({
				where: { uuid: team_uuid, is_delete: 1 },
			});
			const result = responseUtil.renderFieldsObj(data, [
				'id',
				'uuid',
				'subject_id',
				'project_id',
				'order_ids',
				'user_ids',
				'is_starter',
				'num',
				'state',
			]);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
