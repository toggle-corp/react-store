import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    activePage: PropTypes.number,
    className: PropTypes.string,
    itemsCount: PropTypes.number,
    maxItemsPerPage: PropTypes.number,
    onPageClick: PropTypes.func.isRequired,
    totalCapacity: PropTypes.number,
};

const defaultProps = {
    activePage: 1,
    className: '',
    itemsCount: 0,
    maxItemsPerPage: 10,
    totalCapacity: 7,
};

function range(start, end) {
    const foo = [];
    for (let i = start; i <= end; i += 1) {
        foo.push(i);
    }
    return foo;
}

class Side {
    constructor(capacity, demand) {
        this.capacity = capacity;
        this.demand = demand;
        this.excess = this.capacity - this.demand;
    }

    hasShortage() {
        return this.excess < 0;
    }

    increaseCapacity(inc) {
        this.capacity += inc;
        this.excess += inc;
    }

    decreaseCapacity(dec) {
        this.capacity += dec;
        this.excess += dec;
    }

    optimizeCapacity() {
        if (this.excess > 0) {
            this.capacity -= this.excess;
            this.excess = 0;
        }
    }
}

@CSSModules(styles, { allowMultiple: true })
export default class Pager extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getPlaceholder = (className, index, key) => (
        <span
            className={className}
            key={key || index}
        >
            {index}
        </span>
    )

    getButton = index => (
        <button
            key={index}
            onClick={() => this.props.onPageClick(index)}
            className="paginate-btn"
        >
            {index}
        </button>
    )

    pagination = (totalCapacity, active, total) => {
        const oneSideCapacity = (totalCapacity - 1) / 2;

        const startIndex = 1;
        const lastIndex = total;

        const right = new Side(oneSideCapacity, active - startIndex);
        const left = new Side(oneSideCapacity, lastIndex - active);

        // Balance sides
        const leftExcess = left.excess;
        const rightExcess = right.excess;
        if (right.hasShortage() && leftExcess > 0) {
            right.increaseCapacity(leftExcess);
        } else if (left.hasShortage() && right.excess > 0) {
            left.increaseCapacity(rightExcess);
        }

        left.optimizeCapacity();
        right.optimizeCapacity();

        let lst = [];
        if (right.capacity > 0) {
            if (right.excess >= 0) {
                lst = [
                    ...lst,
                    ...range(startIndex, active - 1).map(this.getButton),
                ];
            } else {
                lst = [
                    ...lst,
                    this.getButton(startIndex),
                    this.getPlaceholder('tick', '...', 'startTick'),
                    ...range(active - (right.capacity - 2), active - 1).map(this.getButton),
                ];
            }
        }

        lst = [
            ...lst,
            this.getPlaceholder('active', active),
        ];

        if (left.capacity > 0) {
            if (left.excess >= 0) {
                lst = [
                    ...lst,
                    ...range(active + 1, lastIndex).map(this.getButton),
                ];
            } else {
                lst = [
                    ...lst,
                    ...range(active + 1, active + (left.capacity - 2)).map(this.getButton),
                    this.getPlaceholder('tick', '...', 'endTick'),
                    this.getButton(lastIndex),
                ];
            }
        }
        return lst;
    }

    render() {
        const {
            activePage,
            className,
            itemsCount,
            maxItemsPerPage,
            totalCapacity,
        } = this.props;

        const numPages = Math.ceil(itemsCount / maxItemsPerPage);

        return (
            <div
                className={`pager ${className}`}
                styleName="pager"
            >
                <div
                    className="page-list"
                    styleName="page-list"
                >
                    {
                        numPages > 0 &&
                        this.pagination(totalCapacity, activePage, numPages)
                    }
                </div>
            </div>
        );
    }
}
