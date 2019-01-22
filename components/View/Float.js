import FocusTrap from 'react-focus-trap';
import PropTypes from 'prop-types';
import React from 'react';

import Portal from './Portal';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]).isRequired,

    onInvalidate: PropTypes.func,
};

const defaultProps = {
    onInvalidate: () => {}, // no-op
};

export default class Float extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentDidMount() {
        this.invalidate();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    invalidate = () => {
        const { onInvalidate } = this.props;
        onInvalidate();
    }

    handleResize = () => {
        this.invalidate();
    }

    handleScroll = () => {
        this.invalidate();
    }

    render() {
        const { children } = this.props;

        return (
            <Portal>
                <FocusTrap>
                    { children }
                </FocusTrap>
            </Portal>
        );
    }
}
