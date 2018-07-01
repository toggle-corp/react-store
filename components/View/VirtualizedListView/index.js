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

export default class ListView extends React.Component {
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

    componentWillMount() {
        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentDidMount() {
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
                console.warn('scrollin');
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
        const buffers = itemsPerPage;

        for (let i = 0; i < data.length; i += 1) {
            if (i >= (offset - itemsPerPage) && i < (offset + (2 * itemsPerPage))) {
                items.push(modifier(data[i]));
            } else {
                items.push(
                    <div
                        style={{
                            height: `${itemHeight}px`,
                        }}
                    />,
                );
            }
        }


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
