import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
    ]),
    className: PropTypes.string,
};

const defaultProps = {
    children: '',
    className: '',
};

export default class GroupItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const {
            className,
        } = this.props;

        const classNames = [
            className,
            'group-item',
            styles.groupItem,
        ];

        return classNames.join(' ');
    }

    render() {
        const {
            children,
            className, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        return (
            <div
                className={this.getClassName()}
                {...otherProps}
            >
                { children }
            </div>
        );
    }
}
