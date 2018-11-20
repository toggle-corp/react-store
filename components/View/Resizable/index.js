import PropTypes from 'prop-types';
import React from 'react';

/*
eslint css-modules/no-unused-class: [
    1,
    { markAsUsed: ['resizable-h', 'resizable-v'], camelCase: true }
]
*/
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    firstChild: PropTypes.node,
    firstContainerClassName: PropTypes.string,

    secondChild: PropTypes.node,
    secondContainerClassName: PropTypes.string,

    separatorClassName: PropTypes.string,

    resizableClassName: PropTypes.string.isRequired,
    getInitialSize: PropTypes.func.isRequired,
    calculateDifference: PropTypes.func.isRequired,
    resizeContainers: PropTypes.func.isRequired,

    onResize: PropTypes.func,

    disabled: PropTypes.bool,
};

const defaultProps = {
    className: '',
    disabled: false,
    firstChild: null,
    secondChild: null,
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
        this.state = {
            dragging: false,
        };
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

    getOverlayClassName = () => {
        const classNames = [
            'overlay',
            styles.overlay,
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
        const classNames = [
            firstContainerClassName,
            'first',
            styles.first,
        ];

        return classNames.join(' ');
    }

    getSecondContainerClassName = () => {
        const { secondContainerClassName } = this.props;
        const classNames = [
            secondContainerClassName,
            'second',
            styles.second,
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
            this.setState({ dragging: true });
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
            this.setState({ dragging: false });
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
            disabled,
        } = this.props;
        const { dragging } = this.state;

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
                    { dragging && <div className={this.getOverlayClassName()} /> }
                </div>
                <div
                    ref={(el) => { this.secondContainer = el; }}
                    className={this.getSecondContainerClassName()}
                >
                    { secondChild }
                    { !disabled &&
                        <div
                            ref={(el) => { this.separator = el; }}
                            className={this.getSeparatorClassName()}
                        />
                    }
                    { dragging && <div className={this.getOverlayClassName()} /> }
                </div>
            </div>
        );
    }
}
