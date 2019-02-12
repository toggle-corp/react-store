import PropTypes from 'prop-types';
import React from 'react';
import { SketchPicker } from 'react-color';

import { randomString } from '@togglecorp/fujs';
import { calcFloatingPositionInMainWindow } from '../../../utils/common';
import { FaramInputElement } from '../../General/FaramElements';

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
    onChange: PropTypes.func.isRequired,

    /**
     * label for the checkbox
     */
    label: PropTypes.node.isRequired,

    showLabel: PropTypes.bool,

    showHintAndError: PropTypes.bool,

    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    showLabel: true,
    value: undefined,
    error: '',
    hint: '',
    showHintAndError: true,
    disabled: false,
    readOnly: false,
};

class ColorInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            showColorPicker: false,
        };

        this.inputId = randomString();
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
        this.props.onChange(value);
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
        } = this.props;

        const { showColorPicker } = this.state;
        const buttonClassNames = [
            styles.colorBox,
            'color-box',
        ];

        const classNames = [
            styles.colorInput,
            className,
        ];

        if (disabled) {
            buttonClassNames.push(styles.disabled);
            classNames.push(styles.disabled);
        }

        return (
            <div
                className={classNames.join(' ')}
                ref={(el) => { this.container = el; }}
            >
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <button
                    type="button"
                    className={buttonClassNames.join(' ')}
                    onClick={this.handleColorBoxClick}
                    disabled={disabled || readOnly}
                >
                    <span
                        className={`${styles.color} color`}
                        style={{ backgroundColor: value }}
                    />
                </button>
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
                {
                    showColorPicker && (
                        <FloatingContainer
                            parent={this.container}
                            onBlur={this.handleColorPickerBlur}
                            onInvalidate={this.handleColorPickerInvalidate}
                            focusTrap
                        >
                            <SketchPicker
                                color={value}
                                onChange={this.handleColorChange}
                            />
                        </FloatingContainer>
                    )
                }
            </div>
        );
    }
}

export default FaramInputElement(ColorInput);
