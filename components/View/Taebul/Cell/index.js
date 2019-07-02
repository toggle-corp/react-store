import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    columnKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    datumKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    datum: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    settings: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    renderer: PropTypes.func.isRequired,
    rendererParams: PropTypes.func.isRequired,
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
