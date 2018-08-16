import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    className: '',
    children: undefined,
};

export default class Cell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            children,
        } = this.props;

        return (
            <div className={className}>
                { children }
            </div>
        );
    }
}
