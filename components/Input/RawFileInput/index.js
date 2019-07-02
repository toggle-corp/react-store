import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';
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

    changeDelay: PropTypes.number,

    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
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
    disabled: false,
    readOnly: false,
    changeDelay: undefined,
};

class RawFileInput extends React.PureComponent {
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

    getFileStatus = (value) => {
        if (Array.isArray(value) && value.length > 0) {
            return `Selected: ${value.map(file => file.name).join(', ')}`;
        }
        if (value) {
            return `Selected: ${value.name}`;
        }
        return 'No file chosen';
    }

    handleChange = () => {
        const {
            accept,
            onChange,
            multiple,
        } = this.props;
        const filesFromInput = Array.from(this.fileInput.files);
        const files = filesFromInput.filter(
            file => RawFileInput.isValidFile(file.name, file.type, accept),
        );
        const invalidFiles = filesFromInput.length - files.length;

        if (onChange) {
            onChange(multiple ? files : files[0], { invalidFiles });
        }
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
            changeDelay, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            onChange, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            ...otherProps
        } = this.props;

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
                    // FIXME: ref may not be needed
                    ref={(el) => { this.fileInput = el; }}
                    type="file"
                    {...otherProps}
                />
                {
                    showStatus && (
                        <p className={styles.status}>
                            {this.getFileStatus(value)}
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

export default FaramInputElement(RawFileInput);
