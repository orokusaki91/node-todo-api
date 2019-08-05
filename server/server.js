require('./config/config');

var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');

var { mongoose } = require('./database/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { auth } = require('./middleware/auth');

var app = express();
var port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/todos', auth, (req, res) => {
	var todo = new Todo({
		text: req.body.text,
		user_id: req.user._id
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', auth, (req, res) => {
	Todo.find({
		user_id: req.user.id
	}).then((todos) => {
		res.send({ todos });
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos/:id', auth, (req, res) => {
	var id = req.params.id;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send('Invalid ID.');
	}

	Todo.findOne({
		_id: id,
		user_id: req.user.id
	}).then((todo) => {
		if (!todo) {
			return res.status(404).send('Todo cannot be found');
		}

		res.send({ todo });
	}).catch((e) => {
		res.status(400).send({ code: 400, message: 'Something went wrong with the request'});
	});
});

app.delete('/todos/:id', auth, (req, res) => {
	var id = req.params.id;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send({
			code: 404,
			message: 'Invalid ID'
		});
	}

	Todo.findOneAndRemove({
		_id: id,
		user_id: req.user.id
	}).then((todo) => {
		if (!todo) {
			return res.status(404).send({
				code: 404,
				message: 'Todo canot be found'
			});
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send({ code: 400, message: 'Something went wrong with the request'});
	});
});

app.patch('/todos/:id', auth, (req, res) => {
	var id = req.params.id;

	var body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectID.isValid(id)) {
		return res.status(404).send({
			code: 404,
			message: 'Invalid ID'
		});
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate({
		_id: id,
		user_id: req.user.id
	}, {
		$set: body
	}, {
		new: true
	}).then((todo) => {
		if (!todo) {
			return res.status(404).send({
				code: 404,
				message: 'Todo canot be found'
			});
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send({ code: 400, message: 'Something went wrong with the request'});
	});
});

app.post('/users', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	var user = new User(body);

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send({
			code: 400,
			message: 'There was an error saving the user'
		});
	});
});

app.post('/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send({
			code: 400,
			message: 'There was an logging the user in'
		});
	});
});

app.post('/logout', auth, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send({
			code: 200,
			message: 'User logged out'
		});
	}).catch((e) => {
		res.status(400).send({
			code: 400,
			message: 'There was an logging the user out'
		});
	});
});

app.get('/users/me', auth, (req, res) => {
	res.send(req.user);
});

app.listen(port, () => {
	console.log('Started on port', port);
});

module.exports = { app };