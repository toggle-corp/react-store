import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node,
    onDragStart: PropTypes.func.isRequired,
    onResizeStart: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    children: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class GridItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidUpdate() {
        const {
            data,
        } = this.props;

        const pos = data.position;

        if (this.dragHandle) {
            const {
                style,
            } = this.dragHandle;

            style.left = `${pos.left}px`;
            style.top = `${pos.top}px`;
            style.width = `${pos.width}px`;
            style.height = `${pos.height}px`;
        }
    }

    handleDragStart = (e) => {
        const {
            clientX,
            clientY,
        } = e;

        const transferData = JSON.stringify({ clientX, clientY });

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/json', transferData);

        const {
            onDragStart,
            data,
        } = this.props;

        onDragStart(data.key, e);
    }

    handleDragHandleMouseDown = (e) => {
        const classNames = e.target.className.split(' ');
        const i = classNames.findIndex(d => d === styles.dragging);

        if (i === -1) {
            classNames.push(styles.dragging);
            e.target.className = classNames.join(' ');
        }

        this.props.onDragStart(this.props.data.key, e);
    }

    handleDragHandleMouseUp = (e) => {
        const classNames = e.target.className.split(' ');
        const i = classNames.findIndex(d => d === styles.dragging);

        if (i !== -1) {
            classNames.splice(i, 1);
            e.target.className = classNames.join(' ');
        }
    }

    handleResizeHandleMouseDown = (e) => {
        const {
            onResizeStart,
            data,
        } = this.props;

        e.stopPropagation();
        const classNames = this.dragHandle.className.split(' ');
        const i = classNames.findIndex(d => d === styles.resizing);

        if (i === -1) {
            classNames.push(styles.resizing);
            this.dragHandle.className = classNames.join(' ');
        }

        onResizeStart(data.key, e);
    }

    handleResizeHandleMouseUp = () => {
        const classNames = this.dragHandle.className.split(' ');
        const i = classNames.findIndex(d => d === styles.resizing);

        if (i !== -1) {
            classNames.splice(i, 1);
            this.dragHandle.className = classNames.join(' ');
        }
    }

    render() {
        const {
            className,
            children,
        } = this.props;

        return (
            <div
                ref={(el) => { this.dragHandle = el; }}
                role="presentation"
                styleName="grid-item"
                className={className}
                onMouseDown={this.handleDragHandleMouseDown}
                onMouseUp={this.handleDragHandleMouseUp}
            >
                { children }
                <span
                    ref={(el) => { this.resizeHandle = el; }}
                    role="presentation"
                    onMouseDown={this.handleResizeHandleMouseDown}
                    onMouseUp={this.handleResizeHandleMouseUp}
                    styleName="resize-handle"
                />
            </div>
        );
    }
}
