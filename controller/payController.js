const express = require('express');

const router = express.Router();
const payService = require('../service/payService');

// 小程序支付,获取paysign
router.get('/paySign', (req, res) => {
	payService.getPaySign(req, res);
});

// 支付报名费用
router.post('/paySignup', (req, res) => {
	payService.paySignup(req, res);
});

// 处理微信支付返回接口
router.post('/handleWechatPay', (req, res) => {
	payService.handleWechatPay(req, res);
});

// 请求微信退款
router.post('/refunds', (req, res) => {
	payService.payRefunds(req, res);
});

// 处理微信支付返回接口
router.post('/handleWechatRefunds', (req, res) => {
	payService.handleWechatRefunds(req, res);
});

module.exports = router;
