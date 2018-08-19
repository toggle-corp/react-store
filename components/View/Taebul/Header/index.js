import React from 'react';
import PropTypes from 'prop-types';

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

export default class Header extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            columnKey,
            column,
            rendererParams,
            renderer: Children,
            ...otherProps
        } = this.props;

        const params = rendererParams({ columnKey, column });
        const { headerStyle } = column;

        return (
            <div
                className={className}
                style={headerStyle}
            >
                <Children
                    {...otherProps}
                    {...params}
                />
            </div>
        );
    }
}
