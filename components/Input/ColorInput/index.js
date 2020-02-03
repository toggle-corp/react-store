import PropTypes from 'prop-types';
import React from 'react';
import {
    SketchPicker,
    TwitterPicker,
} from 'react-color';

import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import { calcFloatingPositionInMainWindow } from '../../../utils/common';

import FloatingContainer from '../../View/FloatingContainer';
import HintAndError from '../HintAndError';
import Label from '../Label';

import styles from './styles.scss';

const propTypes = {
    /**
     * for styling by className
     */
    className: PropTypes.string,

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

    /**
     * String to show in case of error
     */
    error: PropTypes.string,

    /**
     * Hint text
     */
    hint: PropTypes.string,

    /**
     * A callback for when the input changes its content
     */
    onChange: PropTypes.func,

    /**
     * label for the checkbox
     */
    label: PropTypes.node,

    showLabel: PropTypes.bool,

    showHintAndError: PropTypes.bool,

    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    persistentHintAndError: PropTypes.bool,
    type: PropTypes.string,
    colors: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    showLabel: true,
    value: undefined,
    label: undefined,
    error: '',
    hint: '',
    showHintAndError: true,
    disabled: false,
    readOnly: false,
    persistentHintAndError: true,
    onChange: undefined,
    // normal | palette
    type: 'normal',
    colors: [
        '#ff6900',
        '#fcb900',
        '#7bdcb5',
        '#00d084',
        '#8ed1fc',
        '#0693e3',
        '#795548',
        '#eb144c',
        '#f78da7',
        '#9900ef',
    ],
};

class ColorInput extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            showColorPicker: false,
        };

        this.inputId = randomString(16);
        this.boundingClientRect = {};
    }

    handleColorPickerInvalidate = (colorPickerContainer) => {
        const containerRect = colorPickerContainer.getBoundingClientRect();
        let parentRect = this.boundingClientRect;
        if (this.container) {
            parentRect = this.container.getBoundingClientRect();
        }

        const offset = {
            top: 2,
            right: 0,
            bottom: 0,
            left: 0,
        };
        if (this.props.showHintAndError) {
            offset.top = 12;
        }

        const optionsContainerPosition = (
            calcFloatingPositionInMainWindow(parentRect, containerRect, offset)
        );
        return optionsContainerPosition;
    }

    handleInputChange = (e) => {
        const value = e.target.checked;
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        }
    }

    handleColorBoxClick = () => {
        this.boundingClientRect = this.container.getBoundingClientRect();
        this.setState({ showColorPicker: true });
    }

    handleCloseColorPickerClick = () => {
        this.setState({ showColorPicker: false });
    }

    handleColorChange = (newColor) => {
        if (this.props.onChange) {
            this.props.onChange(newColor.hex);
        }
    }

    handleColorPickerBlur = () => {
        this.setState({ showColorPicker: false });
    }

    render() {
        const {
            label,
            className,
            value,
            showLabel,
            showHintAndError,
            error,
            hint,
            disabled,
            readOnly,
            persistentHintAndError,
            type,
            colors,
        } = this.props;

        const { showColorPicker } = this.state;

        let Picker = SketchPicker;
        if (type === 'palette') {
            Picker = TwitterPicker;
        }

        return (
            <div
                className={_cs(
                    styles.colorInput,
                    className,
                    disabled && styles.disabled,
                )}
                ref={(el) => { this.container = el; }}
            >
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <button
                    type="button"
                    className={_cs(
                        styles.colorBox,
                        'color-box',
                        disabled && styles.disabled,
                        readOnly && styles.readOnly,
                    )}
                    onClick={this.handleColorBoxClick}
                    disabled={disabled || readOnly}
                >
                    <span
                        className={_cs(styles.color, 'color')}
                        style={{ backgroundColor: value }}
                    />
                </button>
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                    persistent={persistentHintAndError}
                />
                {
                    showColorPicker && (
                        <FloatingContainer
                            parent={this.container}
                            onBlur={this.handleColorPickerBlur}
                            onInvalidate={this.handleColorPickerInvalidate}
                            focusTrap
                            showHaze
                        >
                            <Picker
                                color={value}
                                onChange={this.handleColorChange}
                                colors={colors}
                            />
                        </FloatingContainer>
                    )
                }
            </div>
        );
    }
}

export default FaramInputElement(ColorInput);
