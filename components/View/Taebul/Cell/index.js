import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class Cell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            settings,
            datumKey,
            datum,
            columnKey,
            column,
            rendererParams,
            renderer: Children,
        } = this.props;

        const params = rendererParams({ datum, column, datumKey, columnKey, settings });
        const { cellStyle } = column;
        const className = `
            ${classNameFromProps}
            ${styles.cell}
        `;

        return (
            <div
                style={cellStyle}
                className={className}
            >
                <Children
                    {...params}
                />
            </div>
        );
    }
}
