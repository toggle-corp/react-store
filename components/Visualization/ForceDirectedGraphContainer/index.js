import React, {
    Fragment,
} from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const ForceDirectedGraphContainer = (WrappedComponent) => {
    const WrapperComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);
            this.state = {
                value: 5,
            };
        }

        handleInputChange = (event) => {
            this.setState({
                value: event.target.value,
            });
        }

        render() {
            const {
                className: classNameFromProps,
                ...otherProps
            } = this.props;

            const className = [
                styles.container,
                classNameFromProps,
            ].join(' ');

            const { value } = this.state;
            return (
                <div className={className}>
                    <div
                        className={styles.slider}
                    >
                        <input
                            id="sliderinput"
                            type="range"
                            min="1"
                            max="10"
                            value={value}
                            onChange={this.handleInputChange}
                            step="1"
                        />
                    </div>
                    <WrappedComponent
                        className={styles.wrapped}
                        {...otherProps}
                    />
                </div>
            );
        }
    };

    return WrapperComponent;
};

export default ForceDirectedGraphContainer;
