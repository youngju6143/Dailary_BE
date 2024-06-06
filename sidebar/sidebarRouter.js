const express = require('express');

const sidebarRouter = express.Router();
const sidebarController = require('./sidebarController'); 

// 사이드바 조회
sidebarRouter.get('/:userId', sidebarController.getSidebar);

module.exports = sidebarRouter;