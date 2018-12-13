import * as React from 'react';
import * as ReactDOM from 'react-dom';
import NewTab from './newtab';

document.addEventListener('DOMContentLoaded', function() {
    ReactDOM.render(<NewTab />, document.getElementById('main'));
});