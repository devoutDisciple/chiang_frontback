const express = require('express');

const router = express.Router();
const payService = require('../service/payService');

// 小程序支付,获取paysign
router.get('/paySign', (req, res) => {
	payService.getPaySign(req, res);
});

module.exports = router;
