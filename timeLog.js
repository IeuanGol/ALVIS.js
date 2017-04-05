class TimeLog {
	constructor(date) {
		this.date1 = date;
		this.date2 = 0;
		this.date3 = 0;
		this.date4 = 0;
		this.date5 = 0;
		this.date6 = 0;
		this.date7 = 0;
		this.date8 = 0;
		this.date9 = 0;
		this.date10 = 0;
	}

	update(date) {
		this.date10 = this.date9;
		this.date9 = this.date8;
		this.date8 = this.date7;
		this.date7 = this.date6;
		this.date6 = this.date5;
		this.date5 = this.date4;
		this.date4 = this.date3;
		this.date3 = this.date2;
		this.date2 = this.date1;
		this.date1 = date;
	}
}

module.exports = TimeLog;
