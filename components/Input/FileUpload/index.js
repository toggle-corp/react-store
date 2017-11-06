import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import {
    TransparentPrimaryButton,
    TransparentDangerButton,
} from '../Button';

const propTypes = {
    autoStart: PropTypes.bool,
    file: PropTypes.object.isRequired, // eslint-disable-line
    /*
    onAbort: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    */
    uploadUrl: PropTypes.string,
};

const defaultProps = {
    autoStart: false,
    uploadUrl: '/v1/upload/url/',
};

// Upload States
const NOT_READY = -1; // initial state
const READY = 0; // file loader has loaded file
const UPLOADING = 1; // upload has started
const COMPLETE = 2; // upload has completed
const FAIL = 3; // upload failed

// TODO: get response from server
// TODO: multiple file uploads at once in FileInput

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
            progress: 0,
            status: NOT_READY,
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
                    fileToSend: evt.target.result,
                    status: READY,
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

        this.setState({ status: UPLOADING, progress: 0 });
    }

    onAbort = () => {
        this.closeXHRRequest();
    }

    createXHRRequest = () => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
            console.log('Upload Progress');
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded * 100) / e.total);
                this.setState({ status: UPLOADING, progress });
            }
        };

        xhr.onabort = () => {
            console.log('Abort');
            this.setState({ status: READY, progress: 0 });
        };

        xhr.onerror = () => {
            console.log('Error');
            this.setState({ status: FAIL, progress: 0 });
        };

        xhr.onload = () => {
            console.log('Load');
            if (Math.floor(xhr.status / 100) === 2) {
                this.setState({ status: COMPLETE, progress: 100 });
            } else {
                this.setState({ status: FAIL, progress: 0 });
            }
        };

        return xhr;
    }

    closeXHRRequest = () => {
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    render() {
        console.log('Rendering FileUploader');
        const { status } = this.state;
        return (
            <div>
                { status === NOT_READY &&
                    <p>
                        Please Wait
                    </p>
                }
                {
                    status === READY &&
                    <div>
                        <TransparentPrimaryButton
                            onClick={this.onStart}
                        >
                            Start
                        </TransparentPrimaryButton>
                        <p>
                            { this.props.file.name }
                        </p>
                    </div>
                }
                {
                    status === FAIL &&
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
                { status === UPLOADING &&
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
                { status === COMPLETE &&
                    <p>
                        { this.props.file.name }
                    </p>
                }
            </div>
        );
    }
}
