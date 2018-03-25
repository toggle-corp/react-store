import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    modifier: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onResizeStart: PropTypes.func.isRequired,
    viewOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    viewOnly: false,
};

export default class GridItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.handleMouseUp);
    }

    getClassName = () => {
        const {
            viewOnly,
            className,
        } = this.props;

        const classNames = [
            className,
            styles.gridItem,
        ];

        if (viewOnly) {
            classNames.push(styles.viewOnly);
        }

        return classNames.join(' ');
    }

    handleDragHandleMouseDown = (e) => {
        if (this.props.viewOnly) {
            return;
        }

        // return if not left mouse button
        if (e.button !== 0) {
            return;
        }

        const classNames = this.container.className.split(' ');
        const i = classNames.findIndex(d => d === styles.dragging);

        if (i === -1) {
            classNames.push(styles.dragging);
            this.container.className = classNames.join(' ');
        }

        this.props.onDragStart(this.props.data.key, e);
    }

    handleResizeHandleMouseDown = (e) => {
        if (this.props.viewOnly) {
            return;
        }

        // return if not left mouse button
        if (e.button !== 0) {
            return;
        }

        const {
            onResizeStart,
            data,
        } = this.props;

        const classNames = this.container.className.split(' ');
        const i = classNames.findIndex(d => d === styles.resizing);

        if (i === -1) {
            classNames.push(styles.resizing);
            this.container.className = classNames.join(' ');
        }

        onResizeStart(data.key, e);
    }

    handleMouseUp = () => {
        if (this.props.viewOnly) {
            return;
        }

        const classNames = this.container.className.split(' ');

        {
            const i = classNames.findIndex(d => d === styles.resizing);
            if (i !== -1) {
                classNames.splice(i, 1);
                this.container.className = classNames.join(' ');
            }
        }

        {
            const i = classNames.findIndex(d => d === styles.dragging);
            if (i !== -1) {
                classNames.splice(i, 1);
                this.container.className = classNames.join(' ');
            }
        }
    }

    renderHeader = () => {
        const {
            title,
            headerRightComponent,
        } = this.props.data;

        return (
            <header className="header">
                <h3
                    className="heading"
                    role="presentation"
                    ref={(el) => { this.dragHandle = el; }}
                    onMouseDown={this.handleDragHandleMouseDown}
                    onMouseUp={this.handleDragHandleMouseUp}
                >
                    { title }
                </h3>
                { headerRightComponent }
            </header>
        );
    }

    renderResizeHandle = () => {
        const className = [
            styles.resizeHandle,
            'resize-handle',
        ].join(' ');

        return (
            <span
                className={className}
                ref={(el) => { this.resizeHandle = el; }}
                role="presentation"
                onMouseDown={this.handleResizeHandleMouseDown}
                onMouseUp={this.handleResizeHandleMouseUp}
            />
        );
    }

    render() {
        const {
            modifier,
            data,
        } = this.props;

        const { layout } = data;
        const className = this.getClassName();
        const style = {
            width: layout.width,
            height: layout.height,
            transform: `translate(${layout.left}px, ${layout.top}px)`,
        };

        const Header = this.renderHeader;
        const ResizeHandle = this.renderResizeHandle;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={className}
                style={style}
            >
                <Header />
                <div className="content">
                    { modifier(data) }
                </div>
                <ResizeHandle />
            </div>
        );
    }
}
