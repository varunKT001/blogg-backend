const jwt = require('jsonwebtoken')

async function checkAuthorized(req, res, next){
    token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.SECRET_KEY, (err, user)=>{
        if(err){
            console.log(err)
            if(err.name == 'TokenExpiredError'){
                return res.json({
                    message: 'token expired'
                })
            }
            else if(err.name == 'JsonWebTokenError' && err.message == 'jwt malformed'){
                return res.json({
                    message: 'jwt malformed'
                })
            }
            else if(err.name == 'JsonWebTokenError' && err.message == 'invalid token'){
                return res.json({
                    message: 'invalid token'
                })
            }
        }
        else{
            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0')
            return next()
        }
    })

}

module.exports = {
    checkAuthorized
}