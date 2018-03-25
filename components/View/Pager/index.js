import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';

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

export default class Pager extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    pagination = (totalCapacity, active, total) => {
        const oneSideCapacity = (totalCapacity - 1) / 2;
        const startIndex = 1;
        const lastIndex = total;

        // Once upon a time, there were two sides of a town
        // And every year, each got equal amount of ration
        // But, they had a variable demand, and each year it could change
        const right = new Side(oneSideCapacity, active - startIndex);
        const left = new Side(oneSideCapacity, lastIndex - active);

        // So the two sides made a treaty
        // If any of the side had an excess that year and the other side had a shortage,
        // they had to give the excess to the other side
        // Thay way, all the ration would be used
        const leftExcess = left.excess;
        const rightExcess = right.excess;
        if (right.hasShortage() && leftExcess > 0) {
            right.increaseCapacity(leftExcess);
        } else if (left.hasShortage() && right.excess > 0) {
            left.increaseCapacity(rightExcess);
        }

        left.optimizeCapacity();
        right.optimizeCapacity();

        let lst = [
            (
                <button
                    key="prev"
                    onClick={() => this.props.onPageClick(active - 1)}
                    disabled={active - 1 < startIndex}
                    className={styles.paginateBtn}
                >
                    <span className={iconNames.chevronLeft} />
                </button>
            ),
        ];

        if (right.capacity > 0) {
            if (right.excess >= 0) {
                lst = [
                    ...lst,
                    ...range(startIndex, active - 1).map(this.renderButton),
                ];
            } else {
                lst = [
                    ...lst,
                    this.renderButton(startIndex),
                    this.renderSpan('', '...', 'startTick'),
                    ...range(active - (right.capacity - 2), active - 1).map(this.renderButton),
                ];
            }
        }

        lst = [
            ...lst,
            this.renderSpan(styles.active, active),
        ];

        if (left.capacity > 0) {
            if (left.excess >= 0) {
                lst = [
                    ...lst,
                    ...range(active + 1, lastIndex).map(this.renderButton),
                ];
            } else {
                lst = [
                    ...lst,
                    ...range(active + 1, active + (left.capacity - 2)).map(this.renderButton),
                    this.renderSpan('', '...', 'endTick'),
                    this.renderButton(lastIndex),
                ];
            }
        }

        lst = [
            ...lst,
            (
                <button
                    key="next"
                    onClick={() => this.props.onPageClick(active + 1)}
                    disabled={active + 1 > lastIndex}
                    className={styles.paginateBtn}
                >
                    <span className={iconNames.chevronRight} />
                </button>
            ),
        ];
        return lst;
    }

    renderSpan = (className, index, key) => (
        <span
            className={`${styles.paginateSpan} ${className}`}
            key={key || index}
        >
            {index}
        </span>
    )

    renderButton = index => (
        <button
            key={index}
            onClick={() => this.props.onPageClick(index)}
            className={styles.paginateBtn}
        >
            {index}
        </button>
    )

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
            <div className={`${styles.pager} ${className} ${styles.pager}`}>
                <div className={`${styles.pageList} ${styles.pageList}`}>
                    {
                        numPages > 0 &&
                        this.pagination(totalCapacity, activePage, numPages)
                    }
                </div>
            </div>
        );
    }
}
