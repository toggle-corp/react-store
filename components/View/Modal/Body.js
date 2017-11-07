import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    /**
     * child elements
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),

    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    children: null,
};


@CSSModules(styles, { allowMultiple: true })
export default class Body extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            children,
            className,
        } = this.props;

        return (
            <div
                styleName="body"
                className={`modal-body ${className}`}
            >
                { children }
            </div>
        );
    }
}
