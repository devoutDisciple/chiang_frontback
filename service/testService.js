const resultMessage = require('../util/resultMessage');
const postMessage = require('../util/postMessage');

module.exports = {
	// 测试
	test: async (req, res) => {
		try {
			postMessage.postJoinTeamMsg('18210619398', '考研课程');
			res.send(resultMessage.success('成功了'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
