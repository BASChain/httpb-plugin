# Development WIKI

## Usage


## Configs

> .config/*.* private config file 

### env-cmdrc 

> the build parameters configuration

```json
{
  "fox":{
    "JWT_ISS":"user:15509732:244",//firefox -addon user id
    "JWT_SECRET":"xxxx",//secret
    "BUILD_TARGET":"firefox"
  },
  "chrome":{
    "BUILD_TARGET":"chrome",
    "chrome_account":"",
    "chrome_pem":
  }
}
```