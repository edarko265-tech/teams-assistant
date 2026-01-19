/**
 * App Component - Main application entry point
 * Sets up the three-column layout like Microsoft Teams
 */

import React from 'react';
import { AppProvider } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './styles/teams.css';

function App() {
  return (
    <AppProvider>
      <div className="app">
        <Sidebar />
        <ChatWindow />
      </div>
    </AppProvider>
  );
}

export default App;
