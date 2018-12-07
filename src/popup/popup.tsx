import * as React from 'react';
import './Popup.scss';

interface AppProps {}

interface AppState {}

export default class Popup extends React.Component<AppProps, AppState> {
    constructor(props: AppProps, state: AppState) {
        super(props, state);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className="popupContainer">
                Enjoy it
            </div>
        )
    }
}
