import { ProcessConfig, ConfigPlugin,ValueMap } from '../config'

export class ConfigPromise implements ConfigPlugin{
    public raw:ValueMap = {}
    constructor(protected cb? : ()=>Promise<ValueMap>){
    }
    async load(processConfig : ProcessConfig){
        this.raw = await this.cb()
    }
}