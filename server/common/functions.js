exports.validateReqBody = (validationObject, body) => {
    for (const key of validationObject) {
        if (!body.hasOwnProperty(key.name)) {
            return {
                status: 400,
                json: { error: 'missingPOSTData', message: `Missing value in POST: ${key.name}` }
            }
        }

        if (body[key.name].length < key.min || body[key.name].length > key.max) {
            return {
                status: 400,
                json: { error: 'invalidPOSTData', message: `Invalid value in POST: ${key.name}` }
            }
        }
    }
    return true;
}