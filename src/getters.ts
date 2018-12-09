
export function getGetters(getters){
    const result = {}
    if (getters){
        Object.keys(getters).forEach(function(getterName , key){
            const getter = getters[getterName]
            if (typeof getter == 'function'){
                result[key] = getter
            }
            else if(typeof getter == 'string'){
                var resultGetter = getPrimitiveGetter(getter)
                if (resultGetter)
                    result[key] = resultGetter
            }
        })
    }
    return result
}

export function getPrimitiveGetter(getter){
    switch (getter){
        case 'integer':
            return intGetter
        case 'float':
            return floatGetter
        case 'string':
            return stringGetter
        case 'object':
        case 'array':
            return jsonGetter
        case 'boolean':
            return booleanGetter
    }
}

function stringGetter(data){
    return data
}
function booleanGetter(data){
    return (data == 'true' || data == true)
}
function intGetter(data){
    return (parseInt(data))
}

function floatGetter(data){
    return (parseFloat(data))

}
function jsonGetter(data){
    try {
        return JSON.parse(data)
    }
    catch(err){
        return {}
    }
}
