const moment = require('moment');

console.log(moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss'));

const arr = [1, 2, 3, 4, 5, 6];
const func = (a) => {
	console.log(a);
};
arr.map((item) => {
	setTimeout(() => {
		func(item);
	}, 1000);
	return item;
});
