import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

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
    ]).isRequired,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class HiddenInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getValue = () => this.props.value;

    render() {
        const {
            className,
            value,
        } = this.props;

        return (
            <input
                styleName="hidden-input"
                className={className}
                value={value}
                readOnly
            />
        );
    }
}
