const resultMessage = require('../util/resultMessage');

module.exports = {
	// 测试
	test: async (req, res) => {
		try {
			res.send(resultMessage.success('成功了'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
