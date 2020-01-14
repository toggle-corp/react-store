import PropTypes from 'prop-types';
import React from 'react';

import _cs from '#cs';

import Message from '../../View/Message';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onDrop: PropTypes.func.isRequired,

    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(
            PropTypes.node,
        ),
    ]).isRequired,

    hoverChildren: PropTypes.node,

    hoverChildrenClassName: PropTypes.string,

    disabled: PropTypes.bool,
};

const defaultProps = {
    className: undefined,
    hoverChildrenClassName: undefined,
    hoverChildren: (
        <Message>
            Drop here
        </Message>
    ),
    disabled: false,
};

export default class DropZone extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.dragEnterCount = 0;
        this.state = {
            isBeingDraggedOver: false,
        };
    }


    handleDragOver = (e) => {
        if (this.props.disabled) {
            return;
        }
        e.preventDefault();
    }

    handleDrop = (e) => {
        if (this.props.disabled) {
            return;
        }
        e.preventDefault();

        this.setState({ isBeingDraggedOver: false });
        this.dragEnterCount = 0;


        const data = e.dataTransfer.getData('text');
        e.dataTransfer.clearData();

        let formattedData;
        try {
            formattedData = JSON.parse(data);
        } catch (ex) {
            console.error(ex);
        }

        this.props.onDrop(formattedData);
    }

    handleDragEnter = () => {
        if (this.props.disabled) {
            return;
        }
        if (this.dragEnterCount === 0) {
            this.setState({ isBeingDraggedOver: true });
        }

        this.dragEnterCount += 1;
    }

    handleDragLeave = () => {
        if (this.props.disabled) {
            return;
        }
        this.dragEnterCount -= 1;

        if (this.dragEnterCount === 0) {
            this.setState({ isBeingDraggedOver: false });
        }
    }

    render() {
        const {
            children,
            hoverChildren,
            className: classNameFromProps,
            hoverChildrenClassName,
        } = this.props;
        const {
            isBeingDraggedOver,
        } = this.state;

        const className = _cs(
            classNameFromProps,
            'drop-zone',
            styles.dropZone,
        );

        return (
            <div
                className={className}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
            >
                { children }
                { isBeingDraggedOver && (
                    <div
                        className={_cs(
                            hoverChildrenClassName,
                            styles.hoverChildren,
                        )}
                    >
                        {hoverChildren}
                    </div>
                )}
            </div>
        );
    }
}
