const { users } = require('../data');
const { v4: uuidv4 } = require('uuid');

const authController = {
    signup : async (req, res) => {
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
    },
    login : async (req, res) => {
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
    }
}

module.exports = authController;
