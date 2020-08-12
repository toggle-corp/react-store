import React, { useState, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import colorBrewer from 'colorbrewer';
import {
    SketchPicker,
    TwitterPicker,
    GithubPicker,
    SwatchesPicker,
} from 'react-color';

import { FaramInputElement } from '@togglecorp/faram';

import { calcFloatingPositionInMainWindow } from '../../../utils/common';

import FloatingContainer from '../../View/FloatingContainer';
import Message from '../../View/Message';
import SegmentInput from '../../Input/SegmentInput';
import HintAndError from '../HintAndError';
import Label from '../Label';

import styles from './styles.scss';

const schemeOptions = [
    { key: 'singlehue', label: 'Single hue' },
    { key: 'sequential', label: 'Multi hue' },
    { key: 'qualitative', label: 'Qualitative' },
    { key: 'diverging', label: 'Diverging' },
];

const optionKeySelector = d => d.key;
const optionLabelSelector = d => d.label;

const numberOfColors = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const numberKeySelector = d => d;

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
    showSwatches: PropTypes.bool,

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
    showSwatches: false,
    persistentHintAndError: true,
    onChange: undefined,
    // options: twitterPicker, githubPicker, normal
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
        '#ccdb39',
        '#009587',
        '#3e50b4',
        '#9b27af',
    ],
};

function ColorInput(props) {
    const {
        onChange,
        showHintAndError,
        label,
        className,
        value,
        showLabel,
        error,
        hint,
        disabled,
        readOnly,
        persistentHintAndError,
        type,
        colors,
        showSwatches,
    } = props;

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [boundingClientRect, setBoundingClientRect] = useState({});
    const containerRef = useRef(undefined);
    const [selectedScheme, setSelectedScheme] = useState('sequential');
    // NOTE: In color brewer each scheme group has at least one color swatch with 8 items
    const [selectedNumberOfColors, setSelectedNumberOfColors] = useState(8);

    const handleColorPickerInvalidate = useCallback((colorPickerContainer) => {
        const containerRect = colorPickerContainer.getBoundingClientRect();
        let parentRect = boundingClientRect;
        if (containerRef) {
            const { current: container } = containerRef;
            parentRect = container.getBoundingClientRect();
        }

        const offset = {
            top: 2,
            right: 0,
            bottom: 0,
            left: 0,
        };
        if (showHintAndError) {
            offset.top = 12;
        }

        const optionsContainerPosition = (
            calcFloatingPositionInMainWindow(parentRect, containerRect, offset)
        );
        return {
            ...optionsContainerPosition,
            width: 'auto',
        };
    }, [containerRef, boundingClientRect, showHintAndError]);

    const handleColorBoxClick = useCallback(() => {
        const { current: container } = containerRef;
        setBoundingClientRect(container.getBoundingClientRect());
        setShowColorPicker(true);
    }, [setBoundingClientRect, setShowColorPicker]);

    const handleColorChange = useCallback((newColor) => {
        if (onChange) {
            onChange(newColor.hex);
        }
    }, [onChange]);

    const handleColorPickerBlur = useCallback(() => {
        setShowColorPicker(false);
    }, [setShowColorPicker]);

    const Picker = useMemo(() => {
        if (type === 'twitterPicker') {
            return TwitterPicker;
        }
        if (type === 'githubPicker') {
            return GithubPicker;
        }
        return SketchPicker;
    }, [type]);

    const swatchesColors = useMemo(() => {
        const schemes = colorBrewer.schemeGroups[selectedScheme];
        return schemes.map(scheme => colorBrewer[scheme][selectedNumberOfColors])
            .filter(isDefined);
    }, [selectedScheme, selectedNumberOfColors]);

    return (
        <div
            className={_cs(
                styles.colorInput,
                className,
                disabled && styles.disabled,
            )}
            ref={containerRef}
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
                onClick={handleColorBoxClick}
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
                        parent={containerRef && containerRef.current}
                        onBlur={handleColorPickerBlur}
                        onInvalidate={handleColorPickerInvalidate}
                        className={styles.colorFloatingContainer}
                        focusTrap
                        showHaze
                    >
                        <Picker
                            color={value}
                            onChange={handleColorChange}
                            colors={colors}
                            triangle="hide"
                        />
                        {showSwatches && (
                            <div className={styles.swatchesContainer}>
                                <div className={styles.headerContainer}>
                                    <SegmentInput
                                        label="Color Scheme"
                                        value={selectedScheme}
                                        options={schemeOptions}
                                        onChange={setSelectedScheme}
                                        keySelector={optionKeySelector}
                                        labelSelector={optionLabelSelector}
                                    />
                                    <SegmentInput
                                        className={styles.numberSelectInput}
                                        label="Number of Colors"
                                        value={selectedNumberOfColors}
                                        options={numberOfColors}
                                        onChange={setSelectedNumberOfColors}
                                        keySelector={numberKeySelector}
                                        labelSelector={numberKeySelector}
                                    />
                                </div>
                                {swatchesColors.length > 0 ? (
                                    <SwatchesPicker
                                        className={styles.swatches}
                                        color={value}
                                        colors={swatchesColors}
                                        onChange={handleColorChange}
                                        triangle="hide"
                                    />
                                ) : (
                                    <div className={styles.swatches}>
                                        <Message>
                                            There are no colors for selected options.
                                        </Message>
                                    </div>
                                )}
                            </div>
                        )}
                    </FloatingContainer>
                )
            }
        </div>
    );
}
ColorInput.propTypes = propTypes;
ColorInput.defaultProps = defaultProps;

export default FaramInputElement(ColorInput);
