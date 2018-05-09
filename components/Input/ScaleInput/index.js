import React from 'react';
import PropTypes from 'prop-types';

import FaramElement from '../Faram/FaramElement';
import List from '../../View/List';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    options: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
};
const defaultProps = {
    className: '',
    options: {},
    value: undefined,
    onChange: () => {},
    disabled: false,
    readOnly: false,
};

@FaramElement('input')
export default class ScaleInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.checkAndSetDefaultValue(props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.options !== this.props.options) {
            this.checkAndSetDefaultValue(nextProps);
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

    checkAndSetDefaultValue = ({ options, value, onChange }) => {
        const defaultValue = Object.entries(options).find(o => o[1].default);
        if (!value && defaultValue) {
            onChange(defaultValue[0]);
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

    renderOption = (k, valueKey) => {
        const {
            options,
            disabled,
            readOnly,
        } = this.props;
        const data = options[valueKey];

        const style = {
            backgroundColor: data.color,
        };

        const className = this.getOptionClassName(valueKey);

        return (
            <button
                onClick={() => { this.handleOptionClick(valueKey); }}
                type="button"
                key={valueKey}
                className={className}
                title={data.title}
                disabled={disabled || readOnly}
                style={style}
            />
        );
    }

    render() {
        const { options } = this.props;
        const className = this.getClassName();
        const optionKeys = Object.keys(options);

        return (
            <div className={className}>
                <List
                    data={optionKeys}
                    modifier={this.renderOption}
                />
            </div>
        );
    }
}
