import { EventEmitter } from 'events'
import { getPrimitiveGetter, getGetters } from './getters'
import { ConfigJSONFolder } from './plugins/folder'
import { ConfigEnv } from './plugins/env'
import { ConfigDotenv } from './plugins/dotenv'
import { ConfigInMemory } from './plugins/memory'
import { orderKeys, stringToMd5 } from './utils'


export type ValueGetter = <T>(v:T)=>T 
export type ValueMap = {[key:string]:any}
export class ConfigOptions{
    public loaders? : {[loaderName:string]:ConfigPlugin}
    public processEnv? : {[key:string]:string}
    public envKey? : string
    public loadingOrder? : string[]
    public getHirarchy? : string[]
    public cache? : boolean
    public getters? : {[key:string]:ValueGetter}
    constructor({
        loaders ,
        cache = true,
        processEnv,
        envKey = 'ENVIRONMENT',
        loadingOrder,
        getHirarchy
    }: ConfigOptions = {}){
        this.envKey = envKey;
        this.processEnv = processEnv
        if (loaders){
            this.loaders = loaders
        }
        else{
            this.loaders = {
                env : new ConfigEnv,
                dotenv : new ConfigDotenv,
                fs : new ConfigJSONFolder
            }
        }
        if (this.processEnv && !this.loaders.env){
            this.loaders.env = new ConfigEnv
        }
        if (loadingOrder){
            this.loadingOrder = loadingOrder
        }
        else{
            this.loadingOrder = Object.keys(this.loaders)
        }
        if (getHirarchy){
            this.getHirarchy = getHirarchy
        }
        else{
            this.getHirarchy = [].concat(this.loadingOrder);
        }
        this.cache = cache
        if (!this.loaders || !Object.keys(this.loaders).length){
            throw new Error(`Option 'loaders' must be valid`)
        }
        if (!(this.loadingOrder && this.loadingOrder.length)){
            throw new Error(`Option 'loadingOrder' must be valid`)
        }
        else{
            let missingLoader
            this.loadingOrder.some((loaderName)=>{
                return !this.loaders[loaderName] && !!(missingLoader = loaderName)
            })
            if (missingLoader){
                throw new Error(`Loader '${missingLoader}' is not defined in loaders`)
            }
        }
        if (!(this.getHirarchy && this.getHirarchy.length)){
            throw new Error(`Option 'getHirarchy' must be valid`)
        }
        else{
            let missingLoader
            this.getHirarchy.some((loaderName)=>{
                return !this.loaders[loaderName] && !!(missingLoader = loaderName)
            })
            if (missingLoader){
                throw new Error(`Loader '${missingLoader}' is not defined in loaders`)
            }
        }

    }
}
export interface ConfigPlugin{
    load(processConfig : ProcessConfig):Promise<void>
    raw:{[key:string]:any}
}
export class ProcessConfig extends EventEmitter{
    protected loaders:ConfigPlugin[] = []
    protected options:ConfigOptions
    protected getters:{[key:string]:ValueGetter} = {}
    protected getHirarchy:string[]
    protected mergedConfig:{[key:string]:any} = {}
    protected isLoaded : boolean = false
    protected currentLoading : Promise<void>
    protected cache:ValueMap = {}
    public processEnv:ValueMap
    protected version:string
    public envKey:string
    constructor(options : ConfigOptions | {[key:string]:any}){
        super()
        this.options = new ConfigOptions(options)
        this.envKey = options.envKey;
        this.getters = getGetters(this.options.getters)
        this.getHirarchy = [].concat(this.options.getHirarchy)
        this.processEnv = this.options.processEnv || process.env
        this.init()
    }
    protected init(){
        this.start()
    }
    protected async start(){
        this.loaders = [new ConfigInMemory]
        this.currentLoading = this.loadByOrder()
        await this.currentLoading
        this.isLoaded = true
        this.currentLoading = null
    }
    protected async ready(){
        return this.isLoaded ? true : await this.currentLoading
    }
    protected async loadByOrder(){
        let {currentLoading} = this
        if (currentLoading)
            return currentLoading
        this.emit('sync')
        this.cache = {}
        for (let i=0;i<this.options.loadingOrder.length;i++){
            const loaderName = this.options.loadingOrder[i]
            const loader = this.options.loaders[loaderName]

            await loader.load(this)
            this.loaders.push(loader)
            this.syncFromPlugins(this.getMerged())
            this.emit('synced')
        }
        this.isLoaded = true
    }
    protected syncFromPlugins(mergedConfig){
        const lastVersion = this.version

        this.mergedConfig = orderKeys(mergedConfig)
        this.version = stringToMd5(JSON.stringify(mergedConfig))
        if (this.version != lastVersion){
            this.emit('change')
        }
    }
    private getLoadersByHirarchy():ConfigPlugin[]{
        const loaders = this.getHirarchy.map((loaderName)=>{
            return this.options.loaders[loaderName]
        })
        return [this.loaders[0]].concat(loaders)
    }
    public getMerged(){
        const mergedConfig = {}
        this.getLoadersByHirarchy().reverse().forEach((loader : ConfigPlugin)=>{
            Object.assign(mergedConfig ,loader.raw )
        })
        return mergedConfig
    }
    public getMergedKey(key:string){
        let mergedValue
        this.getLoadersByHirarchy().some((loader : ConfigPlugin)=>{
            mergedValue = loader.raw[key]
            return loader.raw.hasOwnProperty(key)
        })
        return mergedValue
    }
    public set<T>(key : string , value : T):void{
        if (this.options.cache){
            Object.keys(this.cache).forEach((cacheKey)=>{
                if (cacheKey.split(',').slice(1).join(',')==key){
                    delete this.cache[cacheKey]
                }
            })
        }
        this.loaders[0].raw[key] = value
        this.mergedConfig[key] = this.getMergedKey(key)
        this.syncFromPlugins(this.mergedConfig)
    }
    public get<T>(key:string , userGetter? : string | ValueGetter):T{
        const isPrimitiveGetter = typeof userGetter == 'string'
        let cacheKey
        if (this.options.cache && (!userGetter || !isPrimitiveGetter)){
            cacheKey = `${isPrimitiveGetter?userGetter:'none'},${key}`
            if (this.cache.hasOwnProperty(cacheKey)){
                return this.cache[cacheKey]
            }
        }
        let value = this.mergedConfig[key]
        let getter
        if (isPrimitiveGetter)
            getter = getPrimitiveGetter(userGetter)
        else if( typeof userGetter == 'function')
            getter = userGetter
        else 
            getter = this.getters[key]

        const result = (getter ? getter.apply(this,[value]) : value)
        if (this.options.cache )
            return this.cache[cacheKey] = result
        else
            return result
    }
}   