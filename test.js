const fs = require('fs');
const WxPay = require('wechatpay-node-v3');
const path = require('path');
const config = require('./config/config');

// 使用框架
const pay = new WxPay({
	appid: config.wx_appid,
	mchid: config.wechat_mchid,
	publicKey: fs.readFileSync(path.join(__dirname, './wechatPayCert/apiclient_cert.pem')), // 公钥
	privateKey: fs.readFileSync(path.join(__dirname, './wechatPayCert/apiclient_key.pem')), // 秘钥
});

const body = {
	id: 'df2adf72-4a0d-5082-bc0a-f7b2778dea83',
	create_time: '2022-01-04T23:14:17+08:00',
	resource_type: 'encrypt-resource',
	event_type: 'TRANSACTION.SUCCESS',
	summary: '支付成功',
	resource: {
		original_type: 'transaction',
		algorithm: 'AEAD_AES_256_GCM',
		ciphertext:
			'PODl7gbZxag1a7PdOzzR0JE6BKBjZcn+mjgYTNqiYFt5Eihf5JhKhYfPWRmtuxEV84j3aNQjwg3syQcBQXqDhc3mKa2+gqM/TlW9jgNjRj7E0MgG0htjD5r1CHoVlq+fcXgHxzrYtCGGP2RtdkhelqcJcITE84HvBsB0er5GEc18wWL8JKbdH1///OimQXrhAyJGxwHAWGKJRTl788LoEaHW6wxr1I728P87TREaZfxK0iCrITwTkp4b4pjk7ZRwDfTGR3HX6e2r32LInku/K7RpxUHEco1c3D61NnmgWkR6JjyPmWFIRaKPWkKC5yJVxySEj8BU6OVtZLFKxaySUv8Sem7EBiqkeViwe75e7PqdG3m8ROchGpn6uDuFbX+RH7hMMKRWeOotDl8FU6yzUUGDJZSqpnTAHohHvq/+TC6Phpf88djB7gxj78L77nLDewIkf1Ub3JOVlSzHvFWmJ6fFf4QEsUJYYAYfYxCEl3ULCAo26GycQrFnTmBasQfI8YrIguBaADJqURk5k58g7A4VMiD/qSd4fGrdQ+ZtdGMOk7SjPOzQMTrU1oikjwqPz0XKJUkkhMzwDSJ9NsomPQfkafLgPalkBPxlkH4VbmNeR6FbZaGK0fqQgVvmcEm7Fryz4yBZvm2s+1Vz',
		associated_data: 'transaction',
		nonce: 'n9nVXw8cGqhp',
	},
};
const result = pay.decipher_gcm(
	body.resource.ciphertext,
	body.resource.associated_data,
	body.resource.nonce,
	'ANNDSFPX0NQCGJ3WDH708HX6FJ9PN2P8',
);

console.log(result, 11);
