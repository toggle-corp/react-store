import PropTypes from 'prop-types';
import React from 'react';

import { FaramInputElement } from '../../General/FaramElements';
import Delay from '../../General/Delay';

import TextInput from '../TextInput';
import iconNames from '../../../constants/iconNames.js';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
};

const defaultProps = {
    className: '',
    disabled: false,
};

class SearchInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            'search-input',
            styles.searchInput,
        ];

        return classNames.join(' ');
    }

    render() {
        const {
            className: dummy, // eslint-disable-line no-unused-vars
            disabled,
            ...otherProps
        } = this.props;

        const className = this.getClassName();
        const inputClassName = `text-input ${styles.textInput}`;
        const iconClassName = [
            'icon',
            styles.icon,
            iconNames.search,
        ];
        if (disabled) {
            iconClassName.push(styles.disabled);
        }

        return (
            <div className={className}>
                <span className={iconClassName.join(' ')} />
                <TextInput
                    className={inputClassName}
                    type="search"
                    disabled={disabled}
                    {...otherProps}
                />
            </div>
        );
    }
}

export default FaramInputElement(Delay(SearchInput));
