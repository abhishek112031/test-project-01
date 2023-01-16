const jwt=require('jsonwebtoken');
const User=require('../models/user');
const dotenv=require('dotenv');
dotenv.config();


const authenticate=async(req,res,next)=>{

    try{
        const token=req.header('Authorization');
        console.log(token);
        const user=jwt.verify(token,process.env.SECRET_KEY_TOKEN);//decript the token
        console.log("USERID>>>>>>>>",user.userId);

        User.findByPk(user.userId).then(user=>{
            req.user=user;
            next();
        })

    }
    catch(err){
        console.log(err);
        return res.status(401).json({success:false});

    }
}

module.exports=authenticate;