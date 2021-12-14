const schedule = require('node-schedule');
const moment = require('moment');

schedule.scheduleJob('1 * * * * *', async () => {
	console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
});
