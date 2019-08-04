var { ObjectID } = require('mongodb');

var { mongoose } = require('./../server/database/mongoose');
var { Todo } = require('./../server/models/todo');

var id = '5d46f736d06ed339b3be67dd';

if (!ObjectID.isValid(id)) {
	console.log('Id not valid');
}

Todo.find({ _id: id }).then((todos) => {
	console.log('Todos', todos);
});

Todo.find({ _id: id }).then((todo) => {
	console.log('Todo', todo);
});

Todo.findById(id).then((todo) => {
	if (!todo) {
		return console.log('Todo not found');
	}

	console.log('Todo', todo);
}).catch((e) => {
	console.log(e);
});