import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    className: '',
    children: undefined,
};

export default class Header extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleButtonClick = () => {
        const {
            onHeaderClick,
            columnKey,
        } = this.props;

        onHeaderClick(columnKey);
    }


    render() {
        const {
            className,
            children,
            title,
            sortOrder,
            onHeaderClick,
            columnKey,
            sortable,
            width,
        } = this.props;

        const style = {
            width: `${width}px`,
        };


        if (!sortable) {
            return (
                <div
                    className={className}
                    style={style}
                >
                    { title }
                </div>
            );
        }

        let symbol;
        switch (sortOrder) {
            case 'asc': {
                symbol = 'v';
                break;
            }
            case 'dsc': {
                symbol = '^';
                break;
            }
            default: {
                symbol = '';
                break;
            }
        }

        return (
            <div
                className={className}
                style={style}
            >
                <button
                    onClick={this.handleButtonClick}
                    type="button"
                >
                    {symbol} {title}
                </button>
            </div>
        );
    }
}
