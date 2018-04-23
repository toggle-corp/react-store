import PropTypes from 'prop-types';
import React from 'react';
import Button from '../../Action/Button';
import ListView from '../../View/List/ListView';
import iconNames from '../../../constants/iconNames';
import FaramElement from '../../Input/Faram/FaramElement';

import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,

    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.any),
    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,
};

const defaultProps = {
    className: '',

    onChange: undefined,
    value: [],
    keySelector: item => item,
    labelSelector: item => item,
};

class ListInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName() {
        const { className } = this.props;
        const classNames = [
            className,
            'list-input',
            styles.listInput,
        ];

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
        const { labelSelector } = this.props;

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
                    iconName={iconNames.delete}
                    onClick={() => this.deleteItem(key)}
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
                keyExtractor={keySelector}
                modifier={this.renderItem}
            />
        );
    }
}

export default FaramElement('input')(ListInput);
