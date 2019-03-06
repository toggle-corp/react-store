import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '../../../General/Icon';

import styles from './styles.scss';

const Checkbox = ({ active }) => {
    const className = _cs(
        'checkbox',
        styles.checkbox,
    );

    return (
        <Icon
            className={className}
            name={active ? 'checkbox' : 'checkboxOutlineBlank'}
        />
    );
};

Checkbox.propTypes = {
    active: PropTypes.bool.isRequired,
};

export default Checkbox;
