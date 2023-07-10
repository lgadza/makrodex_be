import jwt from "jsonwebtoken"
export const createAccessToken=(payload)=>
    new Promise((resolve,reject)=>
    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {expiresIn:"4 hours"},
        (err,token)=>{
            if(err) reject(err);
            else resolve(token);
        }
    )
    );
    export const createLogoutToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1s" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyAccessToken=(token)=>
    new Promise((resolve,reject)=>
    jwt.verify(token,
        process.env.JWT_SECRET,
        (err,
        originalPayLoad)=>{
            if(err) reject(err);
            else resolve(originalPayLoad)
        }))
