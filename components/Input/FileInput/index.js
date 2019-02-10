import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '../../../utils/common';
import { FaramInputElement } from '../../General/FaramElements';
import HintAndError from '../HintAndError';
import styles from './styles.scss';

const propTypes = {
    /**
     * Show file status? (eg: File name, 'No file selected')
     */
    showStatus: PropTypes.bool,

    /**
     * String to show in case of error
     */
    error: PropTypes.string,

    value: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.arrayOf(PropTypes.object),
    ]),

    hint: PropTypes.string,
    multiple: PropTypes.bool,

    className: PropTypes.string,

    showHintAndError: PropTypes.bool,

    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(
            PropTypes.node,
        ),
    ]).isRequired,

    accept: PropTypes.string,

    onChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    error: '',
    hint: '',
    onChange: undefined,
    showStatus: true,
    showHintAndError: true,
    accept: undefined,
    multiple: false,
    value: undefined,
};

class FileInput extends React.PureComponent {
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

        this.inputId = randomString();
    }

    handleChange = () => {
        const {
            accept,
            onChange,
            multiple,
        } = this.props;
        const filesFromInput = Array.from(this.fileInput.files);
        const files = filesFromInput.filter(
            file => FileInput.isValidFile(file.name, file.type, accept),
        );
        const invalidFiles = filesFromInput.length - files.length;

        if (onChange) {
            onChange(multiple ? files : files[0], { invalidFiles });
        }
    }

    getFileStatus = (value) => {
        if (Array.isArray(value) && value.length > 0) {
            return `Selected: ${value.map(file => file.name).join(', ')}`;
        }
        if (value) {
            return `Selected: ${value.name}`;
        }
        return 'No file chosen';
    }

    render() {
        const {
            showStatus,
            className,
            children,
            error,
            hint,
            showHintAndError,
            value,
            changeDelay, // eslint-disable-line

            onChange, // eslint-disable-line

            ...otherProps
        } = this.props;

        const fileStatus = this.getFileStatus(value);

        return (
            <div className={`file-input ${className} ${styles.fileInputWrapper}`}>
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
                            {fileStatus}
                        </p>
                    )
                }
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
            </div>
        );
    }
}

export default FaramInputElement(FileInput);
