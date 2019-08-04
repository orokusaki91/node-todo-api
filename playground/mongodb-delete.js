const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost', { useNewUrlParser: true }, (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}

	console.log('Connected to MongoDB');

	var db = client.db('TodoApp');

	db.collection('Todos').deleteMany({ text: 'Eat dinner' }).then((result) => {
		console.log(result);
	}, (err) => {

	});

	// client.close();
});