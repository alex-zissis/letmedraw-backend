const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: Number,
    firstName: String,
    lastName: String,
    password: String,
    email: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;