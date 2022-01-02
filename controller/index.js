const testController = require('./testController');
const loginController = require('./loginController');
const payController = require('./payController');

const router = (app) => {
	// 登录相关
	app.use('/login', loginController);
	// 测试相关 testController
	app.use('/test', testController);
	// 支付祥光 testController
	app.use('/pay', payController);
};
module.exports = router;
