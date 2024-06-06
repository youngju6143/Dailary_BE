const express = require('express');

const calendarRouter = express.Router();
const calendarController = require('./calendarController'); 

// 캘린더 일정 조회
calendarRouter.get('/:date/:userId', calendarController.getCalendar);

// 캘린더 일정 추가
calendarRouter.post('/write', calendarController.postCalendar );

// 일정 수정
calendarRouter.put('/:calendarId', calendarController.putCalendar);

//일정 삭제
calendarRouter.delete('/:calendarId', calendarController.deleteCalendar);

module.exports = calendarRouter;