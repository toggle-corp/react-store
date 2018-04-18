import PropTypes from 'prop-types';
import React from 'react';

import Input from '../../../utils/input';


const propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    error: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    inputModifier: PropTypes.node.isRequired,
    keySelector: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    onChange: undefined,
    value: [],
    error: [],
    disabled: false,
};


@Input
export default class InputList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'input-list',
        ];

        return classNames.join(' ');
    }

    setValue = (index, itemValue) => {
        const { onChange, value } = this.props;
        if (onChange) {
            const newValue = [...value];
            newValue[index] = itemValue;
            onChange(newValue);
        }
    }

    getInputProps = (index) => {
        const { value, error, disabled } = this.props;
        return {
            value: value[index],
            error: error[index],
            onChange: v => this.setValue(index, v),
            disabled,
        };
    }

    render() {
        const {
            value,
            inputModifier,
            keySelector,
        } = this.props;

        const InputItem = inputModifier;
        return value.map((v, index) => (
            <InputItem
                key={keySelector(v, index)}
                {...this.getInputProps(index)}
            />
        ));
    }
}
