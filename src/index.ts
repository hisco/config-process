import { ProcessConfig , ConfigOptions } from './config'

const processConfig = new ProcessConfig({
    
});

module.exports = Object.assign(processConfig,{
    ProcessConfig,
    ConfigOptions,
    plugins : require('./plugins')
})