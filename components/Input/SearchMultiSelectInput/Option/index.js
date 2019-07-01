import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '../Checkbox';
import styles from './styles.scss';

const propTypes = {
    active: PropTypes.bool.isRequired,
    focused: PropTypes.bool.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    optionKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    onFocus: PropTypes.func.isRequired,
    optionLabel: PropTypes.string,
};

const defaultProps = {
    className: '',
    optionLabel: '',
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
        if (this.props.focused) {
            this.scrollToFocus();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.focused && nextProps.focused) {
            this.scrollToFocus();
        } else {
            this.focusedByMouse = false;
        }
    }

    getClassName = () => {
        const {
            active,
            focused,
            className,
        } = this.props;

        const classNames = [
            className,
            'option',
            styles.option,
        ];

        if (active) {
            classNames.push('active');
        }

        if (focused) {
            classNames.push(styles.focused);
            classNames.push('focused');
        }

        return classNames.join(' ');
    }

    handleClick = () => {
        const {
            onClick,
            optionKey,
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
        const {
            optionLabel,
            active,
        } = this.props;

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
                <Checkbox active={active} />
                { optionLabel }
            </button>
        );
    }
}
