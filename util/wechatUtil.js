const fs = require('fs');
const WxPay = require('wechatpay-node-v3');
const path = require('path');
const request = require('request');
const config = require('../config/config');
const ObjectUtil = require('./ObjectUtil');

// 使用框架
const pay = new WxPay({
	appid: config.wx_appid,
	mchid: config.wechat_mchid,
	publicKey: fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_cert.pem')), // 公钥
	privateKey: fs.readFileSync(path.join(__dirname, '../wechatPayCert/apiclient_key.pem')), // 秘钥
});

module.exports = {
	// 微信支付，获取签名
	payByWechat: ({ money, openId, userid, type, ...rest }) => {
		// money:单位元，微信支付单位是分
		// openid:用户的openid
		return new Promise(async (resolve, reject) => {
			try {
				const params = {
					// 订单编号
					out_trade_no: ObjectUtil.getRandomStr(32),
					notify_url: config.wechat_pay_notify_url,
					amount: {
						total: Number((money * 100).toFixed(0)), // 单位分
						currency: 'CNY',
					},
					attach: JSON.stringify({
						userid,
						// 唯一的支付编号
						uuid: `${ObjectUtil.getRandomStr(16)}_${new Date().getTime()}`,
						// 1-报名费用 2-组团费用
						type,
						open_id: openId,
					}),
					payer: { openid: openId },
					...rest,
				};
				const result = await pay.transactions_jsapi(params);
				console.log(result, 222);
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

	// 解密回调数据
	getNotifyMsg: (body) => {
		// 返回的数据
		// {
		// 	id: '32d57372-3153-59cf-a59e-df9f831316b6',
		// 	create_time: '2022-01-04T21:44:00+08:00',
		// 	resource_type: 'encrypt-resource',
		// 	event_type: 'TRANSACTION.SUCCESS',
		// 	summary: '支付成功',
		// 	resource: {
		// 		original_type: 'transaction',
		// 		algorithm: 'AEAD_AES_256_GCM',
		// 		ciphertext:
		// 			'uPvSsbOLNeotgNLKMM6qBfvPuAM/gZdBdjCHDAgVG9Ji1p4ie8w76oouYoX5I8eosBbLFzXMFeBRHsYmL6s0v9d0J0te+DAp5R1uHXbQR/dO98Mhym6fM/bj/gXKJPCwsYeIu8aKRvyMdK1VPkq6jFIUt4i8fxEImm7IwMIWr5jrWKA1vQzq7APahrc9bPTDGosi0UI0t9TaKjY4KnrEYX7oa/wM390fUDFWES3P5yefQuvyW2WV2Y7br2QmVoETljACT1rT2g33+R/6Fn+LIdARUP7EDSMZqAP1K6d4D4My8qMtWUbNYs2bbV+A84++aYHqgik8zI70L0Jmsko6SMolQ/KgpGIbhiBtLMCsWZ+5KqWzyW/GhDm+UINLC7iGU2w2nVqLJZE41O2V+dOeAru2VgolzVgHXLg3U5kpTAdIoV1Wmo0mSP3B8sDSchQ41YiaHIbj9CW7VO7/eSEZ7DXZlkua+mQksJEphtd/BUwQ/HjmBvC36Lq/I7aS1IlJINOxJF17Pvr38rZcA85F9+q+BOGLru8JvgBFqCXASBuU3I6D3RFxNM5JZtIrFAmJ7a5lDat7ZO0w98j1pS8O',
		// 		associated_data: 'transaction',
		// 		nonce: 'iAB5rtnU5wGs',
		// 	},
		// };

		// 解密后的数据
		// {
		// 	mchid: '1618427379',
		// 	appid: 'wx768242fa111870e0',
		// 商户系统内部订单号
		// 	out_trade_no: 'V5B65AN1B8WIUEUHBBBMNP3TT4IVXAH6',
		// 微信支付订单号
		// 	transaction_id: '4200001307202201041047839633',
		// 交易类型交易类型，枚举值： JSAPI：公众号支付 NATIVE：扫码支付 APP：APP支付 MICROPAY：付款码支付 MWEB：H5支付 FACEPAY：刷脸支付
		// 	trade_type: 'JSAPI',
		// 交易状态，枚举值： SUCCESS：支付成功 ,REFUND：转入退款 ,NOTPAY：未支付 ,CLOSED：已关闭 ,REVOKED：已撤销（付款码支付） ,USERPAYING：用户支付中（付款码支付） ,PAYERROR：支付失败(其他原因，如银行返回失败)
		// 	trade_state: 'SUCCESS',
		// 	trade_state_desc: '支付成功',
		// 付款银行
		// 	bank_type: 'OTHERS',
		// 附加数据 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。
		// 	attach: '',
		// 	success_time: '2022-01-04T21:44:00+08:00',
		// 	payer: { openid: 'odZ0M5iAUE3HxagunKf7kA7qbBBQ' },
		// 	amount: { total: 1, payer_total: 1, currency: 'CNY', payer_currency: 'CNY' },
		// };
		return new Promise(async (resolve, reject) => {
			try {
				if (!body || !body.resource || !body.resource.ciphertext) {
					reject({});
				}
				const result = pay.decipher_gcm(
					body.resource.ciphertext,
					body.resource.associated_data,
					body.resource.nonce,
					config.wx_apiv3_secret,
				);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	},
};
