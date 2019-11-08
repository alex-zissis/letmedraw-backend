exports.hello = async (req, res, next) => {
    res.status(200).json({ 'status': 'hello' });
};

exports.get_user = async (req, res, next) => {
    // SELECT user_id, firstName, surname FROM users WHERE user_id = ${req.params.userId}
    res.status(200).json({ userId: req.params.user_id, firstName: 'Alex', lastName: 'Zissis' });
}

exports.new_user = async (req, res, next) => {
    console.log(req.body);
    // store that in the data
    // INSERT INTO users (firstName, lastName) VALUES (${req.body.firstName}, ${req.body.lastName});
    res.status(200).json({status: 'success'});
}