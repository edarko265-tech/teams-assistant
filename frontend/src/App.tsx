/**
 * App Component - Main application entry point
 * Sets up the three-column layout like Microsoft Teams
 */

import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import LoginPage from './components/LoginPage';
import './styles/teams.css';

/**
 * Main content component that conditionally renders login or main app
 */
function AppContent() {
  const { isAuthenticated } = useAppContext();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
