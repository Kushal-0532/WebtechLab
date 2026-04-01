import { useState, useEffect } from 'react'

function ApiDataFetcher() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="fetch-card">
      <h1>Posts from API</h1>
      {loading && <p className="status-msg">Loading...</p>}
      {error && <p className="error-msg">Error: {error}</p>}
      {!loading && !error && (
        <ul className="post-list">
          {posts.map(post => (
            <li key={post.id} className="post-item">
              <h3>{post.title}</h3>
              <p>{post.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ApiDataFetcher;
