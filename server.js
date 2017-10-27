// set up ======================================================================
var braintree = require("braintree");
var generatePassword = require('password-generator');
var mongojs = require('mongojs');
var express   = require('express');
var app       = express(); 								// create our app w/ express
var port  	  = process.env.OPENSHIFT_NODEJS_PORT || 3000; 				// set the port
var ipaddress = process.env.OPENSHIFT_NODEJS_IP;
var multer = require("multer");
var done = false;
var ncp = require('ncp').ncp;
//var crypto= require('crypto');
//var bcrypt= require('bcrypt');
//var q= require('q');

var localDataDir = process.env.OPENSHIFT_DATA_DIR || "../data";
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fish360email@gmail.com',
        pass: 'fishy123'
    }
}, {
    // default values for sendMail method
    from: 'fish360email@gmail.com',
    headers: {
        'My-Awesome-Header': '123'
    }
});

ncp(localDataDir, __dirname + "/public/uploads", function (err) {
	if (err) {
		return console.error(err);
	}
});

var gateway = braintree.connect({
	environment: braintree.Environment.Production,
	merchantId: "msffcs8dcd3wch6v",//"tcjtq7fcjbttnfb5",
	publicKey: "7zf5swwb8tcrbhgh",//"3yfhgcysvp6dzxw8",
	privateKey: "1f0afa0854f544008ae8277348c1104a"//"c4c214a0904450885fae523afdfb47a9"
});

app.configure(function () {
    app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
    app.use(express.logger('dev')); 						// log every request to the console
    app.use(express.bodyParser({ uploadDir: './public/uploads' })); 							// pull information from html in POST
    app.use(express.json()); 							// pull information from html in POST
    app.use(express.urlencoded());
    app.use(express.methodOverride()); 						// simulate DELETE and PUT
});

/*
app.post('/:entity/photo', function (req, res) {
    var entity = req.params.entity;
    var entityId = req.body.id;
    var username = req.body.username;
    var path = req.files.userPhoto.path;
    if (path.indexOf("\\") > -1)
        path = path.split("\\");
    else
        path = path.split("/");
    fileName = path[path.length - 1];
    db[entity].findOne({ _id: mongojs.ObjectId(entityId) }, function (err, doc) {
        if (typeof doc.images == "undefined") {
            doc.images = [];
        }
        doc.images.push(fileName);
        db[entity].save(doc, function () {
            res.redirect("/#/" + username + "/" + entity + "/" + entityId + "/photos");
        });
    });
});

*/




function savePhoto(entityName, entityId, req, callback)
{
	ncp(__dirname + '/public/uploads', localDataDir, function (err) {
		if (err) {
			return console.error(err);
		}
		console.log('done!');
	});

	var path = req.files.userPhoto.path;
    var imagePage = path;

    if (path.indexOf("\\") > -1)
        path = path.split("\\");
    else
        path = path.split("/");
    fileName = path[path.length - 1];
    var thm = 'thm_' + fileName;
    db[entityName].findOne({ _id: mongojs.ObjectId(entityId) }, function (err, doc) {
        if (typeof doc.images == "undefined") {
            doc.images = [];
        }
        doc.images.push(fileName);
        db[entityName].save(doc, function () {

            var r = require('ua-parser').parse(req.headers['user-agent']);
            var family = r.device.family;
            var rotate = 0;

            if (family == 'iPhone') {
                rotate = 180;
            }

            require('lwip').open(imagePage, function (err, image) {
                image.batch()
                  .scale(0.25)
                  .rotate(rotate, 'white')
                  .writeFile(__dirname + '/public/uploads/' + thm, function (err) {
						ncp(__dirname + '/public/uploads', localDataDir, function (err) {
							if (err) {
								return console.error(err);
							}
							console.log('done!');
						});
                      callback();
                  });
            });
        });
    });
}

app.post('/profile/photo', function (req, res) {
    var username = req.body.username;
    var userId = req.body.userId;
    savePhoto("user", userId, req, function () {
        res.redirect("/#/" + username + "/profile");
    });
});

