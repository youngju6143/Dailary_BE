const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const path = require('path');

const { S3 } = require('@aws-sdk/client-s3');

const multer = require('multer')
const multerS3 = require('multer-s3')
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const s3 = new S3({
    region: 'ap-northeast-2',
    credentials: {
        //accessKeyId의 경우는 공개되지 않도록 환경변수로 설정
        accessKeyId: process.env.S3_ACCESS_KEY,
        //secretAccessKey도 공개되지 않도록 환경변수 설정
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
})

const upload = multer({  
    storage: multerS3({       
      s3: s3,
      bucket: 'dailary',
      key: function (req, file, cb) {
        cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

const users = [];
let diaries = [];
let calendars = [];

app.get('/', (req, res) => {
    res.send('Hello, server!');
});

// 회원가입 엔드포인트
app.post('/signup', (req, res) => {
    const userId = uuidv4();
  const { userName, password } = req.body;
  const existingUser = users.find(user => user.userName === userName);
  if (existingUser) {
    res.status(400).json({ 
        success: false,
        code: 400,
        error: '이미 존재하는 회원입니다.' 
    });
  } else {
    // 새로운 사용자 정보를 배열에 추가
    const newUser = { 
        userId: userId, 
        userName: userName, 
        password: password 
    };
    users.push(newUser);
    res.status(201).json({
        success: true,
        code: 201,
        message: '회원가입이 성공적으로 완료되었습니다.' 
    });
  }
});

// 로그인 엔드포인트
app.post('/login', (req, res) => {
    const { userName, password } = req.body;
    const user = users.find(user => user.userName === userName && user.password === password);
    console.log(userName)
    console.log(password)
    if (user) {
        res.status(200).json({
        success: true,
        code: 200,
        message: '로그인에 성공하였습니다.',
        userId: user.userId,
        // 로그인한 사용자의 userId도 반환
        });
    } else {
        res.status(401).json({
        success: false,
        code: 401,
        error: '존재하지 않는 유저이거나 비밀번호가 일치하지 않습니다.'
        });
    }
});

// 일기 조회
app.get('/diary/:userId', (req, res) => {
    const userId = req.params.userId;
    const userDiaries = diaries.filter(diary => diary.userId === userId);
    if (userId.length !== 0) {
        if (userDiaries.size !== 0) {
            res.json({ 
                success: 'true',
                code: 200,
                message: '일기를 성공적으로 조회하였습니다.',
                data: userDiaries
            });
        } else {
            res.json({ 
                success: 'true',
                code: 200,
                message: '아직 일기를 쓰지 않았습니다.',
                data: []
            });
        }
        console.log('일기 조회 get API 연결 성공', userDiaries);
    } else {
        res.status(404).json({ 
            success: 'false',
            code: 404,
            message: 'userId가 전달되지 않았거나, 존재하지 않는 유저입니다.',
            data: []
        });
    }
});

// 사이드바 조회
app.get('/sidebar/:userId', (req, res) => {
    const userId = req.params.userId;
    if (userId.length !== 0) {
        const userDiaries = diaries.filter(diary => diary.userId === userId);
        const countingArray = {};
        // 감정 개수 카운팅한 배열
        userDiaries.forEach(diary => {
            const emotion = diary.emotion;
            console.log("Emotion: ", emotion);
            if (countingArray[emotion]) {
                countingArray[emotion]++;
            } else {
                countingArray[emotion] = 1;
            }
            });
        // 사용자 일기 카운팅한 배열
        const userDiariesCount = userDiaries.length;
        countingArray.userDiariesCount = userDiariesCount;

        // JSON.stringify()를 사용하여 객체를 JSON 문자열로 변환하여 보냄
        res.send(JSON.stringify(countingArray));
        console.log(countingArray);
    } else {
        res.status(404).json({ 
            success: 'false',
            code: 404,
            message: 'userId가 전달되지 않았거나, 존재하지 않는 유저입니다.',
        });
    }
});

// 일기 작성
app.post('/diary_write', upload.single('img'), (req, res) => {
    const diaryId = uuidv4();
    const userId = req.body.userId;
    const date = req.body.date;
    const emotion = req.body.emotion;
    const weather = req.body.weather;
    const content = req.body.content;
    const imgURL = req.file ? req.file.location : ''; // 이미지 URL

    const parsedDate = date.slice(0, 10);

    if (userId.length !== 0) {
        const newData = {
            diaryId: diaryId,
            userId: userId,
            date: parsedDate,
            emotion: emotion,
            weather: weather,
            content: content,
            imgURL: imgURL // 이미지 URL 추가
        };
        diaries.unshift(newData);
        // 데이터 저장 등의 작업 수행
        res.status(200).json({ 
            success: true,
            code: 200,
            message: '일기를 성공적으로 작성하였습니다.',
            diaryId: diaryId
        });
        console.log('일기 작성 post API 연결 성공', diaries);
        console.log('이미지 URL : ', imgURL);
    } else {
        res.status(404).json({ 
            success: false,
            code: 404,
            message: '존재하지 않는 유저입니다.',
        });
    }
});


// 일기 수정
app.put('/diary/:diaryId', upload.single('img'), (req, res) => {
    const diaryId = req.params.diaryId; // 수정할 일기의 ID
    const { userId, date, emotion, weather, content } = req.body; // 수정할 내용
    let imgURL = '';
    if (req.file) {
        imgURL = req.file.location;
    } else {
        imgURL = req.body.imgURL;
    }
    
    const parsedDate = date.slice(0, 10);
    // 일기를 찾아서 수정
    const index= diaries.findIndex(diary => diary.diaryId === diaryId);
    if (index !== -1) {
        // 수정된 내용으로 일기 업데이트
        diaries[index] = {
            diaryId: diaryId,
            userId: userId,
            date: parsedDate,
            emotion: emotion,
            weather: weather,
            content: content,
            imgURL : imgURL
        };
        console.log('일기 수정 put API 연결 성공', diaries[index]);
        res.send({ 
            success: true,
            code: 200,
            message: '일기가 수정되었습니다.', 
            data: diaries[index] 
        });
    } else {
        res.status(404).json({ 
            success: true,
            code: 404,
            message: '일기를 찾을 수 없습니다.',
        });
    }
});

// 일기 삭제
app.delete('/diary/:diaryId', (req, res) => {
    const diaryId = req.params.diaryId; // 삭제할 일기의 ID

    const index = diaries.findIndex(diary => diary.diaryId === diaryId);
    if (index !== -1) {
        diaries.splice(index, 1); // 배열에서 해당 일기를 삭제
        console.log('일기 삭제 delete API 연결 성공', diaries);
        res.status(200).json({ 
            success: true,
            code: 200,
            message: '일기가 삭제되었습니다.' 
        });
    } else {
        res.status(404).json({ 
            success: false,
            code: 404,
            message: '해당 ID를 가진 일기를 찾을 수 없습니다.' 
        });
    }
});


//캘린더 일정 조회
app.get('/calendar/:date/:userId', (req, res) => {
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


});

// 캘린더 일정 추가
app.post('/calendar', (req, res) => {
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

})

// 일정 수정
app.put('/calendar/:calendarId', (req, res) => {
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
})

//일정 삭제
app.delete('/calendar/:calendarId', (req, res) => {
    const calendarId = req.params.calendarId;

    const index = calendars.findIndex(calendar => calendar.calendarId === calendarId);
    if (index !== -1) {
        res.json({ 
            success: 'true',
            code: 200,
            message: '일정이 성공적으로 삭제되었습니다',
        });
        calendars.splice(index, 1); // 배열에서 해당 일기를 삭제
        console.log('일정 삭제 delete API 연결 성공', diaries);
    } else {
        res.status(404).json({ 
            success: 'false',
            code: 404,
            message: '해당 ID를 가진 일정을 찾을 수 없습니다.' 
        });
    }
});

// app.listen(8080, function () {
//  console.log('listening on 8080')
// }); 

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
