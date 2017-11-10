import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import { Responsive } from '../../General';

const propTypes = {
};

const defaultProps = {
};

@Responsive
@CSSModules(styles, { allowMultiple: true })
export default class Body extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { boundingClientRect } = this.props;

        return (
            <div
                styleName="loading-animation"
                style={{
                    width: `${boundingClientRect.width || 0}px`,
                    height: `${boundingClientRect.height || 0}px`,
                    left: `${boundingClientRect.left || 0}px`,
                    top: `${boundingClientRect.top || 0}px`,
                }}
            >
                <span
                    className="ion-load-c"
                    styleName="icon"
                />
            </div>
        );
    }
}
