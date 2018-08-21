export default class FormElementApi {
    setProps = (props) => {
        this.props = { ...props };
    }

    shouldInject = ({ faramElement, faramIdentifier, faramInfo }) => (
        faramElement || faramIdentifier || faramInfo
    )

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

