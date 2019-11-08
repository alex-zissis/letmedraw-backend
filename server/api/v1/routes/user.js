const router = require('express').Router();
const UsersController = require('../controllers/user');

router.get('/hello', UsersController.hello);

router.get('/:user_id', UsersController.get_user);

router.post('/', UsersController.new_user);

router.post('/login', UsersController.login);
module.exports = router;
