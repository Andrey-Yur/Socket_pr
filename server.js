const express = require('express');
const bodyParser = require('body-parser');
const { log, error } = require('console');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/message';

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const Message = mongoose.model('Message', {
	name: String,
	message: String,
});

app.get('/messages', async (req, res) => {
	const messages = await Message.find({});
	if (messages) res.send(messages);
});
app.post('/messages', async (req, res) => {
	const message = new Message(req.body);
	const newMessage = await message.save();
	if (!newMessage) sendStatus(500);
	io.emit('message', req.body);
	res.sendStatus(200);
});

io.on('connection', (socket) => {
	console.log('user connected');
});

mongoose.connect(dbUrl).catch((error) => {
	console.log('MongoDB connection', error);
});
// mongoose.connect(dbUrl, { useMongoClient: true }, (err) => {
// 	console.log('MongoDB connection', err);
// });
const server = http.listen(3000, () => {
	console.log('Server is listening on port', server.address().port);
});
