import { ConfigPromise } from './promise'
import { ConfigPlugin, ProcessConfig, ValueMap } from '../config'
import { promiseReadFile, promiseReadDir } from '../utils'
import { sep } from 'path'

export class ConfigJSONFolder extends ConfigPromise implements ConfigPlugin{
    public readFile:(filePath:string)=>Promise<Buffer> = promiseReadFile
    public readDir:(filePath:string)=>Promise<string[]> = promiseReadDir
    public process:{cwd():string} = process
    constructor( protected folderPath? : string ){
        super();
    }
    async load(processConfig : ProcessConfig){
        this.cb = async ()=>{
            const env = processConfig.get<string>(processConfig.envKey , 'string') || processConfig.get<string>('NODE_ENV' , 'string') || 'dev'
            const folderPath = this.folderPath || processConfig.get<string>('CONFIG_FOLDER' , 'string') || this.process.cwd()
            const folderBase = `${folderPath}${sep}`
            const commonPath = `${folderPath}${sep}common.json` 
            const envPath = `${folderPath}${sep}${env}.json` 
            const raw:ValueMap = {}
            try {
                const files = await this.readDir(folderBase)
                try{
                    if (files.indexOf('common.json') !=-1)
                    Object.assign(raw,JSON.parse(await this.readFile(commonPath)+''))
                }
                catch(err){
                    throw new Error(`ConfigFileLoadError ${commonPath} {${err.message}}`)
                }
                try{
                    if (files.indexOf(`${env}.json`) !=-1)
                    Object.assign(raw,JSON.parse(await this.readFile(envPath)+''))
                }
                catch(err){
                    throw new Error(`ConfigFileLoadError ${envPath} {${err.message}}`)
                }
            }
            catch(err){
                throw new Error(`ConfigFolderReadError ${folderPath} {${err.message}}`)
            }
            return raw
        }
        return await super.load(processConfig)
    }
}