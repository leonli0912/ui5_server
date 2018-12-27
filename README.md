# ui5_server
local launchpad 

### init project
navi to ui5 project **parent folder**, new a package json file,
use following command:

```
npm init
```
input infomation as you want, and also you can modify the package.json afterword.
finnally you will see a json file like this:  

### **package.json**
```
{
  "name": "ui5_server",
  "version": "1.0.0",
  "description": "node server host ui5 apps",
  "main": "static_server_https.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "~4.16.4",
    "express-http-proxy": "~1.5.0",
    "http-proxy": "~1.17.0"
  },
  "author": "leon li",
  "license": "ISC"
}

```
### index html  
create index.html which is the entry point for ui5.
in the index/html it requires [sap-ui-core.js](https://sapui5.hana.ondemand.com/resources/sap-ui-core.js) and [sandbox.js](https://sapui5.hana.ondemand.com/sdk/test-resources/sap/ushell/bootstrap/sandbox.js) they are both can be found on cdn launchpad,for path '../resources/' it can be route to '/https://sapui5.hana.ondemand.com/resources/''by 'http-proxy'  but for '/test-resources/'' the proxy not work, i don't know why...

```
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Financial Validation Result</title>
	<script>
		window["sap-ushell-config"] = {
			defaultRenderer: "fiori2",
			renderers: {
				fiori2: {
					componentData: {
						config: {
							search: "hidden"
						}
					}
				}
			}
		};
	</script>

	<script src="sandbox.js" id="sap-ushell-bootstrap"></script>

	<!-- Bootstrap the UI5 core library -->
	<script id="sap-ui-bootstrap" src="../resources/sap-ui-core.js" data-sap-ui-libs="sap.ushell, sap.collaboration, sap.m, sap.ui.layout"
	 data-sap-ui-theme="sap_belize" data-sap-ui-compatVersion="edge" data-sap-ui-resourceroots='{"fin.cons.vecresult": "fin.cons.vecresult/webapp/"}'
	 data-sap-ui-frameOptions='allow'> 	// NON-SECURE setting for testing environment
	</script>

	<script>
		sap.ui.getCore().attachInit(function () {
			// initialize the ushell sandbox component
			sap.ushell.Container.createRenderer().placeAt("content");
		});
	</script>
</head>
<!-- UI Content -->

<body class="sapUiBody" id="content">
</body>

</html>
```
### static_server_https.js
use express, very simple to create a sever and plus 'express-http-proxy' and 'http-proxy' http request can be converted to https, and odata request can also sent to real backend server.
by default request to system er9 will be sent to client 001, for our case client 500 is needed, so can write proxyReq header in the event 'proxyReq'.

```
const express = require('express')
const app = express()
const proxy = require('express-http-proxy');
const httpProxy = require('http-proxy');
const odataProxy = httpProxy.createProxyServer({ 
  target: 'https://host:port', secure: false 
});

odataProxy.on('proxyReq', function (proxyReq, req, res, options) {  
  proxyReq.setHeader('sap-client', '500');
});

app.route('/sap/opu/odata/*$').all(function (req, res) {
  odataProxy.web(req, res);
});

app.use(express.static(__dirname));
app.use('/resources/', proxy('sapui5.hana.ondemand.com/resources/', {
  https: true
}));
/* app.use('/test-resources/', proxy('sapui5.hana.ondemand.com/sdk/test-resources/', {
  https: true
})); */

app.listen(3000, () => console.log('Example app listening on port 3000!'))
```
### fiori launchpad configuraition
in the folder 'appconfig' new a json file named 'fioriSandboxConfig.json'

```
{
    "applications" : { 
        "FinancialValidationResult-runValidationResultforReportedData": {
            "additionalInformation": "SAPUI5.Component=fin.cons.vecresult",
            "applicationType": "URL",
            "url": "fin.cons.vecresult/webapp/",
            "description": "Financial Validation Result",
            "title": "Financial Validation Result"
        },
        "MySecondFioriObject-display" : {
            "additionalInformation" : "SAPUI5.Component=com.mycompany.MySecondFioriApplication",
            "applicationType" : "URL",
            "url" : "/MySecondFioriApplication",
            "title" : "My Second Fiori Application",
            "description" : "My second Fiori application"
        }
    }
}
```
### install dependencies
using command:

```
npm install
```
after that your project folder will look like this:  
![image](https://upload-images.jianshu.io/upload_images/11121129-7c3e47e5d9cbaa20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### run server

```
node static_server_https.js
```
### test in browser
run http://localhost:3000  
![image](https://upload-images.jianshu.io/upload_images/11121129-c72ee879dca91ad2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

everything works fine  
![image](https://upload-images.jianshu.io/upload_images/11121129-278d68d706bf05d9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


