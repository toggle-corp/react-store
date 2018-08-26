export default class FormElementApi {
    setProps = (props) => {
        this.props = { ...props };
    }

    // eslint-disable-next-line class-methods-use-this
    getHandler() {
        return {};
    }

    getCalculatedProps = (elementType, props) => {
        const { getPropsFromApi, calculateElementProps } = this.handlers[elementType] || {};
        if (!getPropsFromApi || !calculateElementProps) {
            // console.error(`FormElement: Handler not registered for: ${elementType}`);
            return { otherProps: props };
        }

        const { apiProps, otherProps } = getPropsFromApi(props);
        // apiProps should be undefined when apiProps cannot be calculated
        // by getPropsFromApi method, but it still strips known keys from input props
        if (!apiProps) {
            return { otherProps };
        }

        const injectedProps = calculateElementProps(apiProps);
        return {
            injectedProps,
            otherProps,
        };
    }
}

