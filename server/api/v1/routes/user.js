const router = require('express').Router();
const UsersController = require('../controllers/user');

router.get('/hello', UsersController.hello);

router.get('/:user_id', UsersController.get_user);

router.post('/:user_id', UsersController.new_user);
module.exports = router;
