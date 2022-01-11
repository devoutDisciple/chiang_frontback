const moment = require('moment');
const sequelize = require('./dataSource/MysqlPoolClass');
const pay = require('./models/pay');
const order = require('./models/order');
const team = require('./models/order');

const payModal = pay(sequelize);
const orderModal = order(sequelize);
const teamModal = team(sequelize);

const timeformat = 'YYYY-MM-DD HH:mm:ss';

const test = async () => {
	const result = {
		mchid: '1618427379',
		appid: 'wx768242fa111870e0',
		out_trade_no: '37NT1KFGWCWH1641915370291',
		transaction_id: '4200001351202201119047470892',
		trade_type: 'JSAPI',
		trade_state: 'SUCCESS',
		trade_state_desc: '支付成功',
		bank_type: 'OTHERS',
		attach: '{"userid":25,"type":2,"subId":1,"proId":1,"tid":"E5S48BWTU8F01641915370"}',
		success_time: '2022-01-11T23:36:19+08:00',
		payer: { openid: 'odZ0M5iAUE3HxagunKf7kA7qbBBQ' },
		amount: { total: 2, payer_total: 2, currency: 'CNY', payer_currency: 'CNY' },
	};

	result.attach = JSON.parse(result.attach);
	// 查询是否存在该账单
	await payModal.findOne({
		where: {
			user_id: result.attach.userid,
			open_id: result.payer.openid,
			out_trade_no: result.out_trade_no,
			transaction_id: result.transaction_id,
		},
	});
	// 创建该账单
	await payModal.create({
		user_id: result.attach.userid,
		open_id: result.payer.openid,
		out_trade_no: result.out_trade_no,
		transaction_id: result.transaction_id,
		trade_type: result.trade_type,
		trade_state: result.trade_state,
		type: result.attach.type,
		money: result.amount.payer_total,
		success_time: moment(result.success_time).format(timeformat),
		create_time: moment().format(timeformat),
	});
	console.log(111);
	// 创建订单
	const orderParams = {
		user_id: result.attach.userid,
		open_id: result.payer.openid,
		out_trade_no: result.out_trade_no,
		transaction_id: result.transaction_id,
		subject_id: result.attach.subId,
		project_id: result.attach.proId,
		type: result.attach.type,
		pay_state: result.trade_state === 'SUCCESS' ? 1 : result.trade_state,
		create_time: moment().format(timeformat),
	};
	console.log(2222);
	if (result.attach.type === 2) orderParams.team_uuid = result.attach.tid;
	console.log(orderParams, 98888);
	const orderDetail = await orderModal.create({ ...orderParams });
	console.log(99999);
	let teamDetail;
	// 如果已存在拼团
	if (result.attach.tid && result.attach.type === 2) {
		teamDetail = await teamModal.findOne({ where: { uuid: result.attach.tid } });
	}
	console.log(333);
	// 如果是发起拼团
	if (!teamDetail) {
		// 创建拼团的订单
		await teamModal.create({
			uuid: result.attach.tid,
			subject_id: result.attach.subId,
			project_id: result.attach.proId,
			start_id: result.attach.userid,
			num: 1,
			order_ids: JSON.stringify([orderDetail.id]),
			user_ids: JSON.stringify([result.attach.userid]),
			state: 2, // 拼团状态 1-未开始 2-进行中 3-拼团成功 4-拼团失败 5-拼团结束
			create_time: moment().format(timeformat),
			end_time: moment().format(timeformat),
		});
	}
	// 如果是与拼团
	if (teamDetail) {
		const user_ids = JSON.stringify(teamDetail.user_ids);
		const order_ids = JSON.stringify(teamDetail.order_ids);
		user_ids.push(result.attach.userid);
		order_ids.push(result.attach.userid);
		// 创建拼团的订单
		await teamModal.update(
			{
				num: Number(teamDetail.num) + 1,
				user_ids: JSON.stringify(user_ids),
				order_ids: JSON.stringify(order_ids),
			},
			{ where: { id: result.attach.tid } },
		);
	}
	console.log(4444);
};

test();
