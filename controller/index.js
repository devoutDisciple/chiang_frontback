const testController = require('./testController');

const router = (app) => {
	// 测试相关 testController
	app.use('/test', testController);
};
module.exports = router;
