const fs = require('fs');
const WxPay = require('wechatpay-node-v3');
const path = require('path');
const request = require('request');
const config = require('../config/config');
const ObjectUtil = require('./ObjectUtil');

module.exports = {
	// 微信支付，获取签名
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
	// 获取accessToken
	getAccessToken: () => {
		const grant_type = 'client_credential';
		return new Promise((resolve, reject) => {
			try {
				request.get(
					`${config.wechat_accessToken_url}?grant_type=${grant_type}&appid=${config.wx_appid}&secret=${config.wx_appSecret}`,
					async (error, res, body) => {
						// {"access_token":"52_3lDXa1NbGIaxUDn2TWg9_jHAIAuMWdNNz4NfY1Gd4dPq5GhyMGk5S_Ei6lvsv5lr3KpI9if6odYq4utl_3_Q1BwQ_QS00tevSpv1BetKMzqTpG0hur7vh5kVbT62CUOHbLzRpmOhM6DhElfdBVKiACAVPE","expires_in":7200}
						if (error) {
							reject(error);
							return;
						}
						const result = JSON.parse(body);
						resolve(result);
					},
				);
			} catch (error) {
				reject(error);
			}
		});
	},
	// 获取用户session_key和openid
	getUserSessionKey: (code) => {
		return new Promise((resolve, reject) => {
			try {
				request.get(
					`${config.wechat_openid_url}?appid=${config.wx_appid}&secret=${config.wx_appSecret}&js_code=${code}&grant_type=${config.wx_grantType}`,
					async (error, response, body) => {
						if (error) reject(error);
						resolve(JSON.parse(body));
					},
				);
			} catch (error) {
				console.log(error);
				reject(error);
			}
		});
	},
};
