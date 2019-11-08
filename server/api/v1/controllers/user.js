const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost:27017/letmedraw', { useNewUrlParser: true });

const saltRounds = 10;

const User = require('../../../models/User');

const hashAndSalt = async (plainTextPassword) => {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(plainTextPassword, salt);
    return hash;
}

exports.hello = async (req, res, next) => {
    res.status(200).json({ 'status': 'hello' });
};

exports.get_user = async (req, res, next) => {
    // SELECT user_id, firstName, surname FROM users WHERE user_id = ${req.params.userId}
    res.status(200).json({ userId: req.params.user_id, firstName: 'Alex', lastName: 'Zissis' });
}

exports.new_user = async (req, res, next) => {
    const userId = Math.floor(Math.random() * 1000000);

    const password = await hashAndSalt(req.body.password);

    const user = new User({ userId: userId, firstName: req.body.firstName, lastName: req.body.lastName, password: password, email: req.body.email });
    const result = await user.save();

    // INSERT INTO users (firstName, lastName) VALUES (${req.body.firstName}, ${req.body.lastName});
    res.status(200).json({ status: 'success' });
}

exports.login = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    const result = await bcrypt.compare(req.body.password, user.password);

    const returnCode = result ? 200 : 403;
    res.status(returnCode).json({ 'status': result });
}