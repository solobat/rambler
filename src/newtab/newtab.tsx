import * as React from 'react';
import './newtab.scss';
import Upload from 'rc-upload';
import * as bookController from '../server/controller/bookController';
import * as paragraphController from '../server/controller/paragraphController';
import { sliceFileToParagraphs } from '../util/file';

interface AppProps {}

interface AppState {}

const style = `
        .rc-upload-disabled {
           opacity:0.5;
        `;

const uploaderProps = {
    accept: 'text/plain',
    beforeUpload(file) {
      console.log('beforeUpload', file);

      sliceFileToParagraphs(file).then((resp: string[]) => {
        console.log(resp);
      });
      
      return false;
    },
    onStart: (file) => {
      console.log('onStart', file.name);
    },
    onSuccess(file) {
      console.log('onSuccess', file);
    },
    onProgress(step, file) {
      console.log('onProgress', Math.round(step.percent), file.name);
    },
    onError(err) {
      console.log('onError', err);
    }
}

export default class Popup extends React.Component<AppProps, AppState> {
    constructor(props: AppProps, state: AppState) {
        super(props, state);
    }

    componentDidMount() {

    }

    render() {
        return (
            <div className="popupContainer" style={{
                height: 200,
                overflow: 'auto',
                border: '1px solid red',
              }}>
                <style>
                    {style}
                </style>
                <Upload {...uploaderProps}>
                    <a>开始上传2</a>
                </Upload>
            </div>
        )
    }
}
