const testController = require('./testController');
const loginController = require('./loginController');
const payController = require('./payController');
const wechatController = require('./wechatController');

const router = (app) => {
	// 登录相关
	app.use('/login', loginController);
	// 测试相关
	app.use('/test', testController);
	// 支付相关
	app.use('/pay', payController);
	// 小程序相关
	app.use('/wechat', wechatController);
};
module.exports = router;
