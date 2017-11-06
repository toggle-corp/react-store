import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    /**
     * child elements
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,
};

const defaultProps = {
    className: '',
};


@CSSModules(styles, { allowMultiple: true })
export default class Footer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            children,
            className,
        } = this.props;

        return (
            <footer
                className={`modal-footer ${className}`}
                styleName="footer"
            >
                { children }
            </footer>
        );
    }
}
