export declare type ThemePaletteCustom = 'primary' | 'accent' | 'warn' | undefined;

export interface Node<T> {
  value: T;
  children: Node<T>[];
}

export interface SearchableNode<T> extends Node<T> {
  id: string;
  children: SearchableNode<T>[];
}

export interface TreeTableNode<T> extends SearchableNode<T> {
  depth: number;
  isVisible: boolean;
  isExpanded: boolean;
  children: TreeTableNode<T>[];
}

export interface NodeInTree<T> extends SearchableNode<T> {
  pathToRoot: SearchableNode<T>[];
}

export interface Options<T> {
  verticalSeparator?: boolean;
  capitalisedHeader?: boolean;
  highlightRowOnHover?: boolean;
  customColumnOrder?: Array<keyof T> & string[];
	elevation?: number;
  defaultExpanded?: boolean;
}

export interface TreeTableCustomHeader {
  label: string;
  keyValue: string;
  float?: boolean;
}

export interface TreeTableAction {
  actionName: string;
  title: string;
  iconName: string;
  color?: ThemePaletteCustom;
  hideForGroups?: boolean;
  hideForChild?: boolean;
}

export interface EmittedActionTree<T> {
  actionName: string;
  node: TreeTableNode<T>;
}
