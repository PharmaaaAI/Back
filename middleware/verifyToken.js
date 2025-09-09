import jwt from "jsonwebtoken";
import httpStatusText from '../utils/httpStatusText.js';
import appError from "../utils/appError.js";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if(!authHeader){
        const error = appError.create('token is required', 401, httpStatusText.FAIL);
        return next(error);
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token);
    try{
        const currentUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.currentUser = currentUser;
        next();
    } catch(err) {
    console.error('JWT verification failed:', err.name, err.message);
    // For debugging, respond immediately instead of next(error)
    return res.status(401).json({
        status: 'error',
        message: 'invalid token',
        error: err.message,
        errorName: err.name
    });
}
}

export default verifyToken;