const { createApp } = require('../src/app');

describe('Tasks API', () => {
  let app;
  let server;
  let baseURL;

  beforeEach(async () => {
    app = createApp();
    app.locals.resetTasks();
    server = await new Promise((resolve) => {
      const srv = app.listen(0, () => {
        const { port } = srv.address();
        baseURL = `http://127.0.0.1:${port}`;
        resolve(srv);
      });
    });
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('GET /api/tasks returns empty list initially', async () => {
    const response = await fetch(`${baseURL}/api/tasks`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  test('POST /api/tasks adds a new task', async () => {
    const createResponse = await fetch(`${baseURL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'My task' }),
    });
    const created = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(created).toMatchObject({ text: 'My task' });
    expect(typeof created.id).toBe('number');

    const listResponse = await fetch(`${baseURL}/api/tasks`);
    const list = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ text: 'My task' });
  });

  test('POST /api/tasks validates task text', async () => {
    const response = await fetch(`${baseURL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '   ' }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Task text is required' });
  });

  test('DELETE /api/tasks/:id removes an existing task', async () => {
    const createResponse = await fetch(`${baseURL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Task to delete' }),
    });
    const created = await createResponse.json();

    const deleteResponse = await fetch(`${baseURL}/api/tasks/${created.id}`, {
      method: 'DELETE',
    });
    const deleted = await deleteResponse.json();

    expect(deleteResponse.status).toBe(200);
    expect(deleted).toMatchObject({ id: created.id, text: 'Task to delete' });

    const listResponse = await fetch(`${baseURL}/api/tasks`);
    const list = await listResponse.json();
    expect(list).toHaveLength(0);
  });

  test('DELETE /api/tasks/:id validates id parameter', async () => {
    const invalidResponse = await fetch(`${baseURL}/api/tasks/abc`, {
      method: 'DELETE',
    });
    expect(invalidResponse.status).toBe(400);

    const missingResponse = await fetch(`${baseURL}/api/tasks/999`, {
      method: 'DELETE',
    });
    expect(missingResponse.status).toBe(404);
  });
});
