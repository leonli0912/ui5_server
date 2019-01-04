const express = require('express')
const app = express()
const proxy = require('express-http-proxy');
const httpProxy = require('http-proxy');
const proxyTargets = {
	er9: {
		target: 'https://ldai4er9.wdf.sap.corp:44300',
		client: '500'
	},
	ccf: {
		target: 'https://ldciccf.wdf.sap.corp:44300',
		client: '715'
	}
}
const odataProxy = httpProxy.createProxyServer({
	target: proxyTargets.ccf.target,
	secure: false
});

var COOKIE = null;

odataProxy.on('proxyReq', function(proxyReq, req, res, options) {
	if (req.method === 'HEAD') {
		console.log('request url....:', req.url);
		console.log('request headers.cookie....:', req.headers.cookie);
		COOKIE = null;
		var cookies = req.headers.cookie.split(";");
		for (var i = cookies.length - 1; i >= 0; i--) {
			if (cookies[i].includes("SAP_SESSIONID_CCF_715")) {
				COOKIE = cookies[i];
			}
		}
		//proxyReq.setHeader('x-csrf-token', 'fetch');

	}
	proxyReq.setHeader('sap-client', proxyTargets.ccf.client);
	if (req.method === 'POST') {
		
		if (COOKIE) {
			//proxyReq.setHeader('Content-Type', 'Application/atom+xml');
			//proxyReq.setHeader('x-csrf-token', CSRF);
			proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');
			console.log('COOKIE:...', COOKIE);
			proxyReq.setHeader('cookie', COOKIE);
		}

	}
});

odataProxy.on('proxyRes', function(proxyRes, req, res) {
	if (req.method === 'HEAD') {
		//console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
		if (!COOKIE) {
			COOKIE = proxyRes.headers["set-cookie"];
			console.log("get cookie from set-cookie:...",COOKIE);
		}
	}

});

app.route('/sap/opu/odata/*$').all(function(req, res) {
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