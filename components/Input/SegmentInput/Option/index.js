import React from 'react';
import PropTypes from 'prop-types';
import {
    _cs,
    randomString,
    isFalsy,
} from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    error: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    renderer: PropTypes.func,
    rendererClassName: PropTypes.string,
    rendererParams: PropTypes.func,
    index: PropTypes.number.isRequired,
    datum: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    error: '',
    disabled: false,
    readOnly: false,
    renderer: undefined,
    rendererClassName: '',
    rendererParams: undefined,
    datum: {},
};

export default class SegmentOption extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.inputId = randomString();
    }

    render() {
        const {
            checked,
            data,
            datum,
            disabled,
            error,
            id,
            index,
            label,
            name,
            onChange,
            readOnly,
            renderer: Renderer,
            rendererClassName,
            rendererParams,
            activeClassName,
            className,
        } = this.props;

        const extraProps = rendererParams ? rendererParams(id, datum, index, data) : undefined;
        const {
            containerClassName,
            ...otherProps
        } = extraProps;

        const classNames = _cs(
            className,
            containerClassName,
            'segment-option',
            styles.segmentOption,
            checked && 'checked',
            checked && styles.checked,
            checked && activeClassName,
            readOnly && 'read-only',
            readOnly && styles.readOnly,
            disabled && 'disabled',
            disabled && styles.disabled,
            !isFalsy(error, ['']) && 'error',
            !isFalsy(error, ['']) && styles.error,
        );

        return (
            <label
                htmlFor={this.inputId}
                className={classNames}
            >
                <input
                    className={_cs(styles.segmentButtonInput, 'segment-option-input')}
                    type="radio"
                    onChange={onChange}
                    checked={checked}
                    id={this.inputId}
                    value={id}
                    name={name}
                />
                { Renderer ? (
                    <Renderer
                        className={rendererClassName}
                        {...otherProps}
                    />
                ) : (
                    label
                )}
            </label>
        );
    }
}
