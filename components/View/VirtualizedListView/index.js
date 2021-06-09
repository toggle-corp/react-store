import PropTypes from 'prop-types';
import React from 'react';
import {
    isFalsy,
    _cs,
} from '@togglecorp/fujs';

import Message from '../Message';
import Responsive from '../../General/Responsive';
import styles from './styles.scss';

const DefaultEmptyComponent = () => {
    const className = `
        empty
        ${styles.empty}
    `;

    return (
        <Message className={className}>
            Nothing to show.
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
    id: PropTypes.string,
    data: propTypeData,

    keySelector: PropTypes.func,
    modifier: PropTypes.func,

    renderer: PropTypes.func,
    rendererClassName: PropTypes.string,

    rendererParams: PropTypes.func,
    emptyComponent: PropTypes.func,

    minWidth: PropTypes.number,

    itemHeight: PropTypes.number,
    boundingClientRect: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    onItemHeightCalculate: PropTypes.func,
};

const defaultProps = {
    className: '',
    id: undefined,
    data: [],
    modifier: undefined,
    keySelector: undefined,
    renderer: undefined,
    rendererClassName: '',
    rendererParams: undefined,
    emptyComponent: DefaultEmptyComponent,
    minWidth: undefined,

    itemHeight: undefined,
    boundingClientRect: undefined,
    onItemHeightCalculate: undefined,
};

const MAX_IDLE_TIMEOUT = 200;

class VirtualizedListView extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { itemHeight } = props;

        this.state = {
            itemsPerPage: undefined,
            offset: 0,
            itemHeight,
        };

        this.container = React.createRef();
        this.item = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
        this.setItemHeight();
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps(nextProps) {
        const {
            itemHeight,
            boundingClientRect,
        } = this.props;

        const {
            itemHeight: newItemHeight,
            boundingClientRect: newBoundingClientRect,
        } = nextProps;

        if (boundingClientRect !== newBoundingClientRect) {
            this.updateItemsPerPage(newBoundingClientRect);
        }

        if (itemHeight !== newItemHeight) {
            this.setState({ itemHeight: newItemHeight });
        }
    }

    componentDidUpdate() {
        const { itemHeight } = this.state;

        if (!itemHeight) {
            this.setItemHeight();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll, true);
        clearTimeout(this.containerHeightTimeout);
    }

    setItemHeight = () => {
        const { onItemHeightCalculate } = this.props;
        clearTimeout(this.containerHeightTimeout);

        const { current: container } = this.container;
        const { current: item } = this.item;
        const { itemHeight: itemHeightFromState } = this.state;

        if (!item) {
            return;
        }

        const itemBCR = item.getBoundingClientRect();
        const itemHeight = itemBCR.height;

        if (itemHeightFromState === itemHeight) {
            return;
        }

        const containerBCR = container.getBoundingClientRect();

        if (itemHeight === 0 && containerBCR.height === 0) {
            // NOTE: this is a hack
            this.containerHeightTimeout = setTimeout(this.setItemHeight, 500);
        } else {
            const itemsPerPage = Math.ceil(containerBCR.height / itemHeight);
            // eslint-disable-next-line react/no-did-mount-set-state
            this.setState({
                itemsPerPage,
                itemHeight,
            });

            if (onItemHeightCalculate) {
                onItemHeightCalculate(itemHeight);
            }
        }
    }

    updateItemsPerPage = (containerBCR) => {
        // const { height } = containerBCR;
        const { itemHeight } = this.state;

        if (!itemHeight) {
            return;
        }

        const itemsPerPage = Math.ceil(containerBCR.height / itemHeight);
        this.setState({
            itemsPerPage,
        });
    }

    updateItemsPerPage = (containerBCR) => {
        // const { height } = containerBCR;
        const { itemHeight } = this.state;

        if (!itemHeight) {
            return;
        }

        const itemsPerPage = Math.ceil(containerBCR.height / itemHeight);
        this.setState({
            itemsPerPage,
        });
    }

    handleScroll = (e) => {
        const { itemHeight } = this.state;

        if (!itemHeight) {
            return;
        }
        const { current: container } = this.container;
        const { offset } = this.state;

        if (e.target !== container) {
            return;
        }

        const newOffset = Math.floor(container.scrollTop / itemHeight);
        if (newOffset === offset) {
            return;
        }

        window.cancelIdleCallback(this.idleCallback);

        this.idleCallback = window.requestIdleCallback(
            () => {
                this.setState({ offset: newOffset });
            },
            { timeout: MAX_IDLE_TIMEOUT },
        );
    }

    renderItem = (datum, i) => {
        const {
            data,
            keySelector,
            modifier,
            renderer: Renderer,
            rendererClassName: rendererClassNameFromProps,
            rendererParams,
        } = this.props;

        const { itemHeight } = this.state;

        const keyFromSelector = keySelector && keySelector(datum, i);
        const key = keyFromSelector === undefined ? datum : keyFromSelector;

        if (modifier) {
            return modifier(key, datum, i, data);
        }

        if (Renderer) {
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
                    itemHeight={itemHeight}
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

        if (isFalsy(itemHeight)) {
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
        // const bufferSpace = 0;
        const bufferSpace = itemsPerPage;

        const startIndex = Math.max(offset - bufferSpace, 0);
        const endIndex = Math.min(offset + itemsPerPage + bufferSpace, data.length);

        items.push(
            <div
                className={_cs(styles.virtualDiv, 'virtual-div')}
                key="virtualized-list-item-start-div"
                style={{
                    height: `${itemHeight * startIndex}px`,
                    // backgroundSize: `100% ${itemHeight * 2}px`,
                }}
            />,
        );

        for (let i = startIndex; i < endIndex; i += 1) {
            items.push(this.renderItem(data[i], i));
        }

        items.push(
            <div
                className={_cs(styles.virtualDiv, 'virtual-div')}
                key="virtualized-list-item-end-div"
                style={{
                    height: `${itemHeight * (data.length - endIndex)}px`,
                    // backgroundSize: `100% ${itemHeight * 2}px`,
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
            id,
            minWidth,
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
                id={id}
                className={className}
            >
                <Items />
                { data.length === 0 && (
                    <React.Fragment>
                        { EmptyComponent && <EmptyComponent /> }
                        { minWidth && (
                            <div
                                style={{
                                    width: minWidth,
                                }}
                                className={styles.emptyMinWidthContainer}
                            />
                        )}
                    </React.Fragment>
                )}
            </div>
        );
    }
}

export default Responsive(VirtualizedListView);
