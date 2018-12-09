import { ProcessConfig, ConfigPlugin,ValueMap } from '../config'

export class ConfigInMemory implements ConfigPlugin{
    public raw:ValueMap = {}
    async load(processConfig : ProcessConfig){

    }
}