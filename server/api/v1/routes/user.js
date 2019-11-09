const router = require('express').Router();
const UsersController = require('../controllers/user');

router.get('/hello', UsersController.helloHandler);

router.get('/:user_id', UsersController.getUserHandler);

router.post('/', UsersController.newUserHandler);

router.post('/login', UsersController.loginHandler);
module.exports = router;
