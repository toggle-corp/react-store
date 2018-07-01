import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypeData = PropTypes.arrayOf(
    PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.object,
        PropTypes.array,
    ]),
);

const propTypes = {
    className: PropTypes.string,
    data: propTypeData,

    keyExtractor: PropTypes.func,
    modifier: PropTypes.func,

    renderer: PropTypes.func,
    rendererClassName: PropTypes.string,

    rendererParams: PropTypes.func,
};

const defaultProps = {
    className: '',
    data: [],
    modifier: undefined,
    keyExtractor: undefined,
    renderer: undefined,
    rendererClassName: undefined,
    rendererParams: undefined,
};

export default class VirtualizedListView extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            itemsPerPage: undefined,
            offset: 0,
        };

        this.container = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);

        const { itemHeight } = this.props;
        const { current: container } = this.container;

        if (container) {
            const bcr = container.getBoundingClientRect();
            const itemsPerPage = Math.ceil(bcr.height / itemHeight);

            // eslint-disable-next-line react/no-did-mount-set-state
            this.setState({ itemsPerPage });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    handleScroll = (e) => {
        const { itemHeight } = this.props;
        const { current: container } = this.container;

        const { offset } = this.state;

        if (e.target === container) {
            const newOffset = Math.floor(container.scrollTop / itemHeight);
            if (newOffset !== offset) {
                clearTimeout(this.timeout);

                this.timeout = setTimeout(() => {
                    this.setState({ offset: newOffset });
                }, 200);
            }
        }
    }

    renderItem = (datum, i) => {
        const {
            data,
            keyExtractor,
            modifier,
            renderer: Renderer,
            rendererClassName: rendererClassNameFromProps,
            rendererParams,
        } = this.props;

        const key = (keyExtractor && keyExtractor(datum, i)) || datum;

        if (modifier) {
            return modifier(key, datum, i, data);
        } else if (Renderer) {
            const extraProps = rendererParams
                ? rendererParams(key, datum, i, data)
                : undefined;
            const rendererClassName = `
                ${rendererClassNameFromProps}
                ${styles.item}
            `;

            return (
                <Renderer
                    className={rendererClassName}
                    key={key}
                    {...extraProps}
                />
            );
        }
        console.warn('Must provide either renderer or modifier');
        return null;
    }

    renderItems = () => {
        const {
            data,
            itemHeight,
        } = this.props;

        const {
            itemsPerPage,
            offset,
        } = this.state;

        if (!itemsPerPage) {
            return null;
        }

        const items = [];
        const bufferSpace = itemsPerPage;

        const startIndex = Math.max(offset - bufferSpace, 0);
        const endIndex = Math.min(offset + itemsPerPage + bufferSpace, data.length);

        items.push(
            <div
                key="virtualized-list-item-start-div"
                style={{
                    height: `${itemHeight * startIndex}px`,
                }}
            />,
        );

        for (let i = startIndex; i < endIndex; i += 1) {
            items.push(this.renderItem(data[i], i));
        }

        items.push(
            <div
                key="virtualized-list-item-end-div"
                style={{
                    height: `${itemHeight * (data.length - endIndex)}px`,
                }}
            />,
        );

        return items;
    }

    render() {
        const {
            className: classNameFromProps,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.virtualizedListView}
            virtualized-list-view
        `;

        const Items = this.renderItems;

        return (
            <div
                ref={this.container}
                className={className}
            >
                <Items />
            </div>
        );
    }
}
