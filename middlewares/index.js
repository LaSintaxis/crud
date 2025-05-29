const authJwt = require('./auth')
const verifySignup = require('./verifySignUp')
const role = require('./role')

module.exports = {
    authJwt: require('./authJwt'),
    verifySignup: require('./verifySignUp'),
    role: require('./role')
}