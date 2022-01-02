const fs = require('fs');
const WxPay = require('wechatpay-node-v3');
const path = require('path');
const config = require('../config/config');
const ObjectUtil = require('./ObjectUtil');

module.exports = {
	payByWechat: ({ money, openId, ...rest }) => {
		// money:单位元，微信支付单位是分
		// openid:用户的openid
		return new Promise(async (resolve, reject) => {
			try {
				// 使用框架
				const pay = new WxPay({
					appid: config.wx_appid,
					mchid: config.wechat_mchid,
					publicKey: fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_cert.pem')), // 公钥
					privateKey: fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_key.pem')), // 秘钥
				});
				const params = {
					out_trade_no: ObjectUtil.getRandomStr(32),
					notify_url: config.wechat_pay_notify_url,
					amount: {
						total: Number((money * 100).toFixed(0)), // 单位分
						currency: 'CNY',
					},
					payer: { openid: openId },
					...rest,
				};
				const result = await pay.transactions_jsapi(params);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	},
};
