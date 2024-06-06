const { v4: uuidv4 } = require('uuid');

const { diaries, calendars } = require('../data');

const calendarController = {
    getCalendar : async (req, res) => {
        const requestedDate = req.params.date;
        const userId = req.params.userId;
        const filteredCalendars = calendars.filter(calendar => calendar.date === requestedDate && calendar.userId === userId);
        if (userId.length !== 0) {
            if (filteredCalendars.length > 0) {
                res.status(200).json({ 
                    success: true,
                    code: 200,
                    message: '일정을 성공적으로 조회하였습니다.',
                    data: filteredCalendars
                });
                console.log('일정 조회 get API 연결 성공', req.body);
            } else {
                res.status(200).json({ 
                    success: true,
                    code: 200,
                    message: '일정이 없습니다.',
                    data: []
                });
            }
        } else {
            res.status(404).json({ 
                success: false,
                code: 404,
                message: '존재하지 않는 유저입니다.',
            });
        }
    },

    postCalendar : async (req, res) => {
        const calendarId = uuidv4();
        const {userId, date, startTime, endTime, text} = req.body;
        if (userId.length !== 0) {
            const newData = {
                calendarId: calendarId,
                userId: userId,
                date: date, 
                startTime: startTime, 
                endTime: endTime, 
                text: text
            }
            console.log(calendarId);
            calendars.push(newData);
            res.status(200).json({ 
                success: true,
                code: 200,
                message: '일정을 성공적으로 추가하였습니다.',
                calendarId: calendarId,
            });
            console.log('일정 작성 post API 연결 성공', req.body);
        } else {
            res.status(404).json({ 
                success: false,
                code: 404,
                message: '존재하지 않는 유저입니다.',
            });
        }
    },

    putCalendar : async (req, res) => {
        const calendarId = req.params.calendarId;
        const {userId, date, startTime, endTime, text} = req.body;
        
        const index = calendars.findIndex(calendar => calendar.calendarId === calendarId);
        if (index !== -1) {
            calendars[index] = {
                calendarId: calendarId,
                userId: userId,
                date: date,
                startTime: startTime,
                endTime: endTime, 
                text: text
            }
            console.log('일정 수정 put API 연결 성공', req.body);
            res.status(200).json({ 
                success: true,
                code: 200,
                message: '일정이 수정되었습니다',
                data: calendars[index]
            });
        } else {
            res.status(404).json({
                success: false,
                code: 404,
                message: '일정을 찾을 수 없습니다.' 
            });
        }
    },
    deleteCalendar : async (req, res) => {
        const calendarId = req.params.calendarId;

        const index = calendars.findIndex(calendar => calendar.calendarId === calendarId);
        if (index !== -1) {
            res.json({ 
                success: 'true',
                code: 200,
                message: '일정이 성공적으로 삭제되었습니다',
            });
            calendars.splice(index, 1); // 배열에서 해당 일정을 삭제
            console.log('일정 삭제 delete API 연결 성공', diaries);
        } else {
            res.status(404).json({ 
                success: 'false',
                code: 404,
                message: '해당 ID를 가진 일정을 찾을 수 없습니다.' 
            });
        }
    }
}

module.exports = calendarController;
