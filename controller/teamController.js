const express = require('express');

const router = express.Router();
const teamService = require('../service/teamService');

// 获取用户基本信息，通过userid
router.get('/teamDetailByTeamUuid', (req, res) => {
	teamService.getTeamDetailByTeamUuid(req, res);
});

module.exports = router;
