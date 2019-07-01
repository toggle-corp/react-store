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


export default class Body extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            children,
            className,
        } = this.props;

        const classNames = [
            'modal-body',
            styles.body,
            className,
        ];
        return (
            <div className={classNames.join(' ')}>
                { children }
            </div>
        );
    }
}
