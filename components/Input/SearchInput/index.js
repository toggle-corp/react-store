import PropTypes from 'prop-types';
import React from 'react';
import { FaramInputElement } from '@togglecorp/faram';

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
        const {
            className,
            disabled,
        } = this.props;

        const classNames = [
            className,
            'search-input',
            styles.searchInput,
        ];

        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }

        return classNames.join(' ');
    }

    render() {
        const {
            className: dummy, // eslint-disable-line no-unused-vars
            disabled,
            ...otherProps
        } = this.props;

        const className = this.getClassName();
        const iconClassName = `
            icon
            ${styles.icon}
            ${iconNames.search}
        `;

        return (
            <div className={className}>
                <span className={iconClassName} />
                <TextInput
                    className={styles.textInput}
                    type="search"
                    disabled={disabled}
                    {...otherProps}
                />
            </div>
        );
    }
}

export default FaramInputElement(Delay(SearchInput));
