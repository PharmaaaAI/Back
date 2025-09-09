import create from "../utils/appError.js";
import ERROR from '../utils/httpStatusText.js';

export default (...roles) => {

    return (req, res, next) => {
        if(!roles.includes(req.currentUser.role))
        {
            return next(create("this role is not authorized", 401, ERROR));
        }
        next();
    }
}