const moment = require('moment');
const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const subject = require('../models/subject');
const teacher = require('../models/teacher');
const responseUtil = require('../util/responseUtil');
const config = require('../config/config');

const subjectModal = subject(sequelize);
const teacherModal = teacher(sequelize);

module.exports = {
	// 获取所有课程
	getAllSubjectByProjectId: async (req, res) => {
		try {
			const { projectid } = req.query;
			if (!projectid) return res.send(resultMessage.success([]));
			const commonFields = ['id', 'project_id', 'title', 'start_time', 'end_time', 'teacher_ids', 'price'];
			const data = await subjectModal.findAll({
				where: { project_id: projectid, is_delete: 1 },
				attributes: commonFields,
				order: [['sort', 'DESC']],
			});
			const result = responseUtil.renderFieldsAll(data, commonFields);
			let teacher_ids = [];
			result.forEach(async (item) => {
				if (item.teacher_ids) {
					item.teacher_ids = JSON.parse(item.teacher_ids);
					teacher_ids = teacher_ids.concat(item.teacher_ids);
				}
				item.start_time = moment(item.start_time).format('YYYY.MM.DD');
				item.end_time = moment(item.end_time).format('YYYY.MM.DD');
			});
			console.log(teacher_ids, 3232);
			const teacherFields = ['id', 'name', 'photo'];
			let teachers = await teacherModal.findAll({
				where: { id: teacher_ids, is_delete: 1 },
				attributes: teacherFields,
			});
			teachers = responseUtil.renderFieldsAll(teachers, teacherFields);
			teachers.forEach((item) => {
				item.photo = config.preUrl.photoUrl + item.photo;
			});
			await res.send(resultMessage.success({ subjectList: result, teachers }));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
