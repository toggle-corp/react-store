import PropTypes from 'prop-types';
import React from 'react';

import FormattedDate from './FormattedDate';
import { isTruthy } from '../../../utils/common';

const HackedFormattedDate = ({ value, ...otherProps }) => {
    if (isTruthy(value)) {
        return (
            <FormattedDate
                {...otherProps}
                date={value}
            />
        );
    }
    return (
        <FormattedDate
            {...otherProps}
        />
    );
};

HackedFormattedDate.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
};
HackedFormattedDate.defaultProps = {
    value: undefined,
};
HackedFormattedDate.format = FormattedDate.format;

export default HackedFormattedDate;
