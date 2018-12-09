import { ConfigPromise } from './promise'
import { ConfigPlugin, ProcessConfig } from '../config'
import { promiseReadFile } from '../utils'
import { sep } from 'path'

export class ConfigDotenv extends ConfigPromise implements ConfigPlugin{
    static parseDotenvFile(str : Buffer){
        const result = {}
        const lineRegex = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/
        const reomveEndLine = /\\n/gm
        const reomveQuotes = /(^['"]|['"]$)/g
        str.toString().split('\n').forEach(function onLine (line) {
            const keyValueArr = line.match(lineRegex)
            if (keyValueArr != null) {
                const key = keyValueArr[1]
                let value = keyValueArr[2] || ''

                const len = value ? value.length : 0
                if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
                    value = value.replace(reomveEndLine, '\n')
                }
                value = value.replace(reomveQuotes, '').trim()
                result[key] = value
            }
        })

        return result
    }
    public readFile:(filePath:string)=>Promise<Buffer> = promiseReadFile
    public process:{cwd():string} = process

    constructor( protected filePath? : string ){
        super()
    }
    async load(processConfig : ProcessConfig){
        this.cb = async ()=>{
            let filePath = this.filePath
            if (!filePath){
                filePath = `${processConfig.get<string>('CONFIG_FOLDER' , 'string') || this.process.cwd()}${sep}.env`
            }
            try{
                const data = ConfigDotenv.parseDotenvFile( await this.readFile(filePath))
                return data
            }
            catch(e){
                return {}
            }
        }
        super.load(processConfig)
    }
}