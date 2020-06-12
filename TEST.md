# Development Usage 

> Follow the steps below to run extension

  - get source code from github 
  - install npm dependencies
  - build js use command : npm run build 
  - start development mode 

```bas 
git clone https://github.com/BASChain/httpb-plugin.git httpb-fx
cd httpb-fx
touch .config/.env   
yarn install # or npm install 
npm run build
npm start  
```

###  the environment variables file 
> environment variables file at .config/.env 

> content contains : DEST_TARGET=firefox


### publishing extensions zip 

  used command `zip:fox` to generate *.zip 

```bash 
npm run zip:fox
```  