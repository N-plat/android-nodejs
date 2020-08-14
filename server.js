const fs = require('fs');
const http = require('http');
const https = require('https');
const multer = require('multer')
const express = require('express')
const bodyParser = require('body-parser');


const hostname = 'ec2-54-201-85-235.us-west-2.compute.amazonaws.com';
const port = 443;

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/android.n-plat.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/android.n-plat.com/fullchain.pem')
};

var mysql_db_password = fs.readFileSync('/home/ec2-user/secrets.txt').toString().split('\n')[0];

crypto = require('crypto')

var mysql = require('mysql');

var admin = require('firebase-admin');

var serviceAccount = require("/home/ec2-user/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nplat-ae998.firebaseio.com"
});

const app = express()

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/efs/ec2-user/images/');
    },

    filename: (req, file, cb) => {

	var connection = mysql.createConnection({
	    host     : 'nplat-instance.cphov5mfizlt.us-west-2.rds.amazonaws.com',
	    user     : 'android',
	    password : mysql_db_password,
	    database : 'nplat',
	    port : '3306',
	});
	
	connection.connect();
	
	var now = new Date();

	var image_unique_id = -1;
	
	connection.query('insert into images values(NULL,"username2",now(6),now(6))',function (error, results, fields) {

	    connection.query('select LAST_INSERT_ID()',function (error, results, fields) {

		image_unique_id = results[0]['LAST_INSERT_ID()']

		cb(null, "image"+image_unique_id+".jpeg")
		
		connection.end( function(error) { });
		
	    });
	    
	});

    }
});

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/efs/ec2-user/videos/');
    },

    filename: (req, file, cb) => {

	var connection = mysql.createConnection({
	    host     : 'nplat-instance.cphov5mfizlt.us-west-2.rds.amazonaws.com',
	    user     : 'android',
	    password : mysql_db_password,
	    database : 'nplat',
	    port : '3306',
	});
	
	connection.connect();
	
	var now = new Date();

	var image_unique_id = -1;
	
	connection.query('insert into videos values(NULL,"username2",now(6),now(6))',function (error, results, fields) {

	    connection.query('select LAST_INSERT_ID()',function (error, results, fields) {

		image_unique_id = results[0]['LAST_INSERT_ID()']

		cb(null, "video"+image_unique_id+".mp4")
		
		connection.end( function(error) { });
		
	    });
	    
	});

    }
});


const imageFileFilter = (req, file, cb) => {

    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const videoFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(mp4)$/)) {
        return cb(new Error('You can upload only video files!'), false);
    }
    cb(null, true);
};

const uploadImage = multer({ storage: imageStorage, fileFilter: imageFileFilter});

const uploadVideo = multer({ storage: videoStorage, fileFilter: videoFileFilter});

const uploadImageRouter = express.Router();

const uploadVideoRouter = express.Router();

uploadImageRouter.use(bodyParser.json());

uploadVideoRouter.use(bodyParser.json());

app.post('/postwithvideo/',uploadVideoRouter);

app.post('/postwithimage/',uploadImageRouter);

uploadImageRouter.route('/postwithimage/')
.post(uploadImage.single('imageFile'), (req, res) => {
    res.statusCode = 200;
//    res.setHeader('Content-Type', 'application/json');
    //    res.json(req.file);

    i = 5
    image_unique_id = ""
    while (req.file.filename[i] != ".") {
	image_unique_id += req.file.filename[i]
	i++
    }
    
    const id_token = req.body["id_token"];
	
    const message = req.body["message"];
	
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
	    
	    connection.query('insert into posts set username="'+username+'", text="'+message+'", image_unique_id="'+image_unique_id+'", time = "'+now.toISOString()+'";',function (error, results, fields) {
		json_object = {"success" : true, "reason" : ""}
		res.write(JSON.stringify(json_object));
		res.end();
	    });
	    
	    
	    connection.end( function(error) { });
	    
	});
    
})

