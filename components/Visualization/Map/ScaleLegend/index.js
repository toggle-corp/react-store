import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string.isRequired,
    subTitle: PropTypes.string,
    minValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
    minLabel: PropTypes.node,
    maxLabel: PropTypes.node,
    minColor: PropTypes.string.isRequired,
    maxColor: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    subTitle: '',
    minLabel: '',
    maxLabel: '',
};

export default class ScaleLegend extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'scale-legend',
            styles.scaleLegend,
        ];

        return classNames.join(' ');
    }

    getScaleStyle = () => {
        const {
            minColor,
            maxColor,
        } = this.props;

        return {
            background: `linear-gradient(to right, ${minColor}, ${maxColor})`,
        };
    }

    render() {
        const className = this.getClassName();
        const {
            title,
            subTitle,
            minValue,
            maxValue,
            minLabel,
            maxLabel,
        } = this.props;

        return (
            <div className={className}>
                <h5 className={styles.header}>
                    { title }
                </h5>
                <div
                    className={styles.scale}
                    style={this.getScaleStyle()}
                />
                <div className={styles.scaleValues}>
                    <span className={styles.value}>
                        { minLabel || minValue }
                    </span>
                    <span className={styles.title}>
                        { subTitle }
                    </span>
                    <span className={styles.value}>
                        { maxLabel || maxValue }
                    </span>
                </div>
            </div>
        );
    }
}
