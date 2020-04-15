import PropTypes from 'prop-types';
import React from 'react';

import { randomString, _cs } from '@togglecorp/fujs';
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
    labelClassName: PropTypes.string,
    statusClassName: PropTypes.string,

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

    persistentHintAndError: PropTypes.bool,
};

const defaultProps = {
    className: undefined,
    labelClassName: undefined,
    statusClassName: undefined,
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
    persistentHintAndError: true,
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

        this.inputId = randomString(16);
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
            labelClassName,
            statusClassName,
            children,
            error,
            hint,
            showHintAndError,
            value,
            changeDelay, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            onChange, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            persistentHintAndError,
            ...otherProps
        } = this.props;

        return (
            <div className={_cs('file-input', styles.fileInputWrapper, className)}>
                <label
                    className={_cs('label', styles.label, labelClassName)}
                    htmlFor={this.inputId}
                >
                    { children }
                </label>
                <input
                    className={_cs('input', styles.input)}
                    id={this.inputId}
                    onChange={this.handleChange}
                    // FIXME: ref may not be needed
                    ref={(el) => { this.fileInput = el; }}
                    type="file"
                    {...otherProps}
                />
                {
                    showStatus && (
                        <p className={_cs(styles.status, statusClassName)}>
                            {this.getFileStatus(value)}
                        </p>
                    )
                }
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                    persistent={persistentHintAndError}
                />
            </div>
        );
    }
}

export default FaramInputElement(RawFileInput);
