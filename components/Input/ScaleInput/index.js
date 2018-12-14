import React from 'react';
import PropTypes from 'prop-types';

import { FaramInputElement } from '../../General/FaramElements';
import List from '../../View/List';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    options: PropTypes.array,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,
    colorSelector: PropTypes.func,
    isDefaultSelector: PropTypes.func,
};
const defaultProps = {
    className: '',
    options: [],
    value: undefined,
    onChange: () => {},
    disabled: false,
    readOnly: false,

    keySelector: option => option.key,
    labelSelector: option => option.label,
    colorSelector: option => option.color,
    isDefaultSelector: option => !!option.default,
};

class ScaleInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        // FIXME: this kind of actions should be moved to Faram:computeSchema
        this.checkAndSetDefaultValue(props.options, props.value);
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.options !== this.props.options ||
            (!nextProps.disabled && nextProps.disabled !== this.props.disabled)
        ) {
            this.checkAndSetDefaultValue(nextProps.options, nextProps.value);
        }
    }

    getClassName = () => {
        const {
            className,
            disabled,
            readOnly,
        } = this.props;

        const classNames = [
            className,
            'scale-input',
            styles.scaleInput,
        ];

        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }

        if (readOnly) {
            classNames.push('read-only');
            classNames.push(styles.readOnly);
        }

        return classNames.join(' ');
    }

    getOptionClassName = (key) => {
        const { value } = this.props;

        const classNames = [
            styles.value,
        ];

        const isActive = key === value;

        if (isActive) {
            classNames.push(styles.active);
        }

        return classNames.join(' ');
    }

    checkAndSetDefaultValue = (options, value) => {
        const {
            onChange,
            isDefaultSelector,
            keySelector,
            disabled,
        } = this.props;
        if (disabled) {
            return;
        }
        const defaultOption = options.find(option => isDefaultSelector(option));
        if (!value && defaultOption) {
            onChange(keySelector(defaultOption));
        }
    }

    handleOptionClick = (key) => {
        const {
            value,
            onChange,
        } = this.props;

        if (value !== key) {
            onChange(key);
        }
    }

    renderOption = (k, option) => {
        const {
            disabled,
            readOnly,
            colorSelector,
            keySelector,
            labelSelector,
        } = this.props;

        const key = keySelector(option);
        const color = colorSelector(option);
        const label = labelSelector(option);

        const style = {
            backgroundColor: color,
        };

        const className = this.getOptionClassName(key);

        return (
            <button
                onClick={() => { this.handleOptionClick(key); }}
                type="button"
                key={key}
                className={className}
                title={label}
                disabled={disabled || readOnly}
                style={style}
            />
        );
    }

    render() {
        const { options } = this.props;
        const className = this.getClassName();

        return (
            <div className={className}>
                <List
                    data={options}
                    modifier={this.renderOption}
                />
            </div>
        );
    }
}

export default FaramInputElement(ScaleInput);
