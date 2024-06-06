const app = require('./express');

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log('서버 실행 🍀');
});
