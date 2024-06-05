const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const path = require('path');
require("dotenv").config();

const { S3 } = require('@aws-sdk/client-s3');
const { diaries } = require('../data');

const diaryController = {
    getDiary : async (req, res) => {
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
    },
    postDiary : async (req, res) => {
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
    },
    putDiary : async (req, res) => {
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
    },
    deleteDiary : async (req, res) => {
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
    },
    
}

module.exports = diaryController;