import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    renderer: PropTypes.func,
    rendererParams: PropTypes.func.isRequired,
    columnKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    data: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    settings: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    renderer: d => d,
};

// eslint-disable-next-line
export default class Header extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            data,
            columnKey,
            column,
            rendererParams,
            renderer: Children,
            settings,
        } = this.props;

        const params = rendererParams ? rendererParams({ columnKey, column, settings, data }) : {};
        const { headerStyle } = column;
        const className = `
            ${classNameFromProps}
            ${styles.header}
        `;

        return (
            <div
                style={headerStyle}
                className={className}
            >
                <Children
                    {...params}
                />
            </div>
        );
    }
}
