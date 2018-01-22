import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    leftContainerClassName: PropTypes.string,
    separatorClassName: PropTypes.string,
    rightContainerClassName: PropTypes.string,
    leftChild: PropTypes.node.isRequired,
    rightChild: PropTypes.node.isRequired,
};

const defaultProps = {
    className: '',
    separatorClassName: '',
    leftContainerClassName: '',
    rightContainerClassName: '',
};

export default class ResizableH extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.resizing = false;
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

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'resizable-h',
            styles['resizable-h'],
        ];

        return classNames.join(' ');
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

    getLeftContainerClassName = () => {
        const { leftContainerClassName } = this.props;
        const classNames = [
            leftContainerClassName,
            'left',
            styles.left,
        ];

        return classNames.join(' ');
    }

    getRightContainerClassName = () => {
        const { rightContainerClassName } = this.props;
        const classNames = [
            rightContainerClassName,
            'right',
            styles.right,
        ];

        return classNames.join(' ');
    }

    syncResizeClassName = (resizing) => {
        if (this.container) {
            const resizeClassName = styles.resizing;
            const classNames = this.container.className.split(' ');
            const classNameIndex = classNames.findIndex(d => d === resizeClassName);

            if (resizing) {
                if (classNameIndex === -1) {
                    classNames.push(resizeClassName);
                }
            } else if (classNameIndex !== -1) {
                classNames.splice(classNameIndex, 1);
            }

            this.container.className = classNames.join(' ');
        }
    }

    resizeContainers = (dx) => {
        if (dx !== 0 && this.container && this.leftContainer && this.rightContainer) {
            const totalWidth = this.container.getBoundingClientRect().width;
            const leftContainerWidth = this.leftContainer.getBoundingClientRect().width + dx;

            this.leftContainer.style.width = `${leftContainerWidth}px`;
            this.rightContainer.style.width = `${totalWidth - leftContainerWidth}px`;
        }
    }

    handleMouseDown = (e) => {
        const el = document.elementFromPoint(e.screenX, e.screenY);
        if (this.separator && this.separator === el) {
            this.resizing = true;
            this.lastMousePosition = {
                x: e.screenX,
                y: e.screenY,
            };
            this.syncResizeClassName(this.resizing);
        } else {
            this.resizing = false;
        }
    }

    handleMouseUp = (e) => {
        if (this.resizing) {
            const dx = e.screenX - this.lastMousePosition.x;
            this.resizeContainers(dx);
            this.resizing = false;
            this.lastMousePosition = {
                x: e.screenX,
                y: e.screenY,
            };
            this.syncResizeClassName(this.resizing);
        }
    }

    handleMouseMove = (e) => {
        if (this.resizing) {
            const dx = e.screenX - this.lastMousePosition.x;
            this.resizeContainers(dx);

            this.lastMousePosition = {
                x: e.screenX,
                y: e.screenY,
            };
        }
    }

    render() {
        const {
            leftChild,
            rightChild,
        } = this.props;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={this.getClassName()}
            >
                <div
                    ref={(el) => { this.leftContainer = el; }}
                    className={this.getLeftContainerClassName()}
                >
                    { leftChild }
                    <div
                        ref={(el) => { this.separator = el; }}
                        className={this.getSeparatorClassName()}
                    />
                </div>
                <div
                    ref={(el) => { this.rightContainer = el; }}
                    className={this.getRightContainerClassName()}
                >
                    { rightChild }
                </div>
            </div>
        );
    }
}
