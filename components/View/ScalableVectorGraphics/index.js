import React from 'react';
import PropTypes from 'prop-types';
import SVGInjector from 'svg-injector';
import memoize from 'memoize-one';

const propTypes = {
    className: PropTypes.string,
    evalScripts: PropTypes.oneOf([
        'always',
        'once',
        'never',
        false,
    ]),
    fallback: PropTypes.string,
    onEnject: PropTypes.func,
    src: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    evalScripts: undefined,
    fallback: undefined,
    onEnject: undefined,
    src: undefined,
};

export default class ScalableVectorGraphics extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.svgRef = React.createRef();
    }

    componentDidMount() {
        const {
            evalScripts,
            onEnject,
        } = this.props;

        const { current: svg } = this.svgRef;
        this.injectSVG(svg, evalScripts, onEnject);
    }

    componentDidUpdate() {
        const {
            evalScripts,
            onEnject,
        } = this.props;

        const { current: svg } = this.svgRef;
        this.injectSVG(svg, evalScripts, onEnject);
    }

    injectSVG = memoize((svg, evalScripts, onEnject) => {
        if (!svg) {
            return;
        }

        const options = {
            evalScripts,
        };

        SVGInjector(svg, options, onEnject);
    })

    render() {
        const {
            className,
            src,
            fallback,
        } = this.props;

        return (
            <svg
                ref={this.svgRef}
                className={className}
                data-src={src}
                data-fallback={fallback}
            />
        );
    }
}