uploadVideoRouter.route('/postwithvideo/')
.post(uploadVideo.single('videoFile'), (req, res) => {
    res.statusCode = 200;
//    res.setHeader('Content-Type', 'application/json');
//    res.json(req.file);

    i = 5
    video_unique_id = ""
    while (req.file.filename[i] != ".") {
	video_unique_id += req.file.filename[i]
	i++
    }
    
    const id_token = req.body["id_token"];
	
    const message = req.body["message"];
	
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
	    
	    connection.query('insert into posts set username="'+username+'", text="'+message+'", video_unique_id = "'+video_unique_id+'", time = "'+now.toISOString()+'";',function (error, results, fields) {
		json_object = {"success" : true, "reason" : ""}
		res.write(JSON.stringify(json_object));
		res.end();
	    });
	    
	    
	    connection.end( function(error) { });
	    
	});
    
})    

app.post('/post',function (request, response) {

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
});


app.post('/follow',function (request, response) {

	console.log("/follow");
	var now = new Date();

	console.log(now.toISOString());
	console.log(request.url);
	console.log(request.method);
	console.log(request.headers);
	
	let body = [];
	request.on('data', (chunk) => {
	    body.push(chunk);
	}).on('end', () => {

	    body = Buffer.concat(body).toString();

	    const id_token = JSON.parse(decodeURIComponent(body))["id_token"];

	    const username2 = JSON.parse(decodeURIComponent(body))["username"];

	    admin.auth().verifyIdToken(id_token)
		.then(function(decodedToken) {
		    var username1 = decodedToken.uid;

		    var connection = mysql.createConnection({
			host     : 'nplat-instance.cphov5mfizlt.us-west-2.rds.amazonaws.com',
			user     : 'android',
			password : mysql_db_password,
			database : 'nplat',
			port : '3306',
		    });

		    
		    if (username1 == username2) {
		    
			json_object = {"success" : false, "reason" : "You cannot follow yourself."};
		    
			response.write(JSON.stringify(json_object));
			response.end();
			console.log("Unsuccessful follow from " + username1 + " to " + username2 + ".");
		    
			return;

		    }
		    
		    connection.connect();

		    var results1;

		    var results2;

		    connection.query('select * from user_info where username = "'+username2+'";',function (error, results, fields) {

			results1 = results;

		    });
		    
		    connection.query('select * from follows where follower = "'+username1+'" and followed = "'+username2+'";',function (error, results, fields) {
			results2 = results;
			
		    });

		    connection.end( function(error) { 
		    
			if(results1.length == 0){
			
			
			    json_object = {"success" : false, "reason" : "Username does not exist."};
			    
			    response.write(JSON.stringify(json_object));
			    response.end();
			    console.log("Unsuccessful follow from " + username1 + " to " + username2 + ".");
			    
			    return;
			    
			}
			
			
			if(results2.length == 1){
			    
			    console.log("Unsuccessful follow from " + username1 + " to " + username2 + ".");
			    
			    json_object = {"success" : false, "reason" : "You are already following this user."};
			    
			    response.write(JSON.stringify(json_object));
			    
			    response.end();
			    
			    return;
			}

			var new_connection = mysql.createConnection({
			    host     : 'nplat-instance.cphov5mfizlt.us-west-2.rds.amazonaws.com',
			    user     : 'android',
			    password : mysql_db_password,
			    database : 'nplat',
			    port : '3306',
			});

			new_connection.connect();		
			
			var now = new Date();
		    
			new_connection.query('insert into follows set follower="'+username1+'", followed="'+username2+'", time = "'+now.toISOString()+'";',function (error, results, fields) {
			    json_object = {"success" : true, "reason" : ""}
			    response.write(JSON.stringify(json_object));
			    response.end();
			});

			new_connection.end( function(error) { });



		    });

		});
	});
});

app.post('/registerdevice',function (request, response) {

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
});
	 
