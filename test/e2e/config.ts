const {ProcessConfig , ConfigOptions , plugins} = require('../../src/index');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-spies'));

describe('config e2e' , ()=>{
    describe('config with in memory',async ()=>{
        let config;
        let memory;
        beforeEach(()=>{
            memory = new plugins.ConfigInMemory;
            config = new ProcessConfig({
                loaders : {
                    'memory1' : memory
                },
                processEnv : {
                    'test':'1'
                },
                loadingOrder : ['env','memory1']
            });
        })
        it('Should take value from processEnv',async ()=>{
            await config.ready()
            expect(config.get('test')).to.eq('1'); 
        })
        it('Should overide value value from processEnv',async ()=>{
            await config.ready()
            expect(config.get('test')).to.eq('1'); 
            config.set('test' , '23');
            expect(config.get('test')).to.eq('23'); 
        })
        it('Version hash should relflact config values',async ()=>{
            await config.ready();
            const hashBeforeChange = config.version;
            config.set('test' , '23');
            expect(hashBeforeChange).not.eq(config.version);                   
        })
        it('By default hirarchy should be opposite to loading order',async ()=>{
            memory.raw = {
                test : "3"
            }
            const changedOrder = new ProcessConfig({
                loaders : {
                    'memory1' : memory
                },
                processEnv : {
                    'test':'1'
                },
                loadingOrder : ['memory1','env']
            });
            await config.ready();
            expect(config.get('test')).eq('1');
            expect(changedOrder.get('test')).eq('3');
        })
        it('getHirarchy should determine value',async ()=>{
            memory.raw = {
                test : "3"
            }
            const changedOrder = new ProcessConfig({
                loaders : {
                    'memory1' : memory
                },
                processEnv : {
                    'test':'1'
                },
                getHirarchy : ['env' , 'memory1'],
                loadingOrder : ['memory1','env']
            });
            await config.ready();
            expect(config.get('test')).eq('1');
            expect(changedOrder.get('test')).eq('1');
        })
    })
    describe('config with json config folder' , async ()=>{
        let config;
        let fsFolder;
        beforeEach(()=>{
            fsFolder = new plugins.ConfigJSONFolder(`${__dirname}/example`);
            config = new ProcessConfig({
                loaders : {
                    'fs' : fsFolder
                },
                processEnv : {
                    'NODE_ENV':'production'
                },
                loadingOrder : ['env','fs']
            });
        })
        it('Should load config from common',async ()=>{
            await config.ready()
            expect(config.get('commonOnly')).to.eq('2'); 
        })
        it('Should load config from env specfic',async ()=>{
            await config.ready()
            expect(config.get('prodOnly')).to.eq('2'); 
        })
        it('Should load config by getHirarchy',async ()=>{
            await config.ready()
            expect(config.get('testKey')).to.eq('testProd'); 
        })
    });
    describe('config with defaults json config folder' , async ()=>{
        let config;
        beforeEach(()=>{
            config = new ProcessConfig({
                //Need to set the this folder because the current working directory is the project root
                //Which is outside the test folder
                processEnv :{
                    CONFIG_FOLDER :  `${__dirname}/example`
                }
            });
        })
        it('Should load config from common',async ()=>{
            await config.ready()
            expect(config.get('commonOnly')).to.eq('2'); 
        })
        it('Should load config from env',async ()=>{
            await config.ready()
            expect(config.get('prodOnly')).to.eq(undefined); 
        })
        it('Should load config by getHirarchy',async ()=>{
            await config.ready()
            expect(config.get('folderOnly')).to.eq('common'); 
        })
        it('Should load config by getHirarchy',async ()=>{
            await config.ready()
            expect(config.get('testKey')).to.eq('dotenv'); 
        })
    });
})