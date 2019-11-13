const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect(`mongodb://${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`, { useNewUrlParser: true });

const saltRounds = 10;

const User = require('../../../models/User');
const commonFuncs = require('../../../common/functions');

const hashAndSalt = async (plainTextPassword) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plainTextPassword, salt);
    return hash;
}

const validatePassword = (plainTextPassword) => {
    //TODO
    return true;
}

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const validateUsername = (username) => {
    return /^[a-z0-9_-]{3,30}$/.test(username)
}

const getUser = async (userId) => {
    let user;
    try {
        user = await User.findOne({ userId: userId, deleted: false }, 'userId firstName lastName username email').exec();
    } catch (e) {
        return { status: 500, json: { error: 'undefinedError', message: "Something went wrong" } }
    }

    if (user === null) return { status: 400, json: { error: 'doesNotExist', message: "User does not exist" } }

    return {
        status: 200,
        json: user
    }
}

const checkUserId = async (userId) => {
    return await User.findOne({ userId: userId }).exec() === null;
}

const generateUserId = async () => {
    let valid = false;
    const attempts = 5;
    let cnt = 0;
    let userId;
    while (!valid && cnt < attempts) {
        userId = Math.floor(Math.random() * 100000000);
        valid = await checkUserId(userId);
        cnt++;
    }

    return valid ? userId : null;
}

const newUser = async (firstName, lastName, email, username, plainTextPassword) => {
    const userId = await generateUserId();
    if (userId === null) return { status: 500, json: { error: "idGenerationError", message: "There was an error generating the user id, please try again" } }

    let password = '';

    try {
        password = await hashAndSalt(plainTextPassword);
    } catch (e) {
        return { status: 500, json: { error: "passwordHashingError", message: "There was an error hashing the password, please try again." } }
    }

    const user = new User({ userId: userId, firstName: firstName, deleted: false, lastName: lastName, password: password, email: email, username: username });
    let result;

    try {
        result = await user.save();
    } catch (e) {
        if (e.name === "MongoError" && e.code === 11000) {
            const field = e.message.split("index:")[1].split("dup key")[0].split("_")[0].trim();
            return { status: 400, json: { error: "duplicateKeyError", message: `Duplicate key on field ${field}`, field: field } }
        } else {
            return { status: 500, json: { error: "undefinedError", message: `There was an error inserting the record into the database` } }
        }
    }

    return {
        status: 201,
        json: {
            userId: result.userId,
            username: result.username,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
        }
    }
}

const deleteUser = async userId => {
    let user;
    try {
        user = await User.findOne({ userId: userId, deleted: false }).exec();
        if (user === null) return { status: 400, json: { error: "doesNotExist", message: `User does not exist` } }
        user.deleted = true;
        await user.save();
    } catch (e) {
        return { status: 500, json: { error: 'undefinedError', message: "Something went wrong" } }
    }

    return { status: 200, json: { message: "User deleted successfully" } }
}

const login = async (email, password) => {
    let user;
    try {
        user = await User.findOne({ email: email, deleted: false }).exec();
    } catch (e) {
        return { status: 500, json: { error: 'undefinedError', message: "Something went wrong" } }
    }

    if (user === null) return { status: 400, json: { error: "doesNotExist", message: `Email does not exist` } }

    let match;
    try {
        match = await bcrypt.compare(password, user.password);
    } catch (e) {
        return { status: 500, json: { error: 'undefinedError', message: "Something went wrong" } }
    }

    if (!match) return { status: 403, json: { error: "invalidPassword", message: `Invalid Password` } }

    // TODO - JWT

    return {
        status: 200,
        json: { message: "Login successful" }
    }
}

const getAllUsers = async () => {
    let users;
    try {
        users = await User.find({ deleted: false }, 'userId firstName lastName username email').exec();
    } catch (e) {
        return { status: 500, json: { error: 'undefinedError', message: "Something went wrong" } }
    }

    return { status: 200, json: users }
}

exports.helloHandler = async (req, res, next) => {
    res.status(200).json({ 'status': 'hello' });
};

exports.getAllUsersHandler = async (req, res, next) => {
    const result = await getAllUsers();
    return res.status(result.status).json(result.json);
}

exports.getUserHandler = async (req, res, next) => {
    const result = await getUser(req.params.user_id);
    return res.status(result.status).json(result.json);
}

exports.newUserHandler = async (req, res, next) => {
    const validationRes = commonFuncs.validateReqBody(
        [
            { name: 'password', min: 8, max: 30 },
            { name: 'firstName', min: 2, max: 50 },
            { name: 'lastName', min: 2, max: 50 },
            { name: 'email', min: 5, max: 80 },
            { name: 'username', min: 3, max: 30 },
        ], req.body
    );

    if (validationRes !== true) return res.status(validationRes.status).json(validationRes.json);

    if (!validatePassword(req.body.password)) return res.status(400).json({ error: 'invalidPassword', message: `Password doesn't meeet validity requirements` });
    if (!validateEmail(req.body.email)) return res.status(400).json({ error: 'invalidEmail', message: `Email is not valid` });
    if (!validateUsername(req.body.username)) return res.status(400).json({ error: 'invalidUsername', message: `Username is not valid` });

    const newUserResult = await newUser(req.body.firstName, req.body.lastName, req.body.email, req.body.username, req.body.password);

    return res.status(newUserResult.status).json(newUserResult.json);
}

exports.deleteUserHandler = async (req, res, next) => {
    if (req.params.user_id === null && req.params.user_id === undefined) return res.status(400).json({ error: 'noUserId', message: 'User ID not provided' })
    const result = await deleteUser(req.params.user_id);
    return res.status(result.status).json(result.json);
}

exports.loginHandler = async (req, res, next) => {
    const validationRes = commonFuncs.validateReqBody(
        [
            { name: 'password', min: 8, max: 30 },
            { name: 'email', min: 5, max: 80 },
        ], req.body
    );
    if (validationRes !== true) return res.status(validationRes.status).json(validationRes.json);

    const result = await login(req.body.email, req.body.password);
    res.status(result.status).json(result.json);
}