# Development WIKI

> branch[develop] :development version

> branch[master] : distribution version 

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


## Sources

## Clear extension
C:\Users\{username}\AppData\Roaming\Mozilla\Firefox\Profiles

> .env

# JWT
#JWT_ISS=user:15509732:244
#JWT_SECRET=
# Support HS384 HS512 PS384 ed.
#SIGN_ALGORITHM=HS256

## Remote

  REMOTE_HOST=xxx.xx.x.x
  REMOTE_PORT=3322
  REMOTE_USER=root
  REMOTE_ENABLE=true
  REMOTE_DEST_HOME=/data/www
  REMOTE_DEST_WWW=/data/www
  SSH_KEY=
  DEV_MODE=product

# Ext Info
EXT_NAME=
EXT_VER=
EXT_AUTHOR=bas


# Dev ENV

DEST_TARGET=firefox