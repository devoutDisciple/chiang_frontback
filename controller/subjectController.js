const express = require('express');

const router = express.Router();
const subjectService = require('../service/subjectService');

// 获取所有课程，根据班级id
router.get('/allSubjectByProjectId', (req, res) => {
	subjectService.getAllSubjectByProjectId(req, res);
});

module.exports = router;
