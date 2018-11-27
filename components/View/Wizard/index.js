import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.array,
    ]).isRequired,
};

const defaultProps = {
};

export default class Wizard extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            visiblePage: 0,
            className: '',
        };
    }

    handleNextClick = () => {
        const { visiblePage } = this.state;
        this.setState({
            visiblePage: visiblePage + 1,
            className: styles.next,
        });
    }

    handlePrevClick = () => {
        const { visiblePage } = this.state;
        this.setState({
            visiblePage: visiblePage - 1,
            className: styles.prev,
        });
    }

    render() {
        const {
            children,
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
            };
        } else if (visiblePage === childrenCount - 1) {
            props = {
                ...props,
                onPrev: this.handlePrevClick,
            };
        } else {
            props = {
                ...props,
                onNext: this.handleNextClick,
                onPrev: this.handlePrevClick,
            };
        }

        return (
            <div
                className={className}
                key={visiblePage}
            >
                {React.cloneElement(child, props)}
            </div>
        );
    }
}
