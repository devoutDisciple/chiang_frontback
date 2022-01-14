const schedule = require('node-schedule');
const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const wechatUtil = require('../util/wechatUtil');
const order = require('../models/order');
const team = require('../models/team');

const orderModal = order(sequelize);
const teamModal = team(sequelize);
const Op = Sequelize.Op;

// 查看所有拼团，每小时的1分执行
schedule.scheduleJob('* 1 * * * *', async () => {
	const hours73Ago = moment().subtract(73, 'hours');
	// 获取最近73小时的组团信息
	const results = await teamModal.findAll({
		where: {
			state: 2,
			create_time: {
				[Op.gte]: hours73Ago,
			},
		},
	});
	if (!results || results.length === 0) return;
	results.map(async (item) => {
		// 如果超过72小时
		if (moment(new Date()).diff(moment(item.end_time), 'minute') > 72 * 60) {
			// 将状态刚更新为拼团超时而失败
			await teamModal.update({ state: 4 }, { where: { id: item.id } });
		}
	});
});

// 退款，每天的早上八点
schedule.scheduleJob('* * 8 * * *', async () => {
	const hours48Ago = moment().subtract(48, 'hours');
	// 获取所有拼团失败的信息
	const results = await teamModal.findAll({
		where: {
			state: 4,
			create_time: {
				[Op.gte]: hours48Ago,
			},
		},
	});
	if (!results || results.length === 0) return;
	results.map(async (item) => {
		// 将状态刚更新为退款
		await teamModal.update({ state: 6 }, { where: { id: item.id } });
		const orderDetails = await orderModal.findAll({
			attributes: ['id', 'user_id', 'out_trade_no', 'transaction_id'],
			where: { team_uuid: item.uuid },
		});
		if (orderDetails && orderDetails.length !== 0) {
			orderDetails.map(async (orderDetail) => {
				wechatUtil.payRefunds(orderDetail);
			});
		}
	});
});
