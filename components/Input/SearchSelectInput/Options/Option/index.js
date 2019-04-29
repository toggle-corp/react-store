import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    optionKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    onClick: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    children: PropTypes.node,
    isActive: PropTypes.bool,
    isFocused: PropTypes.bool,
};

const defaultProps = {
    isActive: false,
    isFocused: false,
    className: '',
    children: undefined,
};

export default class Option extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.focusedByMouse = undefined;
    }

    componentDidMount() {
        if (this.props.isFocused) {
            this.scrollToFocus();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isFocused && nextProps.isFocused) {
            this.scrollToFocus();
        } else {
            this.focusedByMouse = false;
        }
    }

    getClassName = () => {
        const {
            className,
            isActive,
            isFocused,
        } = this.props;

        const classNames = [
            className,
            styles.option,
            'option',
        ];

        if (isActive) {
            classNames.push(styles.active);
            classNames.push('active');
        }

        if (isFocused) {
            classNames.push(styles.focused);
            classNames.push('focused');
        }

        return classNames.join(' ');
    }

    handleClick = () => {
        const {
            optionKey,
            onClick,
        } = this.props;

        onClick(optionKey);
    }

    handleMouseMove = () => {
        const {
            optionKey,
            onFocus,
        } = this.props;

        this.focusedByMouse = true;
        onFocus(optionKey);
    }

    handleMouseLeave = () => {
        this.focusedByMouse = false;
    }

    scrollToFocus = () => {
        if (!this.focusedByMouse) {
            this.ref.current.scrollIntoView({
                block: 'nearest',
            });
        }
    }

    render() {
        const { children } = this.props;
        const className = this.getClassName();

        return (
            <button
                ref={this.ref}
                className={className}
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                onMouseLeave={this.handleMouseLeave}
                type="button"
            >
                { children }
            </button>
        );
    }
}
