const testController = require('./testController');
const loginController = require('./loginController');
const payController = require('./payController');
const wechatController = require('./wechatController');
const swiperController = require('./swiperController');
const typeController = require('./typeController');
const projectController = require('./projectController');
const subjectController = require('./subjectController');

const router = (app) => {
	// 登录相关
	app.use('/login', loginController);
	// 测试相关
	app.use('/test', testController);
	// 支付相关
	app.use('/pay', payController);
	// 小程序相关
	app.use('/wechat', wechatController);
	// 轮播图相关
	app.use('/swiper', swiperController);
	// 类别相关
	app.use('/type', typeController);
	// 班级相关
	app.use('/project', projectController);
	// 课程相关
	app.use('/subject', subjectController);
};
module.exports = router;
