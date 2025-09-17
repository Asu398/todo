const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const CLIENT_DIR = path.resolve(__dirname, '..', '..', 'client');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

function sendStaticFile(res, relativePath) {
  const fullPath = path.resolve(CLIENT_DIR, relativePath);

  if (!fullPath.startsWith(CLIENT_DIR)) {
    res.status(403).end('Forbidden');
    return;
  }

  fs.readFile(fullPath, (error, data) => {
    if (error) {
      res.status(404).end('Not Found');
      return;
    }

    const ext = path.extname(fullPath);
    const type = MIME_TYPES[ext] || 'text/plain; charset=utf-8';
    res.setHeader('Content-Type', type);
    res.end(data);
  });
}

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  let tasks = [];
  let nextId = 1;

  app.locals.resetTasks = () => {
    tasks = [];
    nextId = 1;
  };

  app.get('/api/tasks', (_req, res) => {
    res.json(tasks);
  });

  app.post('/api/tasks', (req, res) => {
    const { text } = req.body || {};
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const newTask = { id: nextId++, text: text.trim() };
    tasks.push(newTask);
    res.status(201).json(newTask);
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Task id must be a number' });
    }

    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [removed] = tasks.splice(index, 1);
    res.json(removed);
  });

  app.get('/', (_req, res) => {
    sendStaticFile(res, 'index.html');
  });

  app.get('/src/:file', (req, res) => {
    sendStaticFile(res, path.join('src', req.params.file));
  });

  return app;
}

module.exports = { createApp };
