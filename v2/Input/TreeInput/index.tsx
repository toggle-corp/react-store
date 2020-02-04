import React, {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { _cs, isNotDefined, Obj } from '@togglecorp/fujs';

import { OptionKey } from '../../types';

import Button from '../../Action/Button';
import List from '../../View/List';
import Checkbox from '../Checkbox';
import HintAndError from '../HintAndError';
import Label from '../Label';
import { generateExtendedRelations, ExtendedRelation } from './utils';

import styles from './styles.scss';

interface TreeNodeProps<T, K extends OptionKey> {
    className?: string;
    keySelector: (datum: T) => K;
    parentKeySelector: (datum: T) => K | undefined;
    labelSelector: (datum: T) => string | number;
    onChange: (keys: K[]) => void;
    value: K[];
    nodeKey: K;
    nodeLabel: string | number;

    disabled: boolean;
    readOnly: boolean;
    defaultCollapseLevel: number;
    level: number;

    relations: Obj<ExtendedRelation<T, K> | undefined>;
}

function TreeNode<T, K extends OptionKey>(props: TreeNodeProps<T, K>) {
    const {
        className,
        disabled,
        readOnly,
        nodeKey,
        nodeLabel,

        value,
        labelSelector,
        parentKeySelector,
        keySelector,
        level,
        defaultCollapseLevel,
        onChange,
        relations,
    } = props;

    const [collapsed, setCollapsed] = useState(level >= defaultCollapseLevel);

    const relation = relations[nodeKey];
    const allOwnOptions = relation ? relation.children : undefined;

    const ownOptions = useMemo(
        () => allOwnOptions && allOwnOptions.filter(
            option => parentKeySelector(option) === nodeKey,
        ),
        [allOwnOptions, parentKeySelector, nodeKey],
    );

    const isLeaf = ownOptions && ownOptions.length <= 0;

    const someSelected = useMemo(
        () => ownOptions && ownOptions.some((option) => {
            const key = keySelector(option);
            // FIXME: create a mapping to optimize check
            const selected = value.includes(key);
            return selected;
        }),
        [value, keySelector, ownOptions],
    );

    // FIXME: create a mapping to optimize check
    const checked = value.includes(nodeKey);

    const handleCollapseOption = useCallback(
        () => {
            setCollapsed(true);
        },
        [],
    );
    const handleToggleCollapseOption = useCallback(
        () => {
            setCollapsed(v => !v);
        },
        [],
    );
    const handleCheckboxChange = useCallback(
        (val: boolean) => {
            const oldKeys = new Set(value);
            if (val) {
                // NOTE: Add current node
                oldKeys.add(nodeKey);
                if (allOwnOptions) {
                    // NOTE: Add all children nodes
                    allOwnOptions.forEach((option) => {
                        oldKeys.add(keySelector(option));
                    });
                }
            } else {
                // NOTE: Remove current node
                oldKeys.delete(nodeKey);
                // NOTE: Remove all children nodes
                if (allOwnOptions) {
                    allOwnOptions.forEach((option) => {
                        oldKeys.delete(keySelector(option));
                    });
                }
            }
            onChange([...oldKeys]);
        },
        [onChange, value, nodeKey, keySelector, allOwnOptions],
    );

    const handleTreeNodeChange = useCallback(
        (newKeys: K[]) => {
            // if all child keys are selected, then select current as well
            const allChildSelected = ownOptions && ownOptions.every((item) => {
                const itemKey = keySelector(item);
                // FIXME: create a mapping to optimize check
                const selected = newKeys.includes(itemKey);
                return selected;
            });

            if (allChildSelected) {
                onChange([...newKeys, nodeKey]);
            // FIXME: create a mapping to optimize check
            } else if (newKeys.includes(nodeKey)) {
                // if not all child selected && current key is there
                const filteredKeys = newKeys.filter(key => key !== nodeKey);
                onChange(filteredKeys);
            } else {
                onChange(newKeys);
            }
        },
        [onChange, keySelector, ownOptions, nodeKey],
    );

    return (
        <div className={_cs(styles.treeNode, className, collapsed && styles.collapsed)}>
            <div className={styles.left}>
                <Button
                    className={styles.expandButton}
                    disabled={isLeaf}
                    onClick={handleToggleCollapseOption}
                    transparent
                    iconName="arrowDropright"
                />
                {!collapsed && !isLeaf && (
                    <div
                        className={styles.stem}
                        role="presentation"
                        onClick={handleCollapseOption}
                    >
                        <div className={styles.line} />
                    </div>
                )}
            </div>
            <div className={styles.right}>
                <Checkbox
                    className={styles.checkbox}
                    labelClassName={styles.label}
                    checkIconClassName={styles.checkIcon}
                    value={checked}
                    label={nodeLabel}
                    disabled={disabled}
                    readOnly={readOnly}
                    onChange={handleCheckboxChange}
                    indeterminate={someSelected}
                />
                { !isLeaf && (
                    <TreeNodeList
                        relations={relations}
                        className={styles.nodeList}
                        visibleOptions={ownOptions}
                        keySelector={keySelector}
                        disabled={disabled}
                        readOnly={readOnly}
                        labelSelector={labelSelector}
                        parentKeySelector={parentKeySelector}
                        value={value}
                        defaultCollapseLevel={defaultCollapseLevel}
                        level={level + 1}
                        onChange={handleTreeNodeChange}
                    />
                )}
            </div>
        </div>
    );
}

interface TreeNodeListProps<T, K extends OptionKey> {
    className?: string;
    keySelector: (datum: T) => K;
    parentKeySelector: (datum: T) => K | undefined;
    labelSelector: (datum: T) => string | number;

    onChange: (keys: K[]) => void;
    value: K[];

    visibleOptions: T[];

    disabled: boolean;
    readOnly: boolean;

    defaultCollapseLevel: number;
    level: number;

    relations: Obj<ExtendedRelation<T, K> | undefined>;
}
function TreeNodeList<T, K extends OptionKey>(props: TreeNodeListProps<T, K>) {
    const {
        className,
        // options,
        keySelector,
        disabled,
        readOnly,
        labelSelector,
        parentKeySelector,
        value,
        onChange,

        // childOptions,
        visibleOptions,

        level,
        defaultCollapseLevel,
        relations,
    } = props;

    const rendererParams = useCallback(
        (key: K, v: T) => ({
            disabled,
            readOnly,

            nodeLabel: labelSelector(v),
            nodeKey: key,

            // For children
            keySelector,
            labelSelector,
            parentKeySelector,
            value,
            defaultCollapseLevel,
            level,
            onChange,
            relations,
        }),
        [
            value, onChange, relations,
            readOnly, disabled,
            defaultCollapseLevel, level,
            keySelector, labelSelector, parentKeySelector,
        ],
    );

    return (
        <div className={_cs(styles.treeNodeList, className)}>
            <List
                keySelector={keySelector}
                data={visibleOptions}
                renderer={TreeNode}
                rendererParams={rendererParams}
            />
        </div>
    );
}
TreeNodeList.defaultProps = {
    visibleOptions: [],
};

export interface TreeProps<T, K extends OptionKey> {
    // autoFocus?: boolean;
    className?: string;
    disabled: boolean;
    error?: string;
    hint?: string;
    keySelector: (datum: T) => K;
    parentKeySelector: (datum: T) => K | undefined;
    label?: string;
    labelClassName?: string;
    labelSelector: (datum: T) => string | number;
    onChange: (keys: K[]) => void;
    options: T[];
    readOnly: boolean;
    showHintAndError: boolean;
    showLabel: boolean;
    title?: string;
    value: K[];

    defaultCollapseLevel: number;

    labelRightComponent?: React.ReactNode;
    labelRightComponentClassName?: string;
}

function TreeInput<T, K extends OptionKey = string>(props: TreeProps<T, K>) {
    const {
        className: classNameFromProps,
        disabled,
        error,
        hint,
        label,
        labelClassName,
        labelRightComponent,
        labelRightComponentClassName,
        showHintAndError,
        showLabel,
        title,
        keySelector,
        parentKeySelector,
        labelSelector,
        onChange,
        options,
        readOnly,
        value,
        defaultCollapseLevel,
    } = props;

    const className = _cs(
        classNameFromProps,
        'tree',
        styles.tree,
        disabled && styles.disabled,
        disabled && 'disabled',
        error && styles.error,
        error && 'error',
    );

    const visibleOptions = useMemo(
        () => options.filter((option) => {
            const parentKey = parentKeySelector(option);
            return isNotDefined(parentKey);
        }),
        [options, parentKeySelector],
    );

    const relations = useMemo(
        () => generateExtendedRelations(
            options,
            keySelector,
            parentKeySelector,
        ),
        [options, keySelector, parentKeySelector],
    );

    return (
        <div
            className={className}
            title={title}
        >
            {showLabel && (
                <Label
                    className={labelClassName}
                    disabled={disabled}
                    error={!!error}
                    title={label}
                    rightComponent={labelRightComponent}
                    rightComponentClassName={labelRightComponentClassName}
                >
                    {label}
                </Label>
            )}
            <TreeNodeList
                className={styles.nodeList}
                defaultCollapseLevel={defaultCollapseLevel}
                level={0}

                readOnly={readOnly}
                disabled={disabled}

                keySelector={keySelector}
                parentKeySelector={parentKeySelector}
                labelSelector={labelSelector}
                value={value}
                relations={relations}

                onChange={onChange}
                visibleOptions={visibleOptions}
            />
            {showHintAndError && (
                <HintAndError
                    error={error}
                    hint={hint}
                />
            )}
        </div>
    );
}
TreeInput.defaultProps = {
    disabled: false,
    readOnly: false,
    showHintAndError: true,
    showLabel: true,
    value: [],
    options: [],
    defaultCollapseLevel: 1,
};

export default TreeInput;
