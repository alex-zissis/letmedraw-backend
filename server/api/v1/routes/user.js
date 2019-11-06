const router = require('express').Router();
const UsersController = require('../controllers/user');

router.get('/hello', UsersController.hello);

module.exports = router;
