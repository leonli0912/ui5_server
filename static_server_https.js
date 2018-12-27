const express = require('express')
const app = express()
const appconfig = require('fioriSandboxConfig');
var proxy = require('express-http-proxy');

var httpProxy = require('http-proxy');

var odataProxy = httpProxy.createProxyServer({ target: 'https://ldai4er9.wdf.sap.corp:44300', secure: false });
odataProxy.on('proxyReq', function (proxyReq, req, res, options) {
  //console.log('enter proxy..');
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