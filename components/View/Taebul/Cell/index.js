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
            datum,
            column,
            rendererParams,
            renderer: Children,
            ...otherProps
        } = this.props;

        const { cellStyle } = column;
        const params = rendererParams({ datum, column });

        return (
            <div
                style={cellStyle}
                className={className}
            >
                <Children
                    {...otherProps}
                    {...params}
                />
            </div>
        );
    }
}
