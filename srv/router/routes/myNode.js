/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, newcap:0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");
var async = require("async");

module.exports = function () {
	var app = express.Router();
	var userScope = null;
	
	app.get("/WhoAmI", (req, res) => {
		var scope = `${req.authInfo.xsappname}.Create`;
		if (req.authInfo && !req.authInfo.checkScope(scope)) {
			userScope = "usr";
		} else {
			userScope = "adm";
		}
		
		var result = JSON.stringify({
			userScope: userScope
		});
		res.type("application/json").status(200).send(result);
		
	});
	
	app.get("/getSessionInfo", (req, res) => {
		var userContext = req.authInfo;
		var result = JSON.stringify({
			userContext: userContext
		});
		res.type("application/json").status(200).send(result);
	});
	
	app.get("/userinfo", function(req, res) {
		let xssec = require("@sap/xssec");
		let xsenv = require("@sap/xsenv");
		let accessToken;
		let authWriteScope = false;
		let authReadScope = false;
		let controllerAdminScope = true;
		let userInfo = {
			"name": req.user.id,
			"familyName": req.user.name.familyName,
			"emails": req.user.emails,
			"scopes": [],
			"identity-zone": req.authInfo.identityZone
		};
		function getAccessToken(req) {
			var accessToken = null;
			if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
				accessToken = req.headers.authorization.split(" ")[1];
			}
			return accessToken;
		}
		accessToken = getAccessToken(req);
		let uaa = xsenv.getServices({
			uaa: {
				tag: "xsuaa"
			}
		}).uaa;
		xssec.createSecurityContext(accessToken, uaa, function(error, securityContext) {
			if (error) {
				console.log("Security Context creation failed");
				return;
			}
			console.log("Security Context created successfully");
			userInfo.scopes = securityContext.scopes;
			console.log("Scope checked successfully");
		});
		return res.type("application/json").status(200).json(userInfo);
	});
	
	return app;
};