app.post('/trip/photo', function (req, res) {
    var tripId = req.body.tripId;
    var username = req.body.username;
    savePhoto("trip", tripId, req, function () {
        res.redirect("/#/" + username + "/trip/" + tripId + "/photos");
    });
});

app.post('/fish/photo', function (req, res) {
    var username = req.body.username;
    var tripId = req.body.tripId;
    var fishId = req.body.fishId;
    savePhoto("fish", fishId, req, function () {
        res.redirect("/#/" + username + "/trip/" + tripId + "/fish/" + fishId + "/photos");
    });
});

app.post('/gear/photo', function (req, res) {
    var gearId = req.body.gearId;
    var username = req.body.username;
    savePhoto("gear", gearId, req, function () {
        res.redirect("/#/" + username + "/gear/" + gearId + "/photos");
    })
});

app.post('/spots/photo', function (req, res) {
    var spotId = req.body.spotId;
    var username = req.body.username;
    savePhoto("spots", spotId, req, function () {
        res.redirect("/#/" + username + "/spots/" + spotId + "/photos");
    })
});

var spots = require('./public/features/spots/server.js');
var presentations = require('./public/features/presentations/server.js');
var gear = require('./public/features/gear/server.js');
var fish = require('./public/features/spots/server.js');
var search = require('./public/features/search/server.js');
var searchResults = require('./public/features/searchResults/server.js');

var connection_string = '127.0.0.1:27017/f360';

if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
	connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
	process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
	process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
	process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
	process.env.OPENSHIFT_APP_NAME;
}

var db = mongojs(connection_string, ['user', 'trip', 'fish', 'spots', 'gear', 'presentations', 'search', 'report']);
var userModel=require("./app/models/user.model.server.js")(db);
var mandrill  = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('EW3Z7X-JJDSZwb1DigccCA');
var email     = require('./modules/email/email.js')(app, mandrill_client, db, generatePassword);

presentations(app, db, mongojs);
spots(app, db, mongojs);
gear(app, db, mongojs);
search(app, db, mongojs);
searchResults(app, db, mongojs);

app.get('/api/browser', function (req, res) {
    var r = require('ua-parser').parse(req.headers['user-agent']);
    var family = r.device.family;
    res.send(family);
});

app.get('/api/:username/events', function(req, res)
{
	db.trip.find({username: req.params.username}, function(err, trips)
	{
		var events = trips;
		db.fish.find({username: req.params.username}, function(err, fish) {
			if(typeof fish != "undefined" && fish != null) {
				for(var i=0; i<fish.length; i++) {
					events.push(fish[i]);
				}
			}
			db.spots.find({username: req.params.username}, function(err, spots) {
				if(typeof spots != "undefined" && spots != null) {
					for(var i=0; i<spots.length; i++) {
						events.push(spots[i]);
					}
				}
				db.gear.find({username: req.params.username}, function(err, gear) {
					if(typeof gear != "undefined" && gear != null) {
						for(var i=0; i<gear.length; i++) {
							events.push(gear[i]);
						}
					}
					res.json(events);
				});
			});
		});
	});
});

/*
 *	Trips
 */

// Remove picture

app.delete('/api/:username/spots/:spotId/photos/:photoIndex', function (req, res) {
    var spotId = req.params.spotId;
    db.spots.findOne({ _id: mongojs.ObjectId(spotId) }, function (err, spot) {
        spot.images.splice(req.params.photoIndex, 1);
        db.spots.save(spot, function (err, spot) {
            res.send(err);
        });
    });
});

app.delete('/api/:username/trip/:tripId/photos/:photoIndex', function (req, res) {
    var tripId = req.params.tripId;
    db.trip.findOne({ _id: mongojs.ObjectId(tripId) }, function (err, trip) {
        trip.images.splice(req.params.photoIndex, 1);
        db.trip.save(trip, function (err, trip) {
            res.send(err);
        });
    });
});

