import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import ProductList from './components/ProductList';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('products');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>E-Commerce Demo App</h1>
        {user && (
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>
      
      <main className="App-main">
        {view === 'login' ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <ProductList />
        )}
      </main>
    </div>
  );
}

export default App;
