import PropTypes from 'prop-types';
import React from 'react';

import FormattedDate from './FormattedDate';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const FormattedTime = ({ value, ...otherProps }) => {
    const newValue = value ? `1994-12-25 ${value}` : value;
    return (
        <FormattedDate
            mode="hh:mm"
            {...otherProps}
            value={newValue}
        />
    );
};

FormattedTime.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
};
FormattedTime.defaultProps = {
    value: undefined,
};

export default FormattedTime;
