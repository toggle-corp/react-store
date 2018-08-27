import PropTypes from 'prop-types';
import React from 'react';

import Message from '../Message';
import styles from './styles.scss';

const DefaultEmptyComponent = () => {
    const className = `
        empty
        ${styles.empty}
    `;

    const emptyText = 'Nothing here';

    return (
        <Message className={className}>
            { emptyText }
        </Message>
    );
};


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
    emptyComponent: PropTypes.func,
};

const defaultProps = {
    className: '',
    data: [],
    modifier: undefined,
    keyExtractor: undefined,
    renderer: undefined,
    rendererClassName: '',
    rendererParams: undefined,
    emptyComponent: DefaultEmptyComponent,
};

const MAX_IDLE_TIMEOUT = 200;

export default class VirtualizedListView extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            itemsPerPage: undefined,
            offset: 0,
            itemHeight: undefined,
        };

        this.container = React.createRef();
        this.item = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
        this.setItemHeight();
    }

    componentDidUpdate() {
        const { itemHeight } = this.state;

        if (!itemHeight) {
            this.setItemHeight();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll, true);
        window.cancelIdleCallback(this.idleCallback);
    }

    setItemHeight = () => {
        const { current: container } = this.container;
        const { current: item } = this.item;
        const { itemHeight: itemHeightFromState } = this.state;

        if (item) {
            const itemBCR = item.getBoundingClientRect();
            const itemHeight = itemBCR.height;

            if (itemHeightFromState !== itemHeight) {
                const containerBCR = container.getBoundingClientRect();
                const itemsPerPage = Math.ceil(containerBCR.height / itemHeight);

                // eslint-disable-next-line react/no-did-mount-set-state
                this.setState({
                    itemsPerPage,
                    itemHeight,
                });
            }
        }
    }

    handleScroll = (e) => {
        const { itemHeight } = this.state;

        if (itemHeight) {
            const { current: container } = this.container;
            const { offset } = this.state;

            if (e.target === container) {
                const newOffset = Math.floor(container.scrollTop / itemHeight);
                if (newOffset !== offset) {
                    window.cancelIdleCallback(this.idleCallback);

                    this.idleCallback = window.requestIdleCallback(() => {
                        this.setState({ offset: newOffset });
                    }, { timeout: MAX_IDLE_TIMEOUT });
                }
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
        const { data } = this.props;

        if (data.length === 0) {
            return null;
        }

        const {
            itemsPerPage,
            offset,
            itemHeight,
        } = this.state;

        if (!itemHeight) {
            return (
                <div ref={this.item}>
                    { this.renderItem(data[0], 0) }
                </div>
            );
        }

        if (!itemsPerPage) {
            return null;
        }

        const items = [];
        const bufferSpace = itemsPerPage;

        const startIndex = Math.max(offset - bufferSpace, 0);
        const endIndex = Math.min(offset + itemsPerPage + bufferSpace, data.length);

        items.push(
            <div
                className={styles.virtualDiv}
                key="virtualized-list-item-start-div"
                style={{
                    height: `${itemHeight * startIndex}px`,
                    backgroundSize: `100% ${itemHeight * 2}px`,
                }}
            />,
        );

        for (let i = startIndex; i < endIndex; i += 1) {
            items.push(this.renderItem(data[i], i));
        }

        items.push(
            <div
                className={styles.virtualDiv}
                key="virtualized-list-item-end-div"
                style={{
                    height: `${itemHeight * (data.length - endIndex)}px`,
                    backgroundSize: `100% ${itemHeight * 2}px`,
                }}
            />,
        );

        return items;
    }

    render() {
        const {
            className: classNameFromProps,
            emptyComponent: EmptyComponent,
            data,
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
                { data.length === 0 && <EmptyComponent /> }
            </div>
        );
    }
}
