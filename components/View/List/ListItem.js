import CSSModules from 'react-css-modules';
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

@CSSModules(styles, { allowMultiple: true })
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

    componentWillReceiveProps(nextProps) {
        const { className, active } = nextProps;
        this.setState({
            className: this.getClassName({ className, active }),
        });
    }

    componentDidUpdate() {
        const {
            scrollIntoView,
        } = this.props;

        if (this.container && scrollIntoView) {
            this.container.scrollIntoView({
                behavior: 'instant',
                block: 'nearest',
                inline: 'nearest',
            });
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
        const {
            children,
        } = this.props;

        const {
            className,
        } = this.state;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={`list-item ${className}`}
                styleName="list-item"
            >
                { children }
            </div>
        );
    }
}
