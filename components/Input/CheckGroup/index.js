import React from 'react';
import PropTypes from 'prop-types';

import { FaramInputElement } from '../../General/FaramElements';

import ListView from '../../View/List/ListView';
import Checkbox from '../Checkbox';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,
    title: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    keySelector: d => d.key,
    labelSelector: d => d.label,
    title: '',
    disabled: false,
    options: [],
    onChange: () => {},
    value: [],
};

class CheckGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.checkGroup,
            'check-group',
        ];

        return classNames.join(' ');
    }

    handleCheckboxChange = (k, val) => {
        const {
            onChange,
            value,
        } = this.props;
        const newValue = [...value];
        const key = String(k);

        const keyIndex = newValue.findIndex(d => d === key);

        if (keyIndex !== -1 && !val) {
            newValue.splice(keyIndex, 1);
        } else {
            newValue.push(key);
        }

        onChange(newValue);
    }

    renderCheckbox = (k, data) => {
        const {
            keySelector,
            labelSelector,
            value,
            ...otherProps
        } = this.props;

        if (!data) {
            return null;
        }

        const key = String(keySelector(data));
        const valueIndex = value.findIndex(d => d === key);

        const className = `${styles.input} input`;

        return (
            <Checkbox
                className={className}
                onChange={(val) => { this.handleCheckboxChange(key, val); }}
                value={valueIndex !== -1}
                key={key}
                label={labelSelector(data)}
                {...otherProps}
            />
        );
    }

    render() {
        const {
            title,
            options,
            disabled,
        } = this.props;

        const className = this.getClassName();
        const titleClassName = [styles.title, 'title'];

        if (disabled) {
            titleClassName.push(styles.disabled);
        }

        const inputsClassName = `${styles.inputs} inputs`;

        return (
            <div className={className}>
                <div className={titleClassName.join(' ')}>
                    { title }
                </div>
                <ListView
                    className={inputsClassName}
                    data={options}
                    modifier={this.renderCheckbox}
                />
            </div>
        );
    }
}

export default FaramInputElement(CheckGroup);
