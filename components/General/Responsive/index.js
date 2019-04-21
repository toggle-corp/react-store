import PropTypes from 'prop-types';
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import ResizeObserver from 'resize-observer-polyfill';
import { randomString } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};


const resizeHandlers = {};

const handleResize = (entries) => {
    entries.forEach((entry) => {
        const element = entry.target;
        const key = element.dataset.resizeHandlerKey;
        if (key && resizeHandlers[key]) {
            const rect = entry.contentRect;
            resizeHandlers[key](rect);
        }
    });
};

const observer = new ResizeObserver(handleResize);
const addResizeHandler = (element, callback) => {
    const key = randomString(16);
    // eslint-disable-next-line no-param-reassign
    element.dataset.resizeHandlerKey = key;
    resizeHandlers[key] = callback;
    observer.observe(element);
};

const removeResizeHandler = (element) => {
    if (!element) {
        return;
    }

    observer.unobserve(element);
    const key = element.dataset.resizeHandlerKey;
    if (!key || !resizeHandlers[key]) {
        return;
    }
    delete resizeHandlers[key];
};

// Following can be memoized but is it worth it?
const _cs = (...args) => args.join(' '); // eslint-disable-line no-underscore-dangle

export default (WrappedComponent) => {
    class ResponsiveElement extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);
            this.containerRef = React.createRef();
            this.state = {
                rect: {},
            };
        }

        componentDidMount() {
            addResizeHandler(this.containerRef.current, this.handleResize);
        }

        componentWillUnmount() {
            removeResizeHandler(this.containerRef.current);
            clearTimeout(this.timeout);
        }

        handleResize = (rect) => {
            clearTimeout(this.timeout);

            this.timeout = setTimeout(() => {
                this.setState({ rect });
            }, 200);
        }

        render() {
            const {
                className,
                ...otherProps
            } = this.props;

            return (
                <div
                    className={_cs(className, styles.responsive, 'responsive')}
                    ref={this.containerRef}
                >
                    <WrappedComponent
                        className={styles.responsiveChild}
                        boundingClientRect={this.state.rect}
                        {...otherProps}
                    />
                </div>
            );
        }
    }

    return hoistNonReactStatics(
        ResponsiveElement,
        WrappedComponent,
    );
};
