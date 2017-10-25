import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import {
    TransparentPrimaryButton,
    TransparentDangerButton,
} from '../Button';

const propTypes = {
    file: PropTypes.object.isRequired, // eslint-disable-line
    autoStart: PropTypes.bool,
    uploadUrl: PropTypes.string,
    /*
    onComplete: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    */
};

const defaultProps = {
    uploadUrl: '/upload/url/',
    autoStart: false,
};

// Upload States
const NOT_READY = -1; // initial state
const READY = 0; // file loader has loaded file
const UPLOADING = 1; // upload has started
const COMPLETE = 2; // upload has completed
const FAIL = 3; // upload failed

// TODO: handle fail

/**
 * Basic FileUploader component
 */
@CSSModules(styles, { allowMultiple: true })
export default class FileUploader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            status: NOT_READY,
            progress: 0,
        };

        const autoUploadFn = () => {
            if (this.props.autoStart) {
                this.onStart();
            }
        };

        const reader = new FileReader();
        reader.onload = (evt) => {
            this.setState(
                {
                    status: READY,
                    fileToSend: evt.target.result,
                },
                autoUploadFn,
            );
        };
        reader.readAsBinaryString(this.props.file);

        this.xhr = this.createXHRRequest();
    }

    componentWillUnmount() {
        this.closeXHRRequest();
    }

    onStart = () => {
        // abort if existing
        this.closeXHRRequest();

        const formData = new FormData();
        formData.append('file', this.state.fileToSend);
        formData.append('title', 'Bibek F. Dahal');

        this.xhr.open('POST', this.props.uploadUrl);
        // this.xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
        this.xhr.send(formData);
    }

    onAbort = () => {
        this.closeXHRRequest();
        this.setState({ status: READY });
    }

    createXHRRequest = () => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progess', (e) => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded * 100) / e.total);
                this.setState({ status: UPLOADING, progress });
            }
        }, false);
        xhr.upload.addEventListener('load', (e) => { // eslint-disable-line
            this.setState({ status: COMPLETE, progress: 100 });
        }, false);
        return xhr;
    }

    closeXHRRequest = () => {
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    render() {
        console.log('Rendering FileUploader');

        return (
            <div>
                { this.state.status === NOT_READY &&
                    <p>
                        Please Wait
                    </p>
                }
                {
                    this.state.ready === READY &&
                    <TransparentPrimaryButton
                        onClick={this.onStart}
                    >
                        Start
                    </TransparentPrimaryButton>
                }
                {
                    this.state.ready === FAIL &&
                    <div>
                        <TransparentPrimaryButton
                            onClick={this.onStart}
                        >
                            Retry
                        </TransparentPrimaryButton>
                        <p>
                            Error uploading file
                        </p>
                    </div>
                }
                { this.state.status === UPLOADING &&
                    <div>
                        <TransparentDangerButton
                            onClick={this.onAbort}
                        >
                            Cancel
                        </TransparentDangerButton>
                        <progress
                            value={this.state.progress}
                            max={100}
                        />
                    </div>
                }
                { this.state.status === COMPLETE &&
                    <p>
                        Complete
                    </p>
                }
            </div>
        );
    }
}