app.post('/login',function (request, response) {

	console.log("/login");
	var now = new Date();

	console.log(now.toISOString());
	console.log(request.url);
	console.log(request.method);
	console.log(request.headers);
    
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
});

app.post('/posts',function (request, response) {

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
		    posts_timestamp = [];
		    posts_imageids = []
		    posts_videoids = [];
		    
		    connection.query('select time,text,image_unique_id,video_unique_id from posts where username="'+username+'";',function (error, results, fields) {

			for (let i = 0, len = results.length; i < len; ++i) {

			    posts_text.push(results[i]["text"]);
			    posts_timestamp.push(results[i]["time"]);
			    posts_imageids.push(results[i]["image_unique_id"]);
			    posts_videoids.push(results[i]["video_unique_id"]);
			    
			}
			
		    });


		    connection.end( function(error) {

			json_array =[]

			for (let i = 0, len = posts_text.length; i < len; ++i){

			    json_array.push({ "id" : (i+1), "text" : posts_text[len-i-1], "username" : username, "timestamp" : posts_timestamp[len-i-1], "imageid": posts_imageids[len-i-1], "videoid" : posts_videoids[len-i-1]});

			}

			response.write(JSON.stringify(json_array));

			response.end();	    
		    
		    });





		});
	})
});
	 
app.post('/feed',function (request, response) {
	    
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
		    posts_timestamp = [];		    
		    posts_imageids = []
		    posts_videoids = [];
		    
                    connection.query('select t1.time,t1.username,t1.text,t1.image_unique_id,t1.video_unique_id FROM posts as t1, follows as t2 where t1.username = t2.followed && t2.follower="'+username+'";',function (error, results, fields) {

			for (let i = 0, len = results.length; i < len; ++i) {

			    posts_text.push(results[i]["text"]);
			    posts_username.push(results[i]["username"]);
			    posts_timestamp.push(results[i]["time"]);
			    posts_imageids.push(results[i]["image_unique_id"]);
			    posts_videoids.push(results[i]["video_unique_id"]);			    

			}
			
		    });


		    connection.end( function(error) {

			json_array =[]

			for (let i = 0, len = posts_text.length; i < len; ++i){

			    json_array.push({ "id" : (i+1), "text" : posts_text[len-i-1], "username" : posts_username[len-i-1], "timestamp" : posts_timestamp[len-i-1], "imageid": posts_imageids[len-i-1], "videoid" : posts_videoids[len-i-1]});

			}

			response.write(JSON.stringify(json_array));

			response.end();	    
		    
		    });





		});
	})
});

app.post('/followers',function (request, response) {
	 
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
		    
		    following_usernames = [];
		    
		    connection.query('select follower from follows where followed="'+username+'";',function (error, results, fields) {

			for (let i = 0, len = results.length; i < len; ++i) {

			    following_usernames.push(results[i]["follower"]);

			}
			
		    });


		    connection.end( function(error) {

			json_array =[]

			for (let i = 0, len = following_usernames.length; i < len; ++i){

			    json_array.push({ "id" : (i+1), "username" : following_usernames[i]});

			}

			response.write(JSON.stringify(json_array));

			response.end();	    
		    
		    });





		});
	})
});

app.post('/following',function (request, response) {

	    
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
		    
		    followed_usernames = [];
		    
		    connection.query('select followed from follows where follower="'+username+'";',function (error, results, fields) {

			for (let i = 0, len = results.length; i < len; ++i) {

			    followed_usernames.push(results[i]["followed"]);

			}
			
		    });


		    connection.end( function(error) {

			json_array =[]

			for (let i = 0, len = followed_usernames.length; i < len; ++i){

			    json_array.push({ "id" : (i+1), "username" : followed_usernames[i]});

			}

			response.write(JSON.stringify(json_array));
			
			response.end();	    
		    
		    });





		});
	})
});        

const server = https.createServer(options, app);

server.listen(port,hostname, () => {

  console.log(`Server running at https://${hostname}:443/`);
    
});

