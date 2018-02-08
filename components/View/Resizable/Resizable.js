import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    firstChild: PropTypes.node.isRequired,
    firstContainerClassName: PropTypes.string,

    secondChild: PropTypes.node.isRequired,
    secondContainerClassName: PropTypes.string,

    separatorClassName: PropTypes.string,

    resizableClassName: PropTypes.string.isRequired,
    getInitialSize: PropTypes.func.isRequired,
    calculateDifference: PropTypes.func.isRequired,
    resizeContainers: PropTypes.func.isRequired,

    onResize: PropTypes.func,
};

const defaultProps = {
    className: '',
    separatorClassName: '',
    firstContainerClassName: '',
    secondContainerClassName: '',
    onResize: undefined,
};

export default class Resizable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getMousePosition = e => ({
        x: e.clientX,
        y: e.clientY,
    })

    static isContainerClicked = (e, container) => {
        if (!container) {
            return false;
        }
        const rc = container.getBoundingClientRect();
        const { x, y } = Resizable.getMousePosition(e);

        return (
            x >= rc.left && x <= rc.right &&
            y >= rc.top && y <= rc.bottom
        );
    }

    static syncResizeClassName = (container, resizing) => {
        if (!container) {
            return;
        }

        const resizeClassName = styles.resizing;
        const classNames = container.className.split(' ');
        const classNameIndex = classNames.findIndex(d => d === resizeClassName);

        if (resizing) {
            if (classNameIndex === -1) {
                classNames.push(resizeClassName);
            }
        } else if (classNameIndex !== -1) {
            classNames.splice(classNameIndex, 1);
        }

        // eslint-disable-next-line no-param-reassign
        container.className = classNames.join(' ');
    }

    constructor(props) {
        super(props);

        this.resizing = false;
        this.lastMousePosition = {};
    }

    componentWillMount() {
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('mousemove', this.handleMouseMove);
    }

    componentWillUnmount() {
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
    }

    getSeparatorClassName = () => {
        const { separatorClassName } = this.props;
        const classNames = [
            separatorClassName,
            'separator',
            styles.separator,
        ];

        return classNames.join(' ');
    }

    getClassName = () => {
        const { className, resizableClassName } = this.props;
        const classNames = [
            className,
            resizableClassName,
            styles[resizableClassName],
        ];

        return classNames.join(' ');
    }

    getFirstContainerClassName = () => {
        const { firstContainerClassName } = this.props;
        const firstChildClassName = 'first';
        const classNames = [
            firstContainerClassName,
            firstChildClassName,
            styles[firstChildClassName],
        ];

        return classNames.join(' ');
    }

    getSecondContainerClassName = () => {
        const { secondContainerClassName } = this.props;
        const secondChildClassName = 'second';
        const classNames = [
            secondContainerClassName,
            secondChildClassName,
            styles[secondChildClassName],
        ];

        return classNames.join(' ');
    }

    handleMouseDown = (e) => {
        const clickOnSeparator = Resizable.isContainerClicked(e, this.separator);

        if (clickOnSeparator) {
            Resizable.syncResizeClassName(this.container, true);

            this.resizing = true;
            this.lastMousePosition = Resizable.getMousePosition(e);
            this.initialSize = this.props.getInitialSize(this.firstContainer);
        } else {
            this.resizing = false;
        }
    }

    handleMouseUp = (e) => {
        if (this.resizing) {
            const mousePosition = Resizable.getMousePosition(e);
            const dx = this.props.calculateDifference(mousePosition, this.lastMousePosition);

            this.props.resizeContainers(
                this.firstContainer,
                this.secondContainer,
                this.initialSize + dx,
            );
            Resizable.syncResizeClassName(this.container, false);

            this.lastMousePosition = {};
            this.resizing = false;

            if (this.props.onResize) {
                this.props.onResize();
            }
        }
    }

    handleMouseMove = (e) => {
        if (this.resizing) {
            const mousePosition = Resizable.getMousePosition(e);
            const dx = this.props.calculateDifference(mousePosition, this.lastMousePosition);

            this.props.resizeContainers(
                this.firstContainer,
                this.secondContainer,
                this.initialSize + dx,
            );
        }
    }

    render() {
        const {
            firstChild,
            secondChild,
        } = this.props;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={this.getClassName()}
            >
                <div
                    ref={(el) => { this.firstContainer = el; }}
                    className={this.getFirstContainerClassName()}
                >
                    { firstChild }
                    <div
                        ref={(el) => { this.separator = el; }}
                        className={this.getSeparatorClassName()}
                    />
                </div>
                <div
                    ref={(el) => { this.secondContainer = el; }}
                    className={this.getSecondContainerClassName()}
                >
                    { secondChild }
                </div>
            </div>
        );
    }
}
