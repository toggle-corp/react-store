import PropTypes from 'prop-types';
import React from 'react';
import { getRgbRawFromHex, _cs } from '@togglecorp/fujs';


import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    highlightKey: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
    onClick: PropTypes.func,
    label: PropTypes.string,
    tooltip: PropTypes.string,
    color: PropTypes.string.isRequired,
};

const defaultProps = {
    onClick: () => {},
    className: '',
    label: undefined,
    tooltip: undefined,
};

export default class Highlight extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    // FIXME: memoize this
    static getHighlightColors = (color) => {
        const [r, g, b] = getRgbRawFromHex(color);

        const backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
        const borderColor = color;
        const labelColor = `rgba(${r}, ${g}, ${b}, 0.5)`;

        return {
            background: backgroundColor,
            border: borderColor,
            label: labelColor,
        };
    };

    handleClick = (e) => {
        const {
            onClick,
            text,
            highlightKey,
            highlight,
        } = this.props;

        onClick(
            e,
            {
                text,
                highlight,
                key: highlightKey,
            },
        );
        e.stopPropagation();
    }

    handleDrag = (e) => {
        const { text } = this.props;
        e.dataTransfer.setData('text/plain', text);
        e.stopPropagation();
    };

    render() {
        const {
            color,
            label,
            tooltip,
            children,
            className: classNameFromProps,
        } = this.props;

        const colors = Highlight.getHighlightColors(color);

        const style = {
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
        };

        const labelStyle = {
            backgroundColor: colors.label,
        };

        const className = _cs(
            styles.highlight,
            classNameFromProps,
            'tc-highlighted-text-highlight',
        );

        return (
            <span
                className={className}
                role="presentation"
                style={style}
                onClick={this.handleClick}
                onDragStart={this.handleDrag}
                draggable
                title={tooltip}
            >
                <span className={styles.text}>
                    {children}
                </span>
                { label && (
                    <span
                        className={styles.label}
                        style={labelStyle}
                    >
                        { label }
                    </span>
                )}
            </span>
        );
    }
}
