/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './redux/create';
import io from 'socket.io-client';
import { Provider } from 'react-redux';
import ApiClient from './helpers/ApiClient.js';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ReduxAsyncConnect } from 'redux-async-connect';
import useScroll from 'scroll-behavior/lib/useStandardScroll';

import getRoutes from './routes';

const client = new ApiClient();
const _browserHistory = useScroll(() => browserHistory)();
const dest = document.getElementById('content');
const store = createStore(_browserHistory, client, window.__data);
const history = syncHistoryWithStore(_browserHistory, store);

function initSocket() {
  let socket = io('', {
    path: '/ws',
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10 //for demo purpose
  });
  socket.on('snapshot', (data) => {
    console.log(data);
    socket.emit('my other event', { my: 'data from client' });
  });
  socket.on('update', (data) => {
    console.log(data);
  });
  socket.on('disconnect',() => {
    console.log("disconnect");
  });
  socket.on('reconnect_attempt', (number) => {
    console.log("reconnect_attempt", number);
  });
  socket.on('reconnect', () => {
    console.log("reconnect");
  });
  socket.on('reconnect_error', () => {
    console.log("reconnect_error");
  });
  socket.on('reconnect_failed', () => {
    console.log("reconnect_failed");
  });
  
  return socket;
}
global.socket = initSocket();

const component = (
  <Router
    render={(props) =>
        <ReduxAsyncConnect {...props} helpers={{client}} filter={item => !item.deferred} />
      } history={history}>
    {getRoutes(store)}
  </Router>
);

ReactDOM.render(
  <Provider store={store} key="provider">
    {component}
  </Provider>,
  dest
);
