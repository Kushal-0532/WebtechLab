import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-card">
      <h1>Counter</h1>
      <p className="counter-value">{count}</p>
      <div className="counter-buttons">
        <button onClick={() => setCount(count - 1)}>Decrement</button>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </div>
  );
}

export default Counter;
