import React from 'react';
import PropTypes from 'prop-types';
import html2canvas from 'html2canvas';

import Button from '../../../Action/Button';
import MapChild from '../MapChild';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    map: PropTypes.object.isRequired,
    legendContainerClassName: PropTypes.string,
};

const defaultProps = {
    legendContainerClassName: undefined,
};

class MapDownload extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            pending: false,
        };
    }

    export = () => {
        const {
            map,
            legendContainerClassName,
        } = this.props;
        if (!map) {
            console.warn('Cannot export as there is no map');
            return;
        }

        this.setState({ pending: true });
        const mapCanvas = map.getCanvas();

        const canvas = document.createElement('canvas');
        canvas.width = mapCanvas.width;
        canvas.height = mapCanvas.height;

        const context = canvas.getContext('2d');
        context.drawImage(mapCanvas, 0, 0);

        const legend = document.getElementsByClassName(legendContainerClassName);
        if (legend) {
            const promises = Array.from(legend).map((l) => {
                const el = l;
                const prevHeight = el.style.height;
                el.style.height = 'auto';
                const elCanvas = html2canvas(l);
                el.style.height = prevHeight;

                return elCanvas;
            });

            Promise.all(promises).then((canvases) => {
                let y = 6;

                canvases.forEach((c) => {
                    const x = mapCanvas.width - 6 - c.width;
                    context.shadowBlur = 1;
                    context.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    context.drawImage(c, x, y);

                    y += c.height + 6;
                });

                canvas.toBlob((blob) => {
                    const link = document.createElement('a');
                    link.download = 'map-export.png';
                    link.href = URL.createObjectURL(blob);
                    link.click();
                    this.setState({ pending: false });
                }, 'image/png');
            });
        } else {
            canvas.toBlob((blob) => {
                const link = document.createElement('a');
                link.download = 'map-export.png';
                link.href = URL.createObjectURL(blob);
                link.click();
                this.setState({ pending: false });
            }, 'image/png');
        }
    }

    render() {
        const {
            legendContainerClassName, // capturing the prop
            setDestroyer,
            zoomLevel,
            mapContainerRef,
            mapStyle, // capturing the prop
            ...otherProps
        } = this.props;
        const {
            pending,
        } = this.state;

        return (
            <Button
                pending={pending}
                onClick={this.export}
                {...otherProps}
            />
        );
    }
}

export default MapChild(MapDownload);
