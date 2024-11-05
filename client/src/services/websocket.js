// services/websocket.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo = null;

export const initializeWebSocket = (token) => {
  window.Pusher = Pusher;

  echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.REACT_APP_WEBSOCKET_KEY,
    wsHost: window.location.hostname,
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return echo;
};

export const subscribeToGroup = (groupId, callbacks) => {
  if (!echo) throw new Error('WebSocket not initialized');

  return echo.private(`group.${groupId}`)
    .listen('MessageSent', callbacks.onMessage)
    .listen('GroupMemberAdded', callbacks.onMemberAdded)
    .listen('GroupMemberLeft', callbacks.onMemberLeft)
    .listen('GroupUpdated', callbacks.onGroupUpdated);
};

export const leaveGroupChannel = (groupId) => {
  if (!echo) return;
  echo.leave(`group.${groupId}`);
};