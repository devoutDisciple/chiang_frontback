const resultMessage = require('../util/resultMessage');
const payUtil = require('../util/payUtil');

module.exports = {
	// 下单支付接口
	getPaySign: async (req, res) => {
		try {
			const result = await payUtil.payByWechat({ money: 1, openid: 'odZ0M5iAUE3HxagunKf7kA7qbBBQ', description: '测试' });
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
