const resultMessage = require('../util/resultMessage');
const wechatUtil = require('../util/wechatUtil');
const config = require('../config/config');

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
};
