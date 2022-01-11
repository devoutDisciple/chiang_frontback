const moment = require('moment');
const ObjectUtil = require('../util/ObjectUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const wechatUtil = require('../util/wechatUtil');
const config = require('../config/config');
const subject = require('../models/subject');
const pay = require('../models/pay');
const order = require('../models/order');
const team = require('../models/team');
const responseUtil = require('../util/responseUtil');

const subjectModal = subject(sequelize);
const payModal = pay(sequelize);
const orderModal = order(sequelize);
const teamModal = team(sequelize);

const timeformat = 'YYYY-MM-DD HH:mm:ss';

module.exports = {
	// 下单支付接口
	getPaySign: async (req, res) => {
		try {
			const { openId } = req.query;
			if (!openId) return res.send(resultMessage.error('系统错误'));
			let result = await wechatUtil.payByWechat({ money: 0.01, openId, description: '测试' });
			result = {
				timeStamp: parseInt(`${+new Date() / 1000}`, 10).toString(),
				packageSign: result.package,
				paySign: result.paySign,
				nonceStr: result.nonceStr,
				appId: config.wx_appid,
				signType: 'RSA',
			};
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 报名或者组团支付
	async paySignup(req, res) {
		try {
			// type = 1 报名 type =2 组团
			const { subject_id, project_id, openId, userId, teamId } = req.body;
			let { type } = req.body;
			type = Number(type);
			if (!openId || !subject_id) return res.send(resultMessage.error('系统错误'));
			// 查看用户是否已报名该课程
			// if (Number(type) === 1) {
			// 	const orderDetail = await orderModal.findOne({
			// 		where: { user_id: userId, subject_id, project_id, type },
			// 	});
			// 	if (orderDetail) {
			// 		return res.send(resultMessage.error('您已完成报名'));
			// 	}
			// }
			let teamUuid = `${ObjectUtil.getRandomStr(12)}${parseInt(`${+new Date() / 1000}`, 10).toString()}`;
			// 查看用户是否已组团该课程
			if (Number(type) === 2) {
				const orderDetail = await orderModal.findOne({
					where: { user_id: userId, subject_id, project_id, type },
				});
				if (orderDetail) {
					return res.send(resultMessage.error('您已参与组团'));
				}
				if (teamId) {
					const teamDetail = await teamModal.findOne({ where: { uuid: teamId, is_delete: 1 } });
					// 已经满三人
					if (teamDetail.num === 3) {
						return res.send(resultMessage.error('人数已满'));
					}
					// 已经过了时间
					if (moment(new Date()).diff(moment(orderDetail.end_time), 'minute') > 72 * 60) {
						return res.send(resultMessage.error('组团已过期'));
					}
					teamUuid = teamId;
				}
			}
			// 查看该课程详情
			let detail = await subjectModal.findOne({
				where: { id: subject_id },
				attributes: ['apply_price', 'cluster_price'],
			});
			detail = responseUtil.renderFieldsObj(detail, ['apply_price', 'cluster_price']);
			const money = Number(type) === 1 ? detail.apply_price : detail.cluster_price;
			const desc = Number(type) === 1 ? '报名费用' : '组团费用';
			let result = await wechatUtil.payByWechat({
				money,
				openId,
				userid: userId,
				type,
				subject_id,
				project_id,
				teamUuid,
				description: desc,
			});
			result = {
				timeStamp: parseInt(`${+new Date() / 1000}`, 10).toString(),
				packageSign: result.package,
				paySign: result.paySign,
				nonceStr: result.nonceStr,
				appId: config.wx_appid,
				signType: 'RSA',
			};
			if (type === 2) result.teamUuid = teamUuid;
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 处理微信支付回调
	handleWechat: async (req, res) => {
		try {
			const body = req.body;
			if (!body || !body.resource || !body.resource.ciphertext) {
				return {};
			}
			const result = await wechatUtil.getNotifyMsg(body);
			if (!result.out_trade_no || !result.transaction_id) {
				return res.send(resultMessage.error('系统错误'));
			}
			// 解密后的数据
			// {
			//     mchid: '1618427379',
			//     appid: 'wx768242fa111870e0',
			//     out_trade_no: 'AU9EA5G4FOBK1641908962009',商户系统内部订单号
			//     transaction_id: '4200001351202201114267927862', //微信支付订单号
			//     trade_type: 'JSAPI',
			//     trade_state: 'SUCCESS',
			//     trade_state_desc: '支付成功',
			//     bank_type: 'OTHERS',
			//     attach: '{"userid":25,"type":2,"subId":1,"proId":1,"tid":"89GEZ0IZXPUW1641908961"}',
			//     success_time: '2022-01-11T21:49:31+08:00',
			//     payer: { openid: 'odZ0M5iAUE3HxagunKf7kA7qbBBQ' },
			//     amount: { total: 2, payer_total: 2, currency: 'CNY', payer_currency: 'CNY' }
			//   }
			result.attach = JSON.parse(result.attach);
			// 查询是否存在该账单
			const payRecode = await payModal.findOne({
				where: {
					user_id: result.attach.userid,
					open_id: result.payer.openid,
					out_trade_no: result.out_trade_no,
					transaction_id: result.transaction_id,
				},
			});
			if (payRecode) return res.send(resultMessage.success('success'));
			// 查询订单是否存在
			const orderRecord = await orderModal.findOne({
				where: {
					user_id: result.attach.userid,
					open_id: result.payer.openid,
					out_trade_no: result.out_trade_no,
					transaction_id: result.transaction_id,
					subject_id: result.attach.subId,
					project_id: result.attach.proId,
					type: result.attach.type,
				},
			});
			if (orderRecord) return res.send(resultMessage.success('success'));
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
			if (result.attach.type === 2) orderParams.team_uuid = result.attach.tid;
			const orderDetail = await orderModal.create({ ...orderParams });
			let teamDetail;
			// 如果已存在拼团
			if (result.attach.tid && result.attach.type === 2) {
				teamDetail = await teamModal.findOne({ where: { uuid: result.attach.tid } });
			}
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
				if (!user_ids.includes(result.attach.userid)) {
					user_ids.push(result.attach.userid);
				}
				if (!order_ids.includes(result.attach.userid)) {
					order_ids.push(result.attach.userid);
				}
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

			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},

	testSign: async (req, res) => {
		try {
			// uuid: attach.uuid,
			// 	user_id: attach.userid,
			// 	open_id: result.payer.openid,
			// 	out_trade_no: result.out_trade_no,
			// 	transaction_id: result.transaction_id,
			// 	trade_type: result.trade_type,
			// 	trade_state: result.trade_state,
			// 	money: 1,
			// 	success_time: moment(result.success_time).format(timeformat),
			// 	create_time: moment().format(timeformat),
			const attach = {
				uuid: 'sjfkdskffdsfds',
				user_id: 1,
				open_id: 'fdsfs',
				out_trade_no: 'gfdgfdgfd',
				transaction_id: 'gfidjgdidf',
				trade_type: 'iwrjkdf',
				trade_state: 'success',
				money: 1,
				success_time: moment().format(timeformat),
				create_time: moment().format(timeformat),
			};
			const result = attach;
			const payRecord = await payModal.findOne({
				where: {
					user_id: attach.userid,
					opend_id: result.openid,
					out_trade_no: attach.out_trade_no,
					transaction_id: attach.transaction_id,
				},
			});
			// 如果存在该条记录
			if (payRecord) return;
			// 创建支付记录
			await payModal.create({
				user_id: attach.userid,
				open_id: result.openid,
				out_trade_no: result.out_trade_no,
				transaction_id: result.transaction_id,
				trade_type: result.trade_type,
				trade_state: result.trade_state,
				money: 1,
				success_time: moment(result.success_time).format(timeformat),
				create_time: moment().format(timeformat),
			});
			// 创建订单信息
			res.send(resultMessage.success('成功了'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
