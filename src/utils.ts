import {readFile , writeFile , readdir} from 'fs'
import {createHash} from 'crypto'

export const promiseReadFile : (fileName:string)=>Promise<Buffer> = promisify<Buffer>(readFile)
export const promiseReadDir : (folderName:string)=>Promise<string[]> = promisify<string[]>(readdir)
export const promiseWriteFile : (fileName:string , data : Buffer | string)=>Promise<void> = promisify<void>(writeFile)
export function orderKeys<T>(obj):T{
    const result:any = {}
    Object.keys(obj).sort().forEach((key)=>{
        result[key] = obj[key]
    })
    return result
}
export function stringToMd5(s:string):string{
    return createHash('md5').update(s).digest('hex')
}
function promisify<T>(original):(...args:any[])=>Promise<T>{
    return function (...args) {
        return new Promise((resolve, reject) => {
            args.push(function callback(err, value) {
                if (err) {
                    return reject(err)
                }

                return resolve(value)
            })
            original.call(this, ...args)
        })
    }
}