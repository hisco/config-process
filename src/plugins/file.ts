import { ConfigPromise } from './promise'
import { ConfigPlugin, ProcessConfig } from '../config'
import { promiseReadFile } from '../utils'

export class ConfigJSONFile extends ConfigPromise implements ConfigPlugin{
    public readFile:(filePath:string)=>Promise<Buffer> = promiseReadFile
    constructor( protected filePath : string ){
        super()
    }
    async load(processConfig : ProcessConfig){
        this.cb = async ()=>{
            const data = await this.readFile(this.filePath)
            return JSON.parse(data+'')
        }
        super.load(processConfig)
    }
}