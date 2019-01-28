import React, {
    Fragment,
} from 'react';
import PropTypes from 'prop-types';

import PrimaryButton from '../../Action/Button/PrimaryButton';
import iconNames from '../../../constants/iconNames';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.object, // eslint-disable-line react/no-unused-props
    options: PropTypes.object,
    layout: PropTypes.oneOf(['relaxed', 'ordered', 'squarified']),
    outlineColor: PropTypes.string,
    getSelectedData: PropTypes.func,
};

const defaultProps = {
    className: '',
    data: {},
    options: {},
    layout: 'relaxed',
    outlineColor: '#ff0',
    getSelectedData: () => {},
};

export default class FoamTreeContainer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        window.addEventListener('resize', this.handleResize());
        if (this.chartDrawTimeout) {
            clearTimeout(this.chartDrawTimeout);
        }
        this.chartDrawTimeout = setTimeout(() => { this.setupChart(); }, 300);
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            data,
            layout,
            options,
        } = this.props;

        if (
            prevProps.data !== data ||
            prevProps.layout !== layout ||
            prevProps.options !== options
        ) {
            this.chart.set({
                layout,
                dataObject: data,
                ...options,
            });
            this.chart.redraw();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize());
        if (this.chartDrawTimeout) {
            clearTimeout(this.chartDrawTimeout);
        }
    }

    getImageUri = () => {
        if (this.chart) {
            return this.chart.get('imageData', {
                format: 'image/png',
            });
        }
        return null;
    }

    setupChart = () => {
        const {
            data,
            layout,
            outlineColor,
            getSelectedData,
        } = this.props;

        this.chart = new window.CarrotSearchFoamTree({
            id: 'foam-tree-container',
            layout,
            dataObject: {
                groups: [
                    {
                        id: '1',
                        label: 'Group 1',
                        selected: true,
                        groups: [
                            { id: '1.1', label: 'Group 1.1' },
                            { id: '1.2', label: 'Group 1.2' },
                        ],
                    },
                    {
                        id: '2',
                        label: 'Group 2',
                        groups: [
                            { id: '2.1', label: 'Group 2.1' },
                            { id: '2.2', label: 'Group 2.2' },
                        ],
                    },
                    {
                        id: '3',
                        label: 'Group 3',
                        groups: [
                            { id: '3.1', label: 'Group 3.1' },
                            { id: '3.2', label: 'Group 3.2' },
                        ],
                    },
                    {
                        id: '4',
                        label: 'Group 4',
                        groups: [
                            { id: '4.1', label: 'Group 4.1' },
                            { id: '4.2', label: 'Group 4.2' },
                        ],
                    },
                    {
                        id: '5',
                        label: 'Group 5',
                        groups: [
                            { id: '5.1', label: 'Group 5.1' },
                            { id: '5.2', label: 'Group 5.2' },
                        ],
                    },
                ],
            },
            groupSelectionOutlineColor: outlineColor,
            onGroupExposureChanged: (info) => {
                getSelectedData(info);
            },
        });
    }

    handleResize = () => {
        let timeout;
        return () => {
            clearTimeout(timeout);
            setTimeout(this.chart.resize, 30);
        };
    }

    handleClick =() => {
        const link = document.createElement('a');
        link.href = this.getImageUri();
        link.download = 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    render() {
        const {
            className,
        } = this.props;

        const classNames = [
            'foam-tree-container',
            styles.foamTree,
            className,
        ].join(' ');

        return (
            <Fragment>
                <div
                    className={classNames}
                    ref={(el) => { this.container = el; }}
                    id="foam-tree-container"
                />
                <PrimaryButton
                    title="Download"
                    onClick={this.handleClick}
                    iconName={iconNames.download}
                    transparent
                />
            </Fragment>
        );
    }
}
