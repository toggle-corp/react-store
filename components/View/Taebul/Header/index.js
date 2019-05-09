import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    renderer: PropTypes.func,
    width: PropTypes.number,
};

const defaultProps = {
    className: '',
    renderer: d => d,
    width: 0,
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
