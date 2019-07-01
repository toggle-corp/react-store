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
        PropTypes.node,
    ]).isRequired,
};

const defaultProps = {
    className: '',
};


export default class Footer extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            children,
            className,
        } = this.props;

        const classNames = [
            'modal-footer',
            className,
            styles.footer,
        ];
        return (
            <footer className={classNames.join(' ')}>
                { children }
            </footer>
        );
    }
}
