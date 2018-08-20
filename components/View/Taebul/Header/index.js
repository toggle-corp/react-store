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
        } = this.props;

        const params = rendererParams ? rendererParams({ columnKey, column }) : {};
        const { headerStyle } = column;

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
