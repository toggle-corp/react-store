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
    onInject: PropTypes.func,
    src: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    evalScripts: undefined,
    fallback: undefined,
    onInject: undefined,
    src: undefined,
};

export default class ScalableVectorGraphics extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    // eslint-disable-next-line react/sort-comp
    injectSVG = memoize((svg, src, evalScripts, onInject) => {
        if (!svg) {
            return;
        }

        const options = {
            evalScripts,
        };

        SVGInjector(svg, options, onInject);
    })

    constructor(props) {
        super(props);

        this.id = randomString(16);
    }

    componentDidMount() {
        const {
            src,
            evalScripts,
            onInject,
        } = this.props;

        const svg = document.getElementById(this.id);
        if (svg) {
            this.injectSVG(svg, src, evalScripts, onInject);
        }
    }

    componentDidUpdate() {
        const {
            evalScripts,
            onInject,
            src,
        } = this.props;

        const svg = document.getElementById(this.id);
        if (svg) {
            svg.setAttribute('data-src', src);
            this.injectSVG(svg, src, evalScripts, onInject);
        }
    }

    componentWillUnmount() {
        const svg = document.getElementById(this.id);
        if (svg) {
            svg.remove();
        }
    }

    render() {
        const {
            className,
            src,
            fallback,
            evalScripts, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            onInject, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            ...otherProps
        } = this.props;

        return (
            <svg
                id={this.id}
                className={className}
                data-src={src}
                data-fallback={fallback}
                {...otherProps}
            />
        );
    }
}
