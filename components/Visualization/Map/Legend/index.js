import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    legendItems: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        color: PropTypes.color,
        innerText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        textColor: PropTypes.string,
        size: PropTypes.number,
        rightComponent: PropTypes.func,
    })),
};

const defaultProps = {
    className: '',
    legendItems: [],
};

export default class Legend extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'legend',
            styles.legend,
        ];

        return classNames.join(' ');
    }

    getItemClassName = (item) => {
        const classNames = [
            styles.legendItem,
            item.className,
            'legend-item',
        ];

        return classNames.join(' ');
    }

    renderLegendItem = item => (
        <div
            className={this.getItemClassName(item)}
            key={item.label}
        >
            <div className={styles.leftChild}>
                <div className={styles.iconContainer}>
                    <span
                        className={styles.icon}
                        style={{
                            backgroundColor: item.color || 'rgba(0, 0, 0, 0.5)',
                            width: item.size || 10,
                            height: item.size || 10,
                            color: item.textColor || '#000',
                        }}
                    >
                        {item.innerText}
                    </span>
                </div>
                <p className={`${styles.label} label`} >
                    {item.label}
                </p>
            </div>
            <div>
                {item.rightComponent && <item.rightComponent />}
            </div>
        </div>
    )

    render() {
        const { legendItems } = this.props;
        const className = this.getClassName();

        return (
            <div className={className} >
                {legendItems.length > 0 &&
                    <h5 className={styles.header}>Layers</h5>
                }
                {legendItems.map(item => this.renderLegendItem(item))}
            </div>
        );
    }
}
