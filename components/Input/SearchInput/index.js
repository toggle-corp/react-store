import PropTypes from 'prop-types';
import React from 'react';

import TextInput from '../TextInput';
import iconNames from '../../../constants/iconNames.js';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class SearchInput extends React.PureComponent {
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
            ...otherProps
        } = this.props;

        const className = this.getClassName();
        const inputClassName = `text-input ${styles.textInput}`;
        const iconClassName = [
            'icon',
            styles.icon,
            iconNames.search,
        ].join(' ');

        return (
            <div className={className}>
                <span className={iconClassName} />
                <TextInput
                    className={inputClassName}
                    type="search"
                    {...otherProps}
                />
            </div>
        );
    }
}

