export default class FormElementApi {
    setProps = (props) => {
        this.props = { ...props };
    }

    inspect = (
        elementType,
        { faramElement, faramElementName, faramElementIndex, faramInfo, ...otherProps },
    ) => ({
        inject: faramElement || faramElementName || faramElementIndex || faramInfo,
        apiProps: {
            faramIdentifier: faramElementName || faramElementIndex,
            elementType,
            faramInfo,
        },
        otherProps,
    })

    // NOTE: get handler function from elementType dynamically
    getCalculatedProps = ({ faramIdentifier, elementType, faramInfo }) => {
        const getPropsForType = this[`${elementType}Handler`];
        if (getPropsForType) {
            return getPropsForType({
                elementType,
                faramIdentifier,
                faramInfo,
            });
        }
        console.error(`FormElement: Handler not registered for: ${elementType}`);
        return undefined;
    }
}

