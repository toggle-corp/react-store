import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

const propTypes = {
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    width: PropTypes.number,
    height: PropTypes.number,
    align: PropTypes.oneOf(['vertical', 'horizontal']),
};

const defaultProps = {
    colorScheme: [],
    width: 20,
    height: 20,
    align: 'horizontal',
};

export default class ColorPalette extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            colorScheme,
            width,
            height,
            align,
        } = this.props;

        const float = (align === 'horizontal' ? 'left' : '');
        const pallete = colorScheme.map(color => (
            <span
                key={`pallete-${color}`}
                className="swatch"
                style={{
                    backgroundColor: color,
                    display: 'block',
                    width: `${width}px`,
                    height: `${height}px`,
                    float: `${float}`,
                }}
            />
        ));
        return (
            <div>
                { pallete }
            </div>
        );
    }
}
