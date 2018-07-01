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
};

const defaultProps = {
    className: '',
    data: [],
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

    renderItems = () => {
        const {
            modifier,
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
            items.push(modifier(data[i], i));
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
            data,
            className: classNameFromProps,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.virutalizedListView}
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
