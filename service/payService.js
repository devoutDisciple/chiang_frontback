const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const wechatUtil = require('../util/wechatUtil');
const config = require('../config/config');
const subject = require('../models/subject');
const responseUtil = require('../util/responseUtil');

const subjectModal = subject(sequelize);

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
			const { detailId, openId, type } = req.body;
			if (!openId || !detailId) return res.send(resultMessage.error('系统错误'));
			let detail = await subjectModal.findOne({
				where: { id: detailId },
				attributes: ['apply_price', 'cluster_price'],
			});
			detail = responseUtil.renderFieldsObj(detail, ['apply_price', 'cluster_price']);
			const money = Number(type) === 1 ? detail.apply_price : detail.cluster_price;
			const desc = Number(type) === 1 ? '报名费用' : '组团费用';
			let result = await wechatUtil.payByWechat({ money, openId, description: desc });
			result = {
				timeStamp: parseInt(`${+new Date() / 1000}`, 10).toString(),
				packageSign: result.package,
				paySign: result.paySign,
				nonceStr: result.nonceStr,
				appId: config.wx_appid,
				signType: 'RSA',
			};
			res.send(resultMessage.success(result));
			res.send(resultMessage.success('成功了'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
