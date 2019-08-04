const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost', { useNewUrlParser: true }, (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}

	console.log('Connected to MongoDB');

	var db = client.db('TodoApp');

	db.collection('Todos').findOneAndUpdate({ 
		_id: new ObjectID('5d46f2b4ae258531626e2efe') 
	}, {
		$set: {
			completed: true
		}
	}, {
		returnOriginal: false
	}).then((result) => {
		console.log(result);
	});

	// client.close();
});