import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]).isRequired,
};

const defaultProps = {};

/* Attach React node to body */
export default class Portal extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const { children } = this.props;
        return (
            ReactDOM.createPortal(
                children,
                document.body,
            )
        );
    }
}