app.delete('/api/:username/trip/:tripId/fish/:fishId/photos/:photoIndex', function (req, res) {
    var fishId = req.params.fishId;
    db.fish.findOne({ _id: mongojs.ObjectId(fishId) }, function (err, fish) {
        fish.images.splice(req.params.photoIndex, 1);
        db.fish.save(fish, function (err, fish) {
            res.send(err);
        });
    });
});

// Get all trips for username
app.get('/api/:username/trip', function(req, res)
{
	db.trip.find({username: req.params.username}, function(err, trips)
	{
		res.json(trips);
	});
});

// Get a specific trip for a username
app.get('/api/:username/trip/:tripid', function(req, res)
{
	db.trip.findOne({_id: mongojs.ObjectId(req.params.tripid)}, function(err, trip)
	{
		res.json(trip);
	});
});

// Create a new trip for username
app.post('/api/:username/trip', function(req, res)
{
    console.log("[222222]");
    console.log(req.body);
    req.body.type = "TRIP";
    req.body.fishCount = 0;
    console.log("[3]");
    console.log(req.body);
    db.trip.insert(req.body, function (err, newTrip)
	{
        console.log("[4]");
        console.log(newTrip);
        res.json(newTrip);
	});
});

// Update trip
app.put('/api/:username/trip/:tripid', function(req, res)
{
	db.trip.findAndModify( {
	   query: {_id:mongojs.ObjectId(req.params.tripid)},
	   update: {
		   title: req.body.title,
		   start: req.body.start,
		   startTime: req.body.startTime,
		   end: req.body.end,
		   endTime: req.body.endTime,
		   notes: req.body.notes,
		   type: "TRIP",
		   username: req.body.username,
		   lastUpdated: req.body.lastUpdated
		}
	}, function(err, trip){
		res.json(trip);
	});
});

// Delete trip
app.delete('/api/:username/trip/:tripid', function(req, res)
{
	db.trip.remove({_id:mongojs.ObjectId(req.params.tripid)},
	function(err, trip){
		res.json(trip);
	});
});

/*
 * User
 */

// Register a user includes new username and password
app.post("/api/user", function(req, res)
{
	db.user.find({email: req.body.email}, function(err, user)
	{
	    if(user.length === 0) {
	    	var user = req.body;

			db.user.insert(user, function(err, newUser)
			{
				if(err) {
					res.status(400).send(err);
				} else {
					res.json(newUser);
				}
			});
			// userModel.get_encrypted_hash(user.password)
			// 	.then(
			// 		function(response) {
			// 			user.password = response;
			// 			user.password2 = response;
			// 			db.user.insert(user, function(err, newUser)
			// 			{
			// 				res.json(newUser);
			// 			});
			// 		},
			// 		function(err){
			// 			res.json({
			// 				success: false,
			// 				error: 'Unable to register user.' });
			// 		}
			// 	);
	     } else {
	     	res.json({
            success: false,
            error: 'email exist' });
	     }
	});
});

app.post("/api/forgotPassword/:username", function (req, res) {
   db.user.find({username: req.params.username}, function(err, user)
	{
		if(user[0].email){
			transporter.sendMail({    
	        to: user[0].email,
	        subject: 'Fish 360 App password ',
	        html: 'Hi '+ user[0].username +', <br> <br>  Your Password is : ' + user[0].password + ' <br> <br> Regards, <br> Fish360'
	      });
		}
	});
   res.send("email");
});


app.post("/api/:username/trip/:tripId/fish/:fishId/share", function (req, res) {
	var mailObject = req.body;


	transporter.sendMail({
		to:mailObject.email,
		subject:mailObject.subject,
		html: 'Hi '+ mailObject.username +', <br> <br>  Congratulations on catching ' + mailObject.species +
		'. Please find below the details of your catch <br> <br> Species Name :'+mailObject.species
		+'<br> <br> Common Name : '+ mailObject.common_name +'<br> <br> Length : '+ mailObject.length
		+'<br> <br> Images: <br>'+ mailObject.imgfile+'<br>'
	});
	res.send("email");
});


