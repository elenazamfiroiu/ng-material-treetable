import { Injectable } from '@angular/core';
import { TreeService } from '../tree/tree.service';
import { Node, SearchableNode, TreeTableNode } from '../../models';
import { cloneDeep } from 'lodash-es';
const uuidv4 = require('uuid/v4');

@Injectable({
  providedIn: 'root'
})
export class ConverterService {

  constructor(private treeService: TreeService) { }

  /**
   * Clone a Node<T> object and convert it to a SearchableNode<T>
   * @param tree the node to be converted
   */
  toSearchableTree<T extends { id?: string }>(tree: Node<any>): SearchableNode<T> {
    const treeClone = cloneDeep(tree) as SearchableNode<T>;
    this.treeService.traverse(treeClone, (node: SearchableNode<T>) => {
      node.id =  'id' in node.value ? node.value.id : node.id ? node.id : uuidv4();
    });
    return treeClone;
  }

  /**
   * Clone a SearchableNode<T> object and convert it to a TreeTableNode<T>
   * @param tree the node to be converted
   * @param isExpandedDefault collapse all children to depth 0 or not
   * @param expandedNodes is a set with previous expanded nodes.
   */
  toTreeTableTree<T>(tree: SearchableNode<T>, isExpandedDefault: boolean, expandedNodes: Set<string>): TreeTableNode<T> {
    const treeClone = cloneDeep(tree) as TreeTableNode<T>;
    this.treeService.traverse(treeClone, (node: TreeTableNode<T>) => {
      const isExpanded = expandedNodes.size === 0 ? isExpandedDefault : expandedNodes.has(node.id);
      node.depth = this.treeService.getNodeDepth(treeClone, node);
      node.isExpanded = isExpanded;
      node.isVisible = isExpanded ? true : node.depth === 0;
    });
    return treeClone;
  }

}
