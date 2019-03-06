import PropTypes from 'prop-types';
import React from 'react';
import { FaramInputElement } from '@togglecorp/faram';

import Button from '../../Action/Button';
import ListView from '../../View/List/ListView';

import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,

    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.any),
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,
};

const defaultProps = {
    className: '',

    onChange: undefined,
    value: [],
    disabled: false,
    readOnly: false,
    keySelector: item => item,
    labelSelector: item => item,
};

class ListInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName() {
        const {
            className,
            disabled,
            readOnly,
        } = this.props;

        const classNames = [
            className,
            'list-input',
            styles.listInput,
        ];

        if (disabled) {
            classNames.push(styles.disabled);
        }

        if (readOnly) {
            classNames.push(styles.readOnly);
        }

        return classNames.join(' ');
    }

    deleteItem = (key) => {
        const { value, onChange, keySelector } = this.props;
        const newValue = [...value];
        const index = newValue.findIndex(item => keySelector(item) === key);

        if (index >= 0) {
            newValue.splice(index, 1);

            if (onChange) {
                onChange(newValue);
            }
        }
    }

    renderItem = (key, data) => {
        const {
            labelSelector,
            disabled,
            readOnly,
        } = this.props;

        return (
            <div
                key={key}
                className={styles.item}
            >
                <div className={styles.label}>
                    { labelSelector(data) }
                </div>
                <Button
                    className={styles.action}
                    iconName="delete"
                    onClick={() => this.deleteItem(key)}
                    disabled={disabled || readOnly}
                    transparent
                />
            </div>
        );
    }

    render() {
        const { value, keySelector } = this.props;
        const className = this.getClassName();

        return (
            <ListView
                className={className}
                data={value}
                keySelector={keySelector}
                modifier={this.renderItem}
            />
        );
    }
}

export default FaramInputElement(ListInput);
