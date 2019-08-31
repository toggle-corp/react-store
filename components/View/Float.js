import FocusTrap from 'react-focus-trap';
import PropTypes from 'prop-types';
import React from 'react';

import Portal from './Portal';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]).isRequired,

    focusTrap: PropTypes.bool,

    onInvalidate: PropTypes.func,
};

const defaultProps = {
    focusTrap: false,
    onInvalidate: () => {}, // no-op
};

/* Portal with invalidation and focus trap */
export default class Float extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll, true);

        const { onInvalidate } = this.props;
        onInvalidate();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    handleResize = () => {
        const { onInvalidate } = this.props;
        onInvalidate();
    }

    handleScroll = () => {
        const { onInvalidate } = this.props;
        onInvalidate();
    }

    render() {
        const {
            children,
            focusTrap,
        } = this.props;

        if (focusTrap) {
            return (
                <Portal>
                    <FocusTrap>
                        { children }
                    </FocusTrap>
                </Portal>
            );
        }

        return (
            <Portal>
                { children }
            </Portal>
        );
    }
}
