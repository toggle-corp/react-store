import React from 'react';
import PropTypes from 'prop-types';
// import html2canvas from 'html2canvas';

import Button from '../../../Action/Button';
import MapChild from '../MapChild';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    map: PropTypes.object.isRequired,
};

const defaultProps = {
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
        const { map } = this.props;
        if (!map) {
            console.warn('Cannot export as there is no map');
            return;
        }

        this.setState({ pending: true });

        const canvas = map.getCanvas();

        /*
        const legends = this.leftBottomPanels.current.querySelectorAll('.legend, .scale-legend');
        query selector does not return a list and hence the array spreader used below.
        const promises = Array.from(legends).map(l => html2canvas(l));

        Promise.all(promises).then((canvases) => {
            const canvas3 = document.createElement('canvas');
            canvas3.width = canvas1.width;
            canvas3.height = canvas1.height;

            const context = canvas3.getContext('2d');
            context.drawImage(canvas1, 0, 0);

            let x = 6;
            canvases.forEach((canvas2) => {
                const y = canvas1.height - canvas2.height - 6;
                context.shadowBlur = 4;
                context.shadowColor = "black";
                context.drawImage(canvas2, x, y);
                x += canvas2.width + 6;
            });

            canvas3.toBlob((blob) => {
                const link = document.createElement('a');
                link.download = 'map-export.png';
                link.href = URL.createObjectURL(blob);
                link.click();
            }, 'image/png');
        });
        */

        canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = 'map-export.png';
            link.href = URL.createObjectURL(blob);
            link.click();
            this.setState({ pending: false });
        }, 'image/png');
    }

    render() {
        const {
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
