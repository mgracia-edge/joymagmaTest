

exports.nxAuthenticationFunction = (req, res, next) => {next()};
exports.wiltelAuthenticationFunction = (req, res, next) => {

    const token = 'L2W-K0C-A3Q-6DR';

    if(
        req.headers.authorization &&
        req.headers.authorization.toLowerCase().split('bearer ')[1] === token.toLowerCase()
    ){
        next();
    }else{
        res.status(403).send({
            error: 0x0021,
            error_dsc:"Acceso denegado, credenciales inválidas."
        });

    }

};
exports.Error = Error_class;
exports.Success = Success_class;


function Error_class(codeObject) {
    this.error = {
        code: codeObject.code,
        message: codeObject.message
    };

    this.data = null
}

function Success_class(payload) {
    this.error = null;
    this.content = payload;
}
