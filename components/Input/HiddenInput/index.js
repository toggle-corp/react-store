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
    ]),
};

const defaultProps = {
    className: '',
    value: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class HiddenInput extends React.PureComponent {
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
                styleName="hidden-input"
                className={className}
                value={value}
                type="hidden"
                readOnly
                onChange={this.onChange}
            />
        );
    }
}
