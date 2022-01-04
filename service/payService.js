const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const wechatUtil = require('../util/wechatUtil');
const config = require('../config/config');
const subject = require('../models/subject');
const pay = require('../models/pay');
const responseUtil = require('../util/responseUtil');

const subjectModal = subject(sequelize);
const payModal = pay(sequelize);

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

	// 报名
	async paySignup(req, res) {
		try {
			// type = 1 报名 type =2 组团
			const { detailId, openId, type, userId } = req.body;
			if (!openId || !detailId) return res.send(resultMessage.error('系统错误'));
			let detail = await subjectModal.findOne({
				where: { id: detailId },
				attributes: ['apply_price', 'cluster_price'],
			});
			detail = responseUtil.renderFieldsObj(detail, ['apply_price', 'cluster_price']);
			const money = Number(type) === 1 ? detail.apply_price : detail.cluster_price;
			const desc = Number(type) === 1 ? '报名费用' : '组团费用';
			let result = await wechatUtil.payByWechat({ money, openId, userid: userId, description: desc });
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
			// {
			//   mchid: '1618427379',
			//   appid: 'wx768242fa111870e0',
			//   out_trade_no: '0230B63SPN4FZS99YCCE2DL6SRPW9177',
			//   transaction_id: '4200001322202201046757833161',
			//   trade_type: 'JSAPI',
			//   trade_state: 'SUCCESS',
			//   trade_state_desc: '支付成功',
			//   bank_type: 'OTHERS',
			//   attach: '{"uuid":"JHRNI0PZLU3OX2PW_1641309249712"}',
			//   success_time: '2022-01-04T23:14:17+08:00',
			//   payer: { openid: 'odZ0M5iAUE3HxagunKf7kA7qbBBQ' },
			//   amount: { total: 1, payer_total: 1, currency: 'CNY', payer_currency: 'CNY' }
			const attach = JSON.parse(result.attach);
			payModal.create({
				uuid: attach.uuid,
				user_id: attach.userid,
				open_id: result.payer.openid,
				out_trade_no: result.out_trade_no,
				transaction_id: result.transaction_id,
				trade_type: result.trade_type,
				trade_state: result.trade_state,
				money: 1,
				success_time: moment(result.success_time).format(timeformat),
				create_time: moment().format(timeformat),
			});
		} catch (error) {
			console.log(error);
			return res.send(resultMessage.error('网络出小差了, 请稍后重试'));
		}
	},
};
