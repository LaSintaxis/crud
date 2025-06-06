const authJwt = require('./auth');
const verifySignUp = require('./verifySignUp');
const role = require('./role');

module.exports = {
    authJwt: require('./authJwt'),
    verifySignUp: require('./verifySignUp'),
    role: require('./role')
};