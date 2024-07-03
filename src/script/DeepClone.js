const DeepClone = function(source) {
    let target;
    if (typeof source === 'object') {
        if (Array.isArray(source)) {
            target = [];
            for (let key in source) {
                target[key] = DeepClone(source[key]);
            }
        } else if(source===null) {
            target = null;
        } else if(source.constructor===RegExp){
            target = source;
        } else {
            target = {};
            for (let key in source) {
                target[key] = DeepClone(source[key]);
            }
        }
    } else {
        target = source;
    }
    return target;
}

export default DeepClone;