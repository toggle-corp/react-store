export default class FormElementApi {
    setProps = (props) => {
        this.props = { ...props };
    }

    // NOTE: get handler function from elementType dynamically
    getCalculatedProps = ({ faramIdentifier, elementType, faramAction, faramInfo }) => {
        const getPropsForType = this[`${elementType}Handler`];
        if (getPropsForType) {
            return getPropsForType({
                elementType,
                faramIdentifier,
                faramAction,
                faramInfo,
            });
        }
        console.error(`FormElement: Handler not registered for: ${elementType}`);
        return undefined;
    }
}

