import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '../../../utils/common';
import styles from './styles.scss';

const propTypes = {
    /**
     * Show preview?
     */
    showPreview: PropTypes.bool,

    /**
     * Show file status? (eg: File name, 'No file selected')
     */
    showStatus: PropTypes.bool,

    /**
     * a function that return Promise object
     * which will resolve a preview for give file
     */
    previewExtractor: PropTypes.func,

    className: PropTypes.string,

    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(
            PropTypes.node,
        ),
    ]).isRequired,

    accept: PropTypes.string,

    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    previewExtractor: undefined,
    showPreview: false,
    showStatus: true,
    accept: undefined,
};

export default class FileInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isValidFile = (name, mimeType, acceptString) => {
        // if there is no accept string, anything is valid
        if (!acceptString) {
            return true;
        }
        const extensionMatch = /\.\w+$/.exec(name);
        const mimeMatch = /^.+\//.exec(mimeType);

        const acceptList = acceptString.split(/,\s+/);
        return acceptList.some((accept) => {
            // check mimeType such as image/png or image/*
            if (mimeType === accept || (!!mimeMatch && `${mimeMatch[0]}*` === accept)) {
                return true;
            }
            return !!extensionMatch && extensionMatch[0].toLowerCase() === accept.toLowerCase();
        });
    }

    constructor(props) {
        super(props);

        this.state = {
            files: [],
            preview: undefined,
        };

        this.inputId = randomString();
    }

    handleChange = () => {
        const filesFromInput = Array.from(this.fileInput.files);
        const files = filesFromInput.filter(
            file => FileInput.isValidFile(file.name, file.type, this.props.accept),
        );
        const invalidFiles = filesFromInput.length - files.length;

        if (files.length > 0 && this.props.showPreview) {
            this.props.previewExtractor(files[0])
                .then((preview) => {
                    this.setState({ preview });
                });
        }

        this.setState(
            {
                files,
                preview: undefined,
            },
            () => {
                this.props.onChange(files, { invalidFiles });
            },
        );
    }

    render() {
        const {
            showPreview,
            showStatus,
            className,
            children,

            previewExtractor, // eslint-disable-line
            onChange, // eslint-disable-line

            ...otherProps
        } = this.props;

        const { files, preview } = this.state;

        return (
            <div className={`file-input ${className} ${styles.fileInputWrapper}`} >
                {
                    showPreview && (
                        <div className={`${styles.preview} image-input-preview`}>
                            {
                                preview ? (
                                    <img
                                        alt="No preview available"
                                        className={`img ${styles.img}`}
                                        src={preview}
                                    />
                                ) : (
                                    <p className="no-preview-text">
                                        No preview available
                                    </p>
                                )
                            }
                        </div>
                    )
                }
                <label
                    className={`label ${styles.label}`}
                    htmlFor={this.inputId}
                >
                    { children }
                </label>
                <input
                    className={`input ${styles.input}`}
                    id={this.inputId}
                    onChange={this.handleChange}
                    ref={(el) => { this.fileInput = el; }}
                    type="file"
                    {...otherProps}
                />
                {
                    showStatus && (
                        <p className={styles.status}>
                            { files.length > 0 ? files[0].name : 'No file choosen' }
                        </p>
                    )
                }
            </div>
        );
    }
}
