/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({
	storage: storage
});
var async = require("async");

function a(row_index, file_rows, sp) {
    return new Promise((resolve, reject)=> {
    	var inputParams = "";
    	var start = Date.now();
    	
    	
        for (row_index = 1; row_index < file_rows.length; row_index++) { // jump header
				//console.log(file_rows[row_index]);
				var rows = file_rows[row_index];

				var params = rows.split(",");
				var MATERIAL_NUMBER = params[0].toString();
				var BATCH_DATE = params[1];
				var MATERIAL_DESCRIPTION = params[2].toString();
				var COUNTRY = params[3].toString();
				var PROCESS_FLAG = params[4].toString();
				var RUNID = Number(params[5]);
				//console.log(row_index);

				inputParams = {
					MATERIAL_NUMBER: MATERIAL_NUMBER,
					BATCH_DATE: BATCH_DATE,
					MATERIAL_DESCRIPTION: MATERIAL_DESCRIPTION,
					COUNTRY: COUNTRY,
					PROCESS_FLAG: PROCESS_FLAG,
					RUNID: RUNID
				};

				sp(inputParams, (err, parameters, results) => {
					if (err) {
						//console.log("errB: " + err);
					}
					if(row_index >= file_rows.length-1)
						resolve();
				});
			}
    });
}

module.exports = () => {
	var app = express.Router();

	app.post("/", upload.single("file-to-upload"), (req, res) => {
		var file_content = req.file.buffer.toString();
		var row_index = 1;
		var file_rows = file_content.split("\n");

		var client = req.db;
		var hdbext = require("@sap/hdbext");

		hdbext.loadProcedure(client, null, "insertData", (err, sp) => {
			if (err) {
				console.log("errA: " + err);
			}
			const main = async () => {
			    await a(row_index, file_rows, sp)
			    console.log("Done");
			    res.send("Done");
				//res.redirect("/");
			
			};
			main().catch(console.error);
			
		});
	});

	return app;
};