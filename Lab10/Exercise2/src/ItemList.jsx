import { useState } from 'react'

const initialItems = [
  { id: 1, text: 'Buy groceries' },
  { id: 2, text: 'Complete assignment' },
  { id: 3, text: 'Read a book' },
];

function ItemList() {
  const [items, setItems] = useState(initialItems);
  const [input, setInput] = useState('');
  const [nextId, setNextId] = useState(4);

  function addItem() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setItems([...items, { id: nextId, text: trimmed }]);
    setNextId(nextId + 1);
    setInput('');
  }

  function removeItem(id) {
    setItems(items.filter(item => item.id !== id));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') addItem();
  }

  return (
    <div className="list-card">
      <h1>Task List</h1>
      <div className="list-input-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
        />
        <button onClick={addItem} className="add-btn">Add</button>
      </div>
      {items.length === 0 ? (
        <p className="empty-msg">No tasks yet. Add one above!</p>
      ) : (
        <ul className="task-list">
          {items.map(item => (
            <li key={item.id} className="task-item">
              <span>{item.text}</span>
              <button onClick={() => removeItem(item.id)} className="remove-btn">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ItemList;
