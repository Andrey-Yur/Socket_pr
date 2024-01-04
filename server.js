import express from 'express';
import pkg from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { mongoose } from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const { json, urlencoded } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbUrl = 'mongodb://localhost:27017/message';

app.use(express.static(__dirname));
app.use(json());
app.use(urlencoded({ extended: false }));

const Message = mongoose.model('Message', {
	name: String,
	message: String,
});

app.get('/messages', async (req, res) => {
	const messages = await Message.find({});
	if (messages) res.send(messages);
});
app.get('/messages/:user', async (req, res) => {
	const user = req.params.user;
	const messages = await Message.find({ name: user });
	if (messages) res.send(messages);
});
app.post('/messages', async (req, res) => {
	try {
		const message = new Message(req.body);
		const newMessage = await message.save();
		const censored = await Message.findOneAndDelete({ message: 'badword' });
		if (!censored) {
			io.emit('message', req.body);
			res.sendStatus(200);
		}
	} catch (error) {
		res.sendStatus(500);
		return console.error(error);
	} finally {
		//logger.log('message post called)
		console.log('Message post called');
	}
});

io.on('connection', (socket) => {
	console.log(`Socket ${socket.id} connected`);
});

mongoose.connect(dbUrl).catch((error) => {
	console.log('MongoDB connection', error);
});

server.listen(3000, () => {
	console.log('Server is listening on port', server.address().port);
});
