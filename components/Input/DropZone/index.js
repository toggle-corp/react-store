import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onDrop: PropTypes.func,

    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(
            PropTypes.node,
        ),
    ]).isRequired,

    disabled: PropTypes.bool,
};

const defaultProps = {
    className: '',
    onDrop: undefined,
    disabled: false,
};

export default class DropZone extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName() {
        const { className } = this.props;
        const classNames = [
            className,
            'drop-zone',
            styles.dropZone,
        ];

        return classNames.join(' ');
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

        // Convert FileList to normal array
        const files = [];
        for (let i = 0; i < e.dataTransfer.files.length; i += 1) {
            files.push(e.dataTransfer.files[i]);
        }

        if (this.props.onDrop) {
            this.props.onDrop(files);
        }

        e.dataTransfer.clearData();
    }

    render() {
        const className = this.getClassName();
        const { children } = this.props;

        return (
            <div
                className={className}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
            >
                { children }
            </div>
        );
    }
}
