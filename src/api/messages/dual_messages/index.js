import express from 'express';
import MessageModel from './model.js';

const messageRouter = express.Router();

// Get all messages
messageRouter.get('/', async (req, res, next) => {
    try {
        const messages = await MessageModel.findAll();
        res.json(messages);
    } catch (error) {
        next(error);
    }
});

// Get one message
messageRouter.get('/:id', async (req, res, next) => {
    try {
        const message = await MessageModel.findByPk(req.params.id);
        if (message) {
            res.json(message);
        } else {
            res.status(404).send('Message not found');
        }
    } catch (error) {
        next(error);
    }
});

// Create a new message
messageRouter.post('/', async (req, res, next) => {
    try {
        const newMessage = await MessageModel.create(req.body);
        res.status(201).json(newMessage);
        req.io.emit('newMessage', newMessage); // Emitting event via Socket.IO
    } catch (error) {
        next(error);
    }
});

// Update a message
messageRouter.put('/:id', async (req, res, next) => {
    try {
        const updatedMessage = await MessageModel.update(req.body, {
            where: { message_id: req.params.id }
        });
        res.json(updatedMessage);
        req.io.emit('updatedMessage', updatedMessage); // Emitting event via Socket.IO
    } catch (error) {
        next(error);
    }
});

// Delete a message
messageRouter.delete('/:id', async (req, res, next) => {
    try {
        const result = await MessageModel.destroy({
            where: { message_id: req.params.id }
        });
        res.status(204).send();
        req.io.emit('deletedMessage', req.params.id); // Emitting event via Socket.IO
    } catch (error) {
        next(error);
    }
});

export default messageRouter;
