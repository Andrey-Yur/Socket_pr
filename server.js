const express = require('express');
const bodyParser = require('body-parser');
const { log } = require('console');
const app = express();
const http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const messages = [
	{ name: 'Tim', message: 'Hi' },
	{ name: 'Jake', message: 'Hello' },
];

app.get('/messages', (req, res) => {
	res.send(messages);
});
app.post('/messages', (req, res) => {
	messages.push(req.body);
	io.emit('message', req.body);
	res.sendStatus(200);
});

io.on('connection', (socket) => {
	console.log('user connected');
});
const server = http.listen(3000, () => {
	console.log('Server is listening on port', server.address().port);
});
