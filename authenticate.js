require("dotenv").config();
const jwt= require("jsonwebtoken");

const authenticate = async (req,res,next)=>{
    if(!req.headers.authorization){
        return res.status(400).send({message: "authoraiztaion token not fount or incorrect"});

    }
    if(!req.headers.authorization.startsWith("Bearer")){
        res.status(400).send({message: "authoraiztaion token not fount or incorrect"})
    };

    const token = req.headers.authorization.trim().split(" ")[1]
let decoded;
try{
    decoded= await verifyToken(token);
}catch(err){
    return res.status(400).send({message: "authoraiztaion token not fount or incorrect"});

}
req.userID = decoded.user._id;
return next();
};

function verifyToken(token){
    return new Promise((res,rej)=>{
        jwt.verify(token,process.env.secret_key,(err,decoded)=>{
            if(err) return rej(err);

            return res(decoded)
        })
    })
}
module.exports= authenticate;