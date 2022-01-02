// const request = require('request');
const crypto = require('crypto');
const fs = require('fs');
// const { KJUR, hextob64 } = require('jsrsasign');
const WxPay = require('wechatpay-node-v3');
const request = require('superagent');
const path = require('path');
const ObjectUtil = require('../util/ObjectUtil');
const config = require('../config/config');
const resultMessage = require('../util/resultMessage');

module.exports = {
	// 下单支付接口
	order: async (req, res) => {
		try {
			const params = {
				// appid: config.wx_appid,
				// mchid: config.wechat_mchid,
				description: '测试',
				out_trade_no: ObjectUtil.getRandomStr(32),
				notify_url: config.wechat_pay_notify_url,
				amount: {
					total: 1, // 单位分
					currency: 'CNY',
				},
				payer: {
					openid: 'odZ0M5iAUE3HxagunKf7kA7qbBBQ',
				},
			};
			const pay = new WxPay({
				appid: config.wx_appid,
				mchid: config.wechat_mchid,
				publicKey: fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_cert.pem')), // 公钥
				privateKey: fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_key.pem')), // 秘钥
			});
			const result = await pay.transactions_jsapi(params);
			console.log(result);

			// const pemStr = fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_key.pem'), 'utf8');

			// const nonceStr = ObjectUtil.getRandomStr(32);
			// const timestamp = (new Date().getTime() / 1000).toFixed(0);
			// const message = `POST\n/v3/pay/transactions/jsapi\n${timestamp}\n${nonceStr}\n${JSON.stringify(params)}\n`;
			// const signature1 = crypto.createSign('RSA-SHA256').update(message).sign(pemStr, 'base64');
			// // .sign(fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_key.pem'), 'utf8').toString(), 'base64');
			// // 创建 Signature 对象
			// // 创建 Signature 对象
			// // const signature2 = new KJUR.crypto.Signature({
			// // 	alg: 'SHA256withRSA',
			// // 	//! 这里指定 私钥 pem!
			// // 	prvkeypem: pemStr,
			// // });
			// // signature2.updateString(message);
			// // const signData = signature2.sign();
			// // // 将内容转成base64
			// // const signDataBase = hextob64(signData);
			// const noceStr = ObjectUtil.getRandomStr(32);
			// const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${config.wechat_mchid}",nonce_str="${noceStr}",signature="${signature1}",timestamp="${timestamp}",serial_no="34720D60C2C7C156098D81C8209B790660CCD687"`;

			// request(
			// 	{
			// 		method: 'POST',
			// 		url: config.wechat_pay_url,
			// 		body: JSON.stringify(params),
			// 		headers: {
			// 			Accept: 'application/json',
			// 			'Content-Type': 'application/json',
			// 			'User-Agent': 'request',
			// 			Authorization,
			// 		},
			// 	},
			// 	(error, response, body) => {
			// 		//
			// 		// code:'ERR_INVALID_HTTP_TOKEN'
			// 		// message:'Header name must be a valid HTTP token ["Authorization:"]'
			// 		// stack:'TypeError [ERR_INVALID_HTTP_TOKEN]
			// 		if (error) console.log(error);
			// 		console.log(body);
			// 	},
			// );
			res.send(resultMessage.success('成功了'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