// update profile


app.put("/api/user/:username", function(req, res) {
	var username = req.params.username;
	console.log(req.body.commonName);
	console.log(req.body.species);
	var update = {

	};
	console.log(req.body.species);
	if (!req.body.species) {
		update = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			dateOfBirth: req.body.dateOfBirth,
			units: req.body.units,
			shareAggregate: req.body.shareAggregate
		};
	} else {
		update = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			dateOfBirth: req.body.dateOfBirth,
			units: req.body.units,
			species: req.body.species,
			commonName: req.body.commonName,
			shareAggregate: req.body.shareAggregate
		};
	}

	if (req.body.password) {
		// userModel.get_encrypted_hash(req.body.password)
		// 	.then(function (response) {
		// 			update.password = response;
		// 			updateUserDetails();
		// 		});
		update.password = req.body.password;
		updateUserDetails();
	}
	else{
		updateUserDetails();
	}

	function updateUserDetails(){
		db.user.findAndModify({
			query: {username: req.params.username},
			update: {
				$set: update
			},
			new: false
		}, function (err, doc, lastErrorObject) {
		});

		db.user.find({username: req.params.username}, function (err, user) {
			res.json(user);
		});
	}
});

// Find user by username used for registering to see if username already exists
app.get("/api/user/:username", function(req, res)
{
	db.user.find({username: req.params.username}, function(err, user)
	{
		res.json(user);
	});
});

// Find user by username and password used for login to check username and password
app.get("/api/user/:username/:password", function(req, res)
{
	var password = req.params.password;

	db.user.find(
		{username: req.params.username},
		function(err, users) {
			if(err) {
				res.send(err);
			}
			var user = users[0];
			if(user.password == password) {
				res.json(user);
			} else {
				res.send(null);
			}
			// userModel.comparePassword(req.params.password, user)
			// 	.then(function(response){
			// 		if(response){
			// 			res.json(response);
			// 		}
			// 		else{
			// 			res.send(null);
			// 		}
			// 	},
			// 		function(err){
			// 			res.send(err);
			// 		});
		// }
		// else{
		// 	res.send(null);
		// }
	});
});

// Find user by username and get User preferences of Units to be displayed
app.get("/api/user/:username/preferences/units", function(req, res)
{
	db.user.find({username: req.params.username}, function(err, user)
	{
		res.json(user[0].units);
	});
});

// Find user by username and get User preferences of default species to be displayed
app.get("/api/user/:username/preferences/defaultspecies", function(req, res)
{
	db.user.find({username: req.params.username}, function(err, user)
	{
		res.json({ species : user[0].species, commonName: user[0].commonName});
	});
});

app.post("/api/user/:username/preferences", function(req, res)
{
	console.log("Preferences");

	db.user.findAndModify({
		query: {username: req.params.username},
		update: {$set : {preferences: req.body	}},
		new: false}, function(err, doc, lastErrorObject)
	{
		console.log(err);
		console.log(doc);
		console.log(lastErrorObject);
	});
});

/*
 *	Fish
 */
