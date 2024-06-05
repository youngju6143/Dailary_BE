
const { diaries } = require('../data');

const sidebarController = {
    getSidebar: async (req, res) => {
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
    }
}

module.exports = sidebarController;