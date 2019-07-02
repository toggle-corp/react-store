import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.array,
    ]).isRequired,
    initialPage: PropTypes.number,
    onPageChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    initialPage: 0,
    onPageChange: undefined,
};

export default class Wizard extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { initialPage } = this.props;

        this.state = {
            visiblePage: initialPage,
            className: '',
        };
    }

    handleJumpClick = (page) => {
        const { onPageChange } = this.props;
        this.setState({
            visiblePage: page,
            className: styles.next,
        }, () => onPageChange && onPageChange(page));
    }

    handleNextClick = () => {
        const { visiblePage } = this.state;
        const { onPageChange } = this.props;
        this.setState({
            visiblePage: visiblePage + 1,
            className: styles.next,
        }, () => onPageChange && onPageChange(visiblePage + 1));
    }

    handlePrevClick = () => {
        const { visiblePage } = this.state;
        const { onPageChange } = this.props;
        this.setState({
            visiblePage: visiblePage - 1,
            className: styles.prev,
        }, () => onPageChange && onPageChange(visiblePage + 1));
    }

    render() {
        const {
            children,
            className: classNameFromProps,
            ...otherProps
        } = this.props;
        const {
            visiblePage,
            className,
        } = this.state;

        if (!children) {
            return null;
        }

        const childrenCount = React.Children.count(children);
        if (childrenCount <= 1) {
            return children;
        }

        const child = children[visiblePage];
        let props = {
            ...otherProps,
            page: visiblePage + 1,
        };
        if (visiblePage === 0) {
            props = {
                ...props,
                onNext: this.handleNextClick,
                onJump: this.handleJumpClick,
            };
        } else if (visiblePage === childrenCount - 1) {
            props = {
                ...props,
                onPrev: this.handlePrevClick,
                onJump: this.handleJumpClick,
            };
        } else {
            props = {
                ...props,
                onNext: this.handleNextClick,
                onPrev: this.handlePrevClick,
                onJump: this.handleJumpClick,
            };
        }

        return (
            <div
                className={`${className} ${classNameFromProps}`}
                key={visiblePage}
            >
                {React.cloneElement(child, props)}
            </div>
        );
    }
}
