import PropTypes from 'prop-types';
import React from 'react';
import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import Icon from '../../General/Icon';
import Delay from '../../General/Delay';

import TextInput from '../TextInput';

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

    render() {
        const {
            className: classNameFromProps,
            disabled,
            ...otherProps
        } = this.props;

        const className = _cs(
            classNameFromProps,
            'search-input',
            styles.searchInput,
            disabled && 'disabled',
            disabled && styles.disabled,
        );

        const iconClassName = _cs(
            'icon',
            styles.icon,
        );

        return (
            <div className={className}>
                <Icon
                    className={iconClassName}
                    name="search"
                />
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
