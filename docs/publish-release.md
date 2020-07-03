# Publish Firefox Extension Workflow

> use command publish extension to AMO

## build & packaged 
> AMO account bas-dev

> work flow 

  - set version :the version must > AMO latest version 
  - build and packaged 
  - upload the package to AMO 
 
<a href="https://addons.mozilla.org/zh-CN/developers/addon/bas/versions/submit/" target="AMO">AMO URL</a>  

### commands and edit configs

> edit version 
```textarea 
  modified package.json [version=*]
  or 
  .config/.env [EXT_VER=*]
```

** .env has a higher priority than package.json. if EXT_VER not null it will overwrite package.json version **  

> execute command

```bash
npm run zip:fox 
```
> upload zip to AMO 


# Usage 

## commit branch
```bash
node ci/git-commit.js 
```


## Publish Log

> 

| version  |  Date  |  comments  |
| --  |  --  | --  |
|  v0.1.1  |  2020-4-4  |update protocol dns parse (mdns.baschain.org)  | 
|  v1.0.0  |  2020-4-21  |update protocol dns parse (extr.baschian.cn)  | 