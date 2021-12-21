const testController = require('./testController');
const loginController = require('./loginController');

const router = (app) => {
	// 登录相关
	app.use('/login', loginController);
	// 测试相关 testController
	app.use('/test', testController);
};
module.exports = router;