// Get all fish for a given trip ID
app.get("/api/user/:username/trip/:tripid/fish", function(req, res)
{
	db.fish.find({trip_id: mongojs.ObjectId(req.params.tripid)}, function(err, fishes)
	{
		res.json(fishes);
	});
});
// Get all fish for a user
app.get("/api/allFish/:username", function(req, res)
{
	console.log("Get all fish for user " + req.params.username);
	db.fish.find({username: req.params.username}, function(err, fish)
	{
		res.json(fish);
	});
});
// Create a new Fish
app.post("/api/user/:username/trip/:tripid/fish", function(req, res)
{
	var newFish = req.body;
	newFish.type = "FISH";
	var username = req.params.username;
	newFish.trip_id = mongojs.ObjectId(req.params.tripid);
	newFish.username = username;
	db.fish.insert(newFish, function(err, newFish)
	{
	    db.trip.findAndModify({
	        query: { _id: mongojs.ObjectId(req.params.tripid) },
	        update: {
	            $inc: {fishCount : 1}
	        }
	    }, function (err, trip) {
	        res.json(newFish);
	    });
	});
});
// Get a particular fish
app.get("/api/user/:username/trip/:tripid/fish/:fishid", function(req, res){
	db.fish.findOne({_id: mongojs.ObjectId(req.params.fishid)}, function(err, fishes){
		res.json(fishes);
	});
});
// Delete a particular fish
app.delete("/api/user/:username/trip/:tripid/fish/:fishid", function(req, res){
	db.fish.remove({_id: mongojs.ObjectId(req.params.fishid)}, function(err, newFish){
	    db.fish.find(function (err, fishes) {
	        db.trip.findAndModify({
	            query: { _id: mongojs.ObjectId(req.params.tripid) },
	            update: {
	                $inc: { fishCount: -1 }
	            }
	        }, function (err, trip) {
	            res.json(fishes);
	        });
		});
	});
});
// Update a fish
app.put("/api/user/:username/trip/:tripId/fish/:id", function(req, res){
	delete req.body._id;
	req.body.trip_id = mongojs.ObjectId(req.params.tripId);
	req.body.type = "FISH";
	req.body.username = req.params.username;

	db.fish.update({_id: mongojs.ObjectId(req.params.id)}, req.body, function(err, newFish){
		db.fish.find(function(err, fishes){
			res.json(fishes);
		});
	});
});


app.post("/checkout", checkout);
app.get("/client_token", getClientToken);

function getClientToken (req, res) {
	gateway.clientToken.generate({}, function (err, response) {
		res.send(response.clientToken);
	});
}

function checkout(req, res) {
	var nonceFromTheClient = req.body.payment_method_nonce;
	var customer = req.body;
	console.log(req.params);
	console.log("CUSTOMER");
	console.log(customer);
	var username = customer.username;

	gateway.customer.create({
		firstName: customer.firstName,
		lastName: customer.lastName,
		email: customer.email,
		//,paymentMethodNonce: nonceFromTheClient
	}, function (err, result) {
		console.log("CUSTOMER CALLBACK");
		console.log(result);
		//result.success;
		//// true
		//
		//result.customer.id;
		// e.g. 494019

		var customer = result.customer;

		gateway.paymentMethod.create({
			customerId: customer.id,
			paymentMethodNonce: nonceFromTheClient
		}, function (err, result) {

			console.log("PAYMENT_METHOD CALLBACK");
			console.log(result);

			var paypalAccount = result.paypalAccount;
			var paymentMethod = result.paymentMethod;

			gateway.subscription.create({
				paymentMethodToken: paymentMethod.token,
				planId: "fish360proangler",//"cs5610planId"
			}, function (err, result) {

				console.log("SUBSCRIPTION CALLBACK");
				console.log(result);

				db.user.findAndModify({
					query: {username: customer.username},
					update: {$set: {plan: 'PRO ANGLER'}}
				}, function(err, doc, lastErrorObject){
					console.log("USER");
					console.log(doc);

					res.redirect("/#/"+username+"/profile");

				});

				//db.user.findAndModify({
				//	query: {username: customer.username},
				//	update: {$set : {preferences: req.body	}},
				//	new: false}, function(err, doc, lastErrorObject)
				//{
				//	console.log(err);
				//	console.log(doc);
				//	console.log(lastErrorObject);
				//});

//				res.send(result);

			});
		});
	});

	//gateway.transaction.sale({
	//    amount: '10.00',
	//    paymentMethodNonce: nonceFromTheClient,
	//}, function (err, result) {
    //
	//});

	//var body = req.body;
	//res.json(body);
}

app.get('/api/pwd', function(req, res){
	res.send(__dirname);
});

app.get('/api/datadir', function(req, res){
	res.send(process.env.OPENSHIFT_DATA_DIR);
});

app.get('/api/env', function(req, res){
	res.send(process.env);
});


require("./app/app.js")(app, db);

app.listen(port, ipaddress);
