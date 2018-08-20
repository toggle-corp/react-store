import React from 'react';
import PropTypes from 'prop-types';

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
            className,
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
