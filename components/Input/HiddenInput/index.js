import PropTypes from 'prop-types';
import React from 'react';

import FaramElement from '../../Input/Faram/FaramElement';
import styles from './styles.scss';

const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
        PropTypes.object,
        PropTypes.array,
    ]),
};

const defaultProps = {
    className: '',
    value: '',
};

class HiddenInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // NOTE: noop
    onChange = () => {};

    render() {
        const {
            className,
            value,
        } = this.props;

        return (
            <input
                className={`${styles.hiddenInput} ${className}`}
                value={value}
                type="hidden"
                readOnly
                onChange={this.onChange}
            />
        );
    }
}

export default FaramElement('input')(HiddenInput);
