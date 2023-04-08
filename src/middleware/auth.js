const jwt = require('jsonwebtoken');
const Register = require('../models/registers');

//agr user login nhi kia to mtlb cookie generate nhi hogi tb hum secret page access nhi kr paynge 
//login krne pr hi token generate hoga tbhi hm acess kr skte h verify krke

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;     //ye hum user ka token get krwaynge fir hum verify krwaynge
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        console.log(verifyUser);
        

        const user= await Register.findOne({_id: verifyUser._id});
        console.log(user);
        req.token = token;
        req.user = user;

        next();

    } catch (error) {
        res.status(500).send(error);
    }
}

module.exports = auth;