import FocusTrap from 'react-focus-trap';
import React from 'react';

import Portal from './Portal';

interface Props {
    children: React.ReactNode;
    focusTrap: boolean;
    onInvalidate: () => void;
}

/* Portal with invalidation and focus trap */
export default class Float extends React.PureComponent<Props> {
    public static defaultProps = {
        focusTrap: false,
        onInvalidate: () => {}, // no-op
    };

    public componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll, true);

        const { onInvalidate } = this.props;
        onInvalidate();
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    private handleResize = () => {
        const { onInvalidate } = this.props;
        onInvalidate();
    }

    private handleScroll = () => {
        const { onInvalidate } = this.props;
        onInvalidate();
    }

    public render() {
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
