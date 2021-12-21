const express = require('express');

const router = express.Router();
const loginService = require('../service/loginService');

// 获取用户基本信息，通过userid
router.post('/loginByWxOpenid', (req, res) => {
	loginService.loginByWxOpenid(req, res);
});

module.exports = router;
