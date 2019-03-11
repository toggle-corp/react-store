import React from 'react';
import PropTypes from 'prop-types';
import SVGInjector from 'svg-injector';
import { randomString } from '@togglecorp/fujs';
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

        this.id = randomString();
    }

    componentDidMount() {
        const {
            src,
            evalScripts,
            onEnject,
        } = this.props;

        const svg = document.getElementById(this.id);
        if (svg) {
            this.injectSVG(svg, src, evalScripts, onEnject);
        }
    }

    componentDidUpdate() {
        const {
            evalScripts,
            onEnject,
            src,
        } = this.props;

        const svg = document.getElementById(this.id);
        if (svg) {
            svg.setAttribute('data-src', src);
            this.injectSVG(svg, src, evalScripts, onEnject);
        }
    }

    componentWillUnmount() {
        const svg = document.getElementById(this.id);
        if (svg) {
            svg.remove();
        }
    }

    injectSVG = memoize((svg, src, evalScripts, onEnject) => {
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
                id={this.id}
                className={className}
                data-src={src}
                data-fallback={fallback}
            />
        );
    }
}
