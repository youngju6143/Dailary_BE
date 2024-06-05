const express = require('express');

const diaryRouter = express.Router();
const diaryController = require('./diaryController'); 

const multer = require('multer')
const multerS3 = require('multer-s3')
const { S3 } = require('@aws-sdk/client-s3');
const path = require('path');


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

// 일기 조회
diaryRouter.get('/:userId', diaryController.getDiary);

// 일기 작성
diaryRouter.post('/write', upload.single('img'), diaryController.postDiary);

// 일기 수정
diaryRouter.put('/:diaryId', upload.single('img'), diaryController.putDiary);

// 일기 삭제
diaryRouter.delete('/:diaryId', diaryController.deleteDiary);

module.exports = diaryRouter;
