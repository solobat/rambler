import * as React from 'react';
import * as ReactDOM from 'react-dom';
import NewTab from './newtab';

requestAnimationFrame(function() {
    ReactDOM.render(<NewTab />, document.getElementById('main'));
});
