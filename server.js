const fs = require('fs');
const http = require('http');
const https = require('https');

const hostname = 'ec2-54-201-85-235.us-west-2.compute.amazonaws.com';
const port = 443;

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/android.n-plat.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/android.n-plat.com/fullchain.pem')
};

const server = https.createServer(options, (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  //res.end('Test\n');
});


server.listen(port, hostname, () => {
  console.log(`Server running at https://${hostname}:${port}/`);
});

var mysql_db_password = fs.readFileSync('/home/ec2-user/secrets.txt').toString().split('\n')[0];

crypto = require('crypto')

var mysql = require('mysql');

var admin = require('firebase-admin');

var serviceAccount = require("/home/ec2-user/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nplat-ae998.firebaseio.com"
});


server.on('request', (request, response) => {

    var now = new Date();

    console.log(now.toISOString());
    console.log(request.url);
    console.log(request.method);
    console.log(request.headers);

    if (request.method === 'POST' && request.url === '/post/'){

	let body = [];
	request.on('data', (chunk) => {
	    body.push(chunk);
	}).on('end', () => {

	    body = Buffer.concat(body).toString();

	    const id_token = JSON.parse(decodeURIComponent(body))["id_token"];

	    const message = JSON.parse(decodeURIComponent(body))["message"];

	    admin.auth().verifyIdToken(id_token)
		.then(function(decodedToken) {
		    var username = decodedToken.uid;

		    var connection = mysql.createConnection({
			host     : 'nplat-instance.cphov5mfizlt.us-west-2.rds.amazonaws.com',
			user     : 'android',
			password : mysql_db_password,
			database : 'nplat',
			port : '3306',
		    });
		    
		    connection.connect();

		    var now = new Date();

		    connection.query('insert into posts set username="'+username+'", text="'+message+'", time = "'+now.toISOString()+'";',function (error, results, fields) {
			json_object = {"success" : true, "reason" : ""}
			response.write(JSON.stringify(json_object));
			response.end();
		    });


		    connection.end( function(error) { });

		});

	});
    }

    if (request.method === 'POST' && request.url === '/registerdevice/'){

	let body = [];
	request.on('data', (chunk) => {
	    body.push(chunk);
	}).on('end', () => {

	    body = Buffer.concat(body).toString();
	    const id_token = JSON.parse(decodeURIComponent(body))["id_token"];
	    const device_token  = JSON.parse(decodeURIComponent(body))["device_token"];

	    admin.auth().verifyIdToken(id_token)
		.then(function(decodedToken) {
		    var username = decodedToken.uid;
		    
		    var connection = mysql.createConnection({
			host     : 'nplat-instance.cphov5mfizlt.us-west-2.rds.amazonaws.com',
			user     : 'android',
			password : mysql_db_password,
			database : 'nplat',
			port : '3306',
		    });
		    
		    connection.connect();
		    
		    var now = new Date();

		    connection.query('insert into device_tokens set username = "'+username+'", token="'+device_token+'", registration_time="'+now.toISOString()+'";',function (error, results, fields) {
					 
			if (error) console.log(error);
					 
		    });
		    
		    connection.end();
		    
		    response.end();

		}).catch(function(error) {
		    
		    console.log(error);
		    
		    // Handle error
		});
	    
	    
	    

	})
    }
		  
    if (request.method === 'POST' && request.url === '/login/') {
	
	let body = [];
	request.on('data', (chunk) => {
	    body.push(chunk);
	}).on('end', () => {
	    body = Buffer.concat(body).toString();
	    const username = JSON.parse(decodeURIComponent(body))["username"];
	    
	    console.log(username);

	    var connection = mysql.createConnection({
		host     : 'nplat-instance.cphov5mfizlt.us-west-2.rds.amazonaws.com',
		user     : 'android',
		password : mysql_db_password,
		database : 'nplat',
		port : '3306',
	    });
	    
	    connection.connect();
	    
	    console.log('select * from user_info where username = "'+username+'";');

	    connection.query('select * from user_info where username = "'+username+'";',function (error, results, fields) {
		
		const hash = crypto.createHash('sha256')
		    .update(JSON.parse(decodeURIComponent(body))["password"])
		    .digest('hex');
		
		console.log(results);
		console.log(error);

		if(Array.isArray(results) && results.length == 1 &&  results[0]['hashed_password'] === hash){
		    admin.auth().createCustomToken(username)
			.then(function(customToken) {

			    console.log("Successful login for username "+ username+".");

			    json_object = {"success" : true, "custom_token" : customToken};

			    console.log(json_object);

			    response.write(JSON.stringify(json_object));

			    response.end();
			})

			.catch(function(error) {

			    console.log("Unsuccessful login for username "+ username+".");

			    console.log("Error creating custom token:", error);

			    json_object = {"success" : false, "custom_token" : ""};

			    console.log(json_object);

			    response.write(JSON.stringify(json_object));
			    
			    response.end();

			});
		    
		} else {

		    json_object = {"success" : false, "custom_token" : ""};

		    console.log(json_object);

		    response.write(JSON.stringify(json_object));
		    response.end();
		    console.log("Unsuccessful login for username "+ username+".");
		    
		}
		
	    });
	    
	    connection.end();
	    
	});
    }


        if (request.method === 'POST' && request.url === '/posts/'){

	let body = [];
	request.on('data', (chunk) => {
	    body.push(chunk);
	}).on('end', () => {

	    body = Buffer.concat(body).toString();
	    const id_token = JSON.parse(decodeURIComponent(body))["id_token"];

	    admin.auth().verifyIdToken(id_token)
		.then(function(decodedToken) {
		    var username = decodedToken.uid;

		    var connection = mysql.createConnection({
			host     : 'nplat-instance.cphov5mfizlt.us-west-2.rds.amazonaws.com',
			user     : 'android',
			password : mysql_db_password,
			database : 'nplat',
			port : '3306',
		    });
		    
		    connection.connect();
		    
		    posts_text = [];		    

		    connection.query('select text from posts where username="'+username+'";',function (error, results, fields) {

			for (let i = 0, len = results.length; i < len; ++i) {

			    posts_text.push(results[i]["text"]);

			}
			
		    });


		    connection.end( function(error) {

			json_array =[]

			for (let i = 0, len = posts_text.length; i < len; ++i){

			    json_array.push({ "id" : (i+1), "text" : posts_text[len-i-1]});

			}

			response.write(JSON.stringify(json_array));

			response.end();	    
		    
		    });





		});
	})
    }



    if (request.method === 'POST' && request.url === '/feed/'){
	    
	let body = [];
	request.on('data', (chunk) => {
	    body.push(chunk);
	}).on('end', () => {

	    body = Buffer.concat(body).toString();
	    const id_token = JSON.parse(decodeURIComponent(body))["id_token"];

	    admin.auth().verifyIdToken(id_token)
		.then(function(decodedToken) {
		    var username = decodedToken.uid;

		    var connection = mysql.createConnection({
			host     : 'nplat-instance.cphov5mfizlt.us-west-2.rds.amazonaws.com',
			user     : 'android',
			password : mysql_db_password,
			database : 'nplat',
			port : '3306',
		    });
		    
		    connection.connect();
		    
		    posts_text = [];
		    posts_username = [];
		    
		    connection.query('select username,text from posts;',function (error, results, fields) {

			for (let i = 0, len = results.length; i < len; ++i) {

			    posts_text.push(results[i]["text"]);
			    posts_username.push(results[i]["username"]);

			}
			
		    });


		    connection.end( function(error) {

			json_array =[]

			for (let i = 0, len = posts_text.length; i < len; ++i){

			    json_array.push({ "id" : (i+1), "text" : posts_text[len-i-1], "username" : posts_username[len-i-1]});

			}

			response.write(JSON.stringify(json_array));

			response.end();	    
		    
		    });





		});
	})
    }


    if (request.method === 'POST' && request.url === '/getall/'){

	let body = [];
	request.on('data', (chunk) => {
	    body.push(chunk);
	}).on('end', () => {

	    body = Buffer.concat(body).toString();
	    const id_token = JSON.parse(decodeURIComponent(body))["id_token"];

	    admin.auth().verifyIdToken(id_token)
		.then(function(decodedToken) {
		    var username = decodedToken.uid;

		    var connection = mysql.createConnection({
			host     : 'nplat-instance.cphov5mfizlt.us-west-2.rds.amazonaws.com',
			user     : 'android',
			password : mysql_db_password,
			database : 'nplat',
			port : '3306',
		    });
		    
		    connection.connect();
		    
		    posts_text = [];		    

		    connection.query('select text from posts where username="'+username+'";',function (error, results, fields) {

			for (let i = 0, len = results.length; i < len; ++i) {

			    posts_text.push(results[i]["text"]);

			}
			
		    });


		    connection.end( function(error) {

			json_array =[]

			for (let i = 0, len = posts_text.length; i < len; ++i){

			    json_array.push({ "id" : (i+1), "text" : posts_text[len-i-1]});

			}

			response.write(JSON.stringify(json_array));

			response.end();	    
		    
		    });





		});
	})
    }
    
});
	      
