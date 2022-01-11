const express = require('express');

const router = express.Router();
const orderService = require('../service/orderService');

// 根据用户id和课程id获取详情
router.get('/orderDetailByUserid', (req, res) => {
	orderService.getOrderDetailByUserid(req, res);
});

module.exports = router;
