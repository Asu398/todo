import React from './mini-react.js';

const API_BASE_URL = 'http://localhost:3001/api/tasks';

function App() {
  const [tasks, setTasks] = React.useState([]);
  const [newTask, setNewTask] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError('タスクの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = newTask.trim();
    if (!trimmed) {
      setError('タスクを入力してください');
      return;
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      const created = await response.json();
      setTasks((current) => [...current, created]);
      setNewTask('');
      setError('');
    } catch (err) {
      setError('タスクの追加に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      await response.json();
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (err) {
      setError('タスクの削除に失敗しました');
    }
  };

  const summaryMessage = loading
    ? 'データを読み込み中...'
    : tasks.length === 0
    ? '最初のタスクを追加して、素敵な一日をスタートさせましょう。'
    : tasks.length < 4
    ? 'いいリズムです。この調子で進めましょう。'
    : 'タスクが盛りだくさん。優先順位を決めて丁寧にこなしていきましょう。';

  const taskItems = tasks.map((task) =>
    React.createElement(
      'li',
      { key: task.id, className: 'task-item' },
      React.createElement('span', { className: 'task-text' }, task.text),
      React.createElement(
        'button',
        {
          type: 'button',
          className: 'delete-button',
          onClick: () => handleDelete(task.id),
        },
        '完了'
      )
    )
  );

  return React.createElement(
    'div',
    { className: 'app-container' },
    React.createElement(
      'header',
      { className: 'app-header' },
      React.createElement(
        'div',
        { className: 'header-top' },
        React.createElement('h1', null, 'ToDo リスト'),
        React.createElement('span', { className: 'daily-badge' }, '今日もお疲れさま')
      ),
      React.createElement(
        'p',
        { className: 'subtitle' },
        '毎日使いたくなる、やさしいタスク管理体験をあなたに。'
      ),
      React.createElement(
        'div',
        { className: 'task-insight' },
        React.createElement(
          'div',
          { className: 'task-stats' },
          React.createElement('span', { className: 'task-count' }, tasks.length),
          React.createElement('span', { className: 'task-count-label' }, 'タスク')
        ),
        React.createElement('p', { className: 'task-summary' }, summaryMessage)
      )
    ),
    React.createElement(
      'form',
      { className: 'task-form', onSubmit: handleSubmit },
      React.createElement('input', {
        type: 'text',
        value: newTask,
        placeholder: 'タスクを入力',
        onInput: (event) => setNewTask(event.target.value),
        className: 'task-input',
      }),
      React.createElement('button', { type: 'submit', className: 'add-button' }, '追加')
    ),
    React.createElement(
      'section',
      { className: 'task-section' },
      error
        ? React.createElement('div', { className: 'error-message' }, error)
        : null,
      loading
        ? React.createElement('p', { className: 'status-message' }, '読み込み中...')
        : React.createElement(
            'ul',
            { className: 'task-list' },
            taskItems.length > 0
              ? taskItems
              : React.createElement('li', { className: 'empty-message' }, 'タスクがありません')
          )
    )
  );
}

export default App;
