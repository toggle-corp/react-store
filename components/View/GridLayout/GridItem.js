import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node,
    title: PropTypes.string,
    headerRightComponent: PropTypes.node,
    onDragStart: PropTypes.func.isRequired,
    onResizeStart: PropTypes.func.isRequired,
    viewOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    children: undefined,
    headerRightComponent: undefined,
    title: '',
    viewOnly: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class GridItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.handleMouseUp);
    }

    getStyleName = () => {
        const styleNames = [];
        styleNames.push('grid-item');

        if (this.props.viewOnly) {
            styleNames.push('view-only');
        }

        return styleNames.join(' ');
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

    render() {
        const {
            className,
            children,
            title,
            headerRightComponent,
            data,
        } = this.props;

        const layout = {
            ...data.layout,
        };

        return (
            <div
                ref={(el) => { this.container = el; }}
                styleName={this.getStyleName()}
                className={className}
                style={layout}
            >
                <header
                    styleName="header"
                >
                    <h3
                        role="presentation"
                        ref={(el) => { this.dragHandle = el; }}
                        styleName="heading"
                        onMouseDown={this.handleDragHandleMouseDown}
                        onMouseUp={this.handleDragHandleMouseUp}
                    >
                        { title }
                    </h3>
                    { headerRightComponent }
                </header>
                <div
                    styleName="content"
                >
                    { children }
                </div>
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
