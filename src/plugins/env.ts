import { ValueMap, ConfigPlugin, ProcessConfig } from "../config";

export class ConfigEnv implements ConfigPlugin{
    public raw:ValueMap
    public process:{env:ValueMap} = process
    constructor(){

    }
    async load(processConfig : ProcessConfig){
        this.raw = processConfig.processEnv
    }
}