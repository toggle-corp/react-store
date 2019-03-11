import PropTypes from 'prop-types';
import React from 'react';
import { isTruthy } from '@togglecorp/fujs';

import FormattedDate from './FormattedDate';

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
        PropTypes.instanceOf(Date),
    ]),
};
HackedFormattedDate.defaultProps = {
    value: undefined,
};
HackedFormattedDate.format = FormattedDate.format;

export default HackedFormattedDate;
