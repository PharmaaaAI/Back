export class AppError extends Error {
    constructor(message, code, status) {
        super(message);
        this.message = message;
        this.statusCode = code;
        this.status = status;
    }
}

export function create(message, code, status) {
    return new AppError(message, code, status);
}


export default { AppError, create };
