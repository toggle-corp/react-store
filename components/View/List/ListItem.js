import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    /* indicate if it is the active element */
    active: PropTypes.bool,

    /* children inside of ListView */
    children: PropTypes.oneOfType([
        PropTypes.node,
    ]),

    /* class name for overriding style */
    className: PropTypes.string,

    /* if set to true, list is scrolled to the ListItem */
    scrollIntoView: PropTypes.bool,
};

const defaultProps = {
    active: false,
    children: '',
    className: '',
    scrollIntoView: false,
};

export default class List extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { className, active } = this.props;
        this.state = {
            className: this.getClassName({ className, active }),
        };
    }

    componentDidMount() {
        const { scrollIntoView } = this.props;

        if (this.container && this.container.scrollIntoViewIfNeeded && scrollIntoView) {
            this.container.scrollIntoViewIfNeeded(false);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { className, active } = nextProps;
        this.setState({
            className: this.getClassName({ className, active }),
        });
    }

    componentDidUpdate() {
        const { scrollIntoView } = this.props;

        if (this.container && this.container.scrollIntoViewIfNeeded && scrollIntoView) {
            this.container.scrollIntoViewIfNeeded(false);
        }
    }

    getClassName = ({ className, active }) => {
        const classNames = [];

        classNames.push('list-item');

        if (className) {
            classNames.push(className);
        }

        if (active) {
            classNames.push('active');
        }

        return classNames.join(' ');
    }

    render() {
        const { children } = this.props;
        const { className } = this.state;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={`list-item ${className} ${styles['list-item']}`}
            >
                { children }
            </div>
        );
    }
}
