import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    tooltip: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node,
    ]),
    className: PropTypes.string,
};

const defaultProps = {
    tooltip: undefined,
    className: '',
};


/**
 * Component showing tooltip
 */
@CSSModules(styles, { allowMultiple: true })
export default class Tooltip extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    render() {
        const { tooltip, className } = this.props;

        if (!tooltip) {
            return <div />;
        }

        return (
            <div
                className={className}
                styleName="tooltip"
            >
                {tooltip}
            </div>
        );
    }
}
