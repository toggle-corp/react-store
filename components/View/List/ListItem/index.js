import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    active: PropTypes.bool,
    children: PropTypes.oneOfType([
        PropTypes.node,
    ]),
    className: PropTypes.string,
    scrollIntoView: PropTypes.bool,
};

const defaultProps = {
    active: false,
    children: '',
    className: '',
    scrollIntoView: false,
};

export default class ListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        const { scrollIntoView } = this.props;
        this.scrollIntoView(scrollIntoView);
    }

    componentDidUpdate() {
        const { scrollIntoView } = this.props;
        this.scrollIntoView(scrollIntoView);
    }

    getClassName = () => {
        const {
            className,
            active,
        } = this.props;

        const classNames = [
            className,
            'list-item',
            styles.listItem,
        ];

        if (active) {
            classNames.push('active');
            classNames.push(styles.active);
        }

        return classNames.join(' ');
    }

    scrollIntoView = (scrollIntoView) => {
        if (!scrollIntoView) {
            return;
        }

        if (!this.container) {
            return;
        }

        if (!this.container.scrollIntoViewIfNeeded) {
            return;
        }

        this.container.scrollIntoViewIfNeeded(false);
    }

    render() {
        const {
            children,
            active, // eslint-disable-line no-unused-vars
            scrollIntoView, // eslint-disable-line no-unused-vars
            className, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        return (
            <button
                ref={(el) => { this.container = el; }}
                className={this.getClassName()}
                {...otherProps}
            >
                { children }
            </button>
        );
    }
}
