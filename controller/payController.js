const express = require('express');

const router = express.Router();
const payService = require('../service/payService');

// 小程序支付
router.post('/order', (req, res) => {
	payService.order(req, res);
});

module.exports = router;
