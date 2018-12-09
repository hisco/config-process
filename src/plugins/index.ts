import { ConfigEnv } from './env'
import { ConfigJSONFile } from './file'
import { ConfigJSONFolder } from './folder'
import { ConfigInMemory } from './memory'
import { ConfigPromise } from './promise'
import { ConfigDotenv } from './dotenv'

module.exports = {
    ConfigEnv,
    ConfigDotenv,
    ConfigJSONFile,
    ConfigJSONFolder,
    ConfigInMemory,
    ConfigPromise
}