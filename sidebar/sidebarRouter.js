const express = require('express');

const sidebarRouter = express.Router();
const sidebarController = require('./sidebarController'); 


//캘린더 일정 조회
sidebarRouter.get('/:userId', sidebarController.getSidebar);

module.exports = sidebarRouter;