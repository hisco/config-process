# process config

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

`config-process` organizes hierarchical configurations for your app configurations.
Configure typescript projects, fullt support typescript interfaces.

It lets you define a set of process configuration parameters, and extend them for different environments (development, qa, staging, production, etc.).

It plays nicely with any deployment mechanisem (docker , k8s , env vars , etc.. ), details in motivation section.

#Features
`config-process` comes with a basic implementation of configuration manager.
The configuration manager asynchronously loads plugins, each plugin uses different methods of configuration loading.

This configuration manager:
 * Allows to use any built in or custom configuration plugins.
 * Allows to control the order of loading plugins.
 * Allows to control the hierarchy in which variables will be overidden.
 * Comes with a built in boolean/number/json getters.
 * Fully support asynchronous loading - perfect for fetching remote config from a remote server. 
 * Comes with some strong default to enable strong ease of use.
 * Tiny with zero dependencies.
 * Fully supports `dotenv` files so it's hassle free to move from `dotenv` to `config-process`

# Configuration load order ≠ hierarchy
Configuration load order can influence on if/which next configuration loader will be used.
Configuration hierarchy influence on the order that the values will be merged into a single value.

# NODE_ENV VS ENVIRONMENT
Some of the built-in plugins use `NODE_ENV` to determine the environment the code is running.
The problem with `NODE_ENV` is that some libs may act defferntlly according to `NODE_ENV` value which may cause undesired results.
Therefore, the built-in plugins first try to use `ENVIRONMENT` and only than use `NODE_ENV`.
It's also possible to change this behavior to first load a custom key instead of `ENVIRONMENT` by setting `envKey` to any desired key.

It's encourged that all plugins made to use this approach.

Example:
```ts
  import { ProcessConfig } from 'config-process'
  
  const config = new ProcessConfig({
    envKey : 'YOU_CUSTOM_KEY'
  })
```

#Simple - Default usage
By default the `config-process` will try to use plugins by the following order:
 * env 
 * dotenv
 * fs

Which means that by default values will be determined by the following 
hierarchy:
 * fs
 * dotenv
 * fs

```bash
  REQUEST_TIMEOUT=100 node server.js
```
```ts
  const processConfig = require('config-process');

  processConfig.get<number>('REQUEST_TIMEOUT' , 'number')
```

#Motivation
In Node.JS echo system there are a dozen of popular conifguration modules.
The most standard modules in the echo system has at least *one of the following problems*:
 * Some depends on a file that needs to be switched during deployment, this requires some build specific logic to be applied as a result same image cannot be used to all environments
 * Some don't provide casting, as a result when a value is being set by the environments, as an environment variable, it will always be a `String` this will require the application to manually cast it every time consumed.
 * Some provides nesting in configuartion files, which makes it harder to be overidden by real environment variables.
 * Some are not customisable, allows only it's openion of usage. 

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/config-process.svg
[npm-url]: https://npmjs.org/package/config-process
[travis-image]: https://img.shields.io/travis/hisco/config-process/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/hisco/config-process
[coveralls-image]: https://coveralls.io/repos/github/hisco/config-process/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/hisco/config-process?branch=master
