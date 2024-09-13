import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

function App() {
  const editorRef = useRef();
  const [status, setStatus] = useState('Connecting...');
  const [username, setUsername] = useState(''); // Username stored for each tab
  const [activeUsers, setActiveUsers] = useState([]); // Track active users
  const [lastUpdate, setLastUpdate] = useState({ user: 'Unknown', time: 'Unknown' }); // Last update info

  // Ref to track if the username prompt has been shown
  const hasPromptedForUsername = useRef(false);

  useEffect(() => {
    // Ensure the prompt is only shown once by using a ref
    if (!hasPromptedForUsername.current && !username) {
      hasPromptedForUsername.current = true; // Mark that the prompt has been shown
      const name = prompt('Please enter your username:');
      if (name) {
        setUsername(name);
      }
    }

    if (username) {
      console.log('Creating Yjs document...');
      const ydoc = new Y.Doc();
      console.log('Yjs document created:', ydoc);

      console.log('Setting up WebSocketProvider...');
      const wsProvider = new WebsocketProvider('ws://localhost:5555', 'my-roomname', ydoc);

      // Log WebSocket status and update the connection status label
      wsProvider.on('status', (event) => {
        console.log(`WebSocket status: ${event.status}`);
        setStatus(event.status.charAt(0).toUpperCase() + event.status.slice(1));
      });

      // Get the shared Yjs Map for active users
      const usersMap = ydoc.getMap('activeUsers');
      console.log('Yjs Map for active users created:', usersMap);

      // Add the current user to the map only once, when the client connects
      if (!usersMap.has(username)) {
        usersMap.set(username, 'active');
      }

      // Observe changes to the users map and update active users list
      usersMap.observe(() => {
        const users = [];
        usersMap.forEach((status, user) => {
          if (status === 'active') {
            users.push(user);
          }
        });
        setActiveUsers(users);
        console.log('Active users:', users);
      });

      // Get the shared Yjs text type for the collaborative editor
      const ytext = ydoc.getText('editor');
      console.log('Yjs text type created:', ytext);

      // Get the Yjs Map to track the last update information
      const lastUpdateMap = ydoc.getMap('lastUpdate');
      console.log('Yjs Map for last update created:', lastUpdateMap);

      // Sync changes from Yjs to the textarea
      const editor = editorRef.current;
      editor.value = ytext.toString();

      ytext.observe(() => {
        // Sync changes from Yjs to the textarea
        if (editor.value !== ytext.toString()) {
          editor.value = ytext.toString();
        }
      });

      // Observe changes to the last update map
      lastUpdateMap.observe(() => {
        const lastUser = lastUpdateMap.get('user') || 'Unknown';
        const lastTime = lastUpdateMap.get('time') || 'Unknown';
        setLastUpdate({ user: lastUser, time: lastTime });
      });

      // Sync changes from the textarea to Yjs incrementally
      const handleInput = () => {
        const inputValue = editor.value;
        const previousValue = ytext.toString();

        let commonPrefixLength = 0;
        while (commonPrefixLength < inputValue.length && inputValue[commonPrefixLength] === previousValue[commonPrefixLength]) {
          commonPrefixLength++;
        }

        let commonSuffixLength = 0;
        while (
          commonSuffixLength < inputValue.length - commonPrefixLength &&
          inputValue[inputValue.length - 1 - commonSuffixLength] === previousValue[previousValue.length - 1 - commonSuffixLength]
        ) {
          commonSuffixLength++;
        }

        ydoc.transact(() => {
          ytext.delete(commonPrefixLength, previousValue.length - commonPrefixLength - commonSuffixLength);
          ytext.insert(commonPrefixLength, inputValue.slice(commonPrefixLength, inputValue.length - commonSuffixLength));
        });

        // Update the last update information in the Y.Map
        const now = new Date().toLocaleTimeString();
        lastUpdateMap.set('user', username);
        lastUpdateMap.set('time', now);
      };

      editor.addEventListener('input', handleInput);

      // Cleanup event listener and disconnect WebSocket on unmount
      return () => {
        console.log('Cleaning up...');
        editor.removeEventListener('input', handleInput);
        wsProvider.disconnect();
        console.log('WebSocket disconnected.');
        usersMap.set(username, 'inactive'); // Mark user as inactive when the component is unmounted
      };
    }
  }, [username]);

  return (
    <div className="App">
      <h1>Collaborative Text Editor with Yjs</h1>
      {/* Connection Status Label */}
      <p>Status: <span style={{ color: status === 'Connected' ? 'green' : 'red' }}>{status}</span></p>
      
      {/* Last Update Info */}
      <p>Last Update: <span>{lastUpdate.user} at {lastUpdate.time}</span></p>
      
      {/* Active Users */}
      <h3>Active Users:</h3>
      <ul>
        {activeUsers.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>

      <textarea
        ref={editorRef}
        style={{ width: '100%', height: '400px' }}
        placeholder="Start typing..."
      ></textarea>
    </div>
  );
}

export default App;
