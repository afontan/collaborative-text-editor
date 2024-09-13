# Collaborative Text Editor with Yjs

This project is a real-time collaborative text editor built using **React**, **Yjs** (a powerful CRDT library for real-time collaboration), and **WebSockets**. The app allows multiple users to simultaneously edit a text document and view each other's presence. It also displays information about the last update, including the user who made the change and the time the update was made.

## Features

- **Real-time Collaboration**: Multiple users can edit the document at the same time.
- **User Presence**: A list of active users is displayed, showing who is currently working on the document.
- **Last Update Information**: The editor shows who last updated the document and when.
- **WebSocket Connection Status**: Displays the connection status (Connected, Disconnected, Connecting).

## Technologies Used

- **React**: For the user interface and handling state.
- **Yjs**: A CRDT library to manage real-time collaboration and conflict resolution.
- **WebSocket**: Used via `y-websocket` to synchronize the document across multiple clients in real-time.
- **Y.Map**: Used to store user presence and last update information.

## How It Works

### CRDTs (Conflict-Free Replicated Data Types)

This project uses **Yjs**, which provides several CRDT types to ensure consistency across clients:

1. **Y.Text**: The text editor uses `Y.Text` to synchronize the content of the text document in real time.
2. **Y.Map**: 
   - A `Y.Map` named `activeUsers` is used to track which users are currently active in the session.
   - Another `Y.Map` named `lastUpdate` is used to store information about the last user who updated the document and the time of the update.

### Real-time Synchronization

The document is synchronized in real-time using **WebSockets** via `y-websocket`. Whenever a user makes a change, the change is sent to the server and propagated to other clients. The server ensures that all clients remain in sync, and Yjs takes care of conflict resolution using its CRDT-based algorithms.

## Getting Started

### Prerequisites

You need to have **Node.js** and **npm** installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/afontan/collaborative-text-editor.git
   cd collaborative-text-editor
   ```

2. **Install the dependencies** for the React app:
   ```bash
   cd client
   npm install
   ```

3. **Install the dependencies** for the WebSocket server:
   ```bash
   cd ../server
   npm install
   ```

### Running the Project

There are two parts to this project: the **WebSocket server** and the **React client**.

#### 1. Start the WebSocket Server

Navigate to the `server` directory and run:

```bash
cd server
node server.js
```

The server will start on port `5555`, and you should see output like:

```
WebSocket server is running on ws://localhost:5555
```

#### 2. Start the React Client

In a separate terminal, navigate to the `client` directory and run:

```bash
cd client
npm start
```

This will start the React development server and open the app in your default browser at `http://localhost:3000`.

### Using the App

1. When you first load the app, you'll be prompted to **enter your username**. Each tab or session will have a unique user name.
2. You can **start typing** in the editor, and your changes will be synchronized in real time with other users.
3. A list of **active users** will be displayed, showing who is currently online and editing the document.
4. The **last update** information will be displayed, showing the user who last made a change and the time the change occurred.

### Project Structure

```
.
├── client                   # React client
│   ├── src                  # Source code for the client
│   │   ├── App.js           # Main React component
│   │   └── index.js         # Entry point for the React app
│   └── package.json         # Client dependencies
└── server                   # WebSocket server
    ├── server.js            # WebSocket server setup
    └── package.json         # Server dependencies
```

## Key Components

### Client (\`client/src/App.js\`)

- **Username Prompt**: When the app first loads, the user is prompted to enter a username.
- **Yjs Document**: A Yjs document (\`Y.Doc()\`) is created, which stores the shared \`Y.Text\` and \`Y.Map\` objects.
- **Active Users**: Active users are tracked using a \`Y.Map\` object, where each user is marked as active or inactive.
- **Last Update**: The last update (user and timestamp) is stored in another \`Y.Map\` object and updated whenever a user makes changes to the document.
- **WebSocket Provider**: The \`WebsocketProvider\` from \`y-websocket\` is used to connect all clients and keep them in sync.

### WebSocket Server (\`server/server.js\`)

- **WebSocket Setup**: The server uses \`y-websocket\` to synchronize changes across multiple clients. It listens for WebSocket connections and handles document synchronization.
- **Yjs Synchronization**: The server automatically handles synchronization of the Yjs document (the text editor content and user presence information).

## Code Highlights

### Handling User Presence

```javascript
const usersMap = ydoc.getMap('activeUsers');
if (!usersMap.has(username)) {
  usersMap.set(username, 'active');
}
```
- This \`Y.Map\` keeps track of all users that are currently active in the session.

### Tracking the Last Update

```javascript
const lastUpdateMap = ydoc.getMap('lastUpdate');
lastUpdateMap.set('user', username);
lastUpdateMap.set('time', new Date().toLocaleTimeString());
```
- This code updates the \`Y.Map\` called \`lastUpdate\` with the username and time whenever a user makes a change.

## Troubleshooting

- **Double Username Prompt**: If you're prompted for the username twice on page load, ensure you're using \`useRef\` to track if the prompt has already been shown (this can happen due to React's strict mode).
  
  ```javascript
  const hasPromptedForUsername = useRef(false);
  ```

- **WebSocket Connection Issues**: Ensure the WebSocket server is running on port \`5555\`. If the connection is not established, check your network or firewall settings.

## Future Improvements

- **Authentication**: Add user authentication to prevent users from choosing the same username.
- **Rich Text Support**: Extend the editor to support rich-text formatting (bold, italics, etc.) using \`Y.XmlFragment\`.
- **Persistence**: Store the document state on a database so that the changes are persisted between sessions.
