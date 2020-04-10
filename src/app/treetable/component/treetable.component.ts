import {Component, OnInit, Input, Output, ElementRef, OnChanges, SimpleChanges} from '@angular/core';
import {Node, TreeTableNode, Options, SearchableNode, TreeTableCustomHeader, TreeTableAction, EmittedActionTree} from '../models';
import { TreeService } from '../services/tree/tree.service';
import { MatTableDataSource } from '@angular/material';
import { ValidatorService } from '../services/validator/validator.service';
import { ConverterService } from '../services/converter/converter.service';
import { defaultOptions } from '../default.options';
import { flatMap, defaults } from 'lodash-es';
import { Required } from '../decorators/required.decorator';
import { Subject } from 'rxjs';

@Component({
  selector: 'ng-treetable, treetable', // 'ng-treetable' is currently being deprecated
  templateUrl: './treetable.component.html',
  styleUrls: ['./treetable.component.scss']
})
export class TreetableComponent<T> implements OnInit, OnChanges {
  get treeTable(): TreeTableNode<T>[] {
    return this._treeTable;
  }
  @Input() @Required tree: Node<T> | Node<T>[];
  @Input() customHeader: TreeTableCustomHeader[];
  @Input() actions: TreeTableAction[];
  @Input() options: Options<T> = {};
  @Output() nodeClicked: Subject<TreeTableNode<T>> = new Subject();
  @Output() actionClicked: Subject<EmittedActionTree<T>> = new Subject();
  @Output() treeLabelClicked: Subject<TreeTableNode<T>> = new Subject();
  private searchableTree: SearchableNode<T>[];
  private _treeTable: TreeTableNode<T>[];
  displayedColumns: string[];
  extendedDisplayedColumns: string[];
  dataSource: MatTableDataSource<TreeTableNode<T>>;

  constructor(
    private treeService: TreeService,
    private validatorService: ValidatorService,
    private converterService: ConverterService,
    elem: ElementRef
  ) {
    const tagName = elem.nativeElement.tagName.toLowerCase();
    if (tagName === 'ng-treetable') {
      console.warn(`DEPRECATION WARNING: \n The 'ng-treetable' selector is being deprecated. Please use the new 'treetable' selector`);
    }
  }

  ngOnInit() {
    this.tree = Array.isArray(this.tree) ? this.tree : [this.tree];
    this.options = this.parseOptions(defaultOptions);
    const customOrderValidator = this.validatorService.validateCustomOrder(this.tree[0], this.options.customColumnOrder);
    if (this.options.customColumnOrder && !customOrderValidator.valid) {
      throw new Error(`
        Properties ${customOrderValidator.xor.map(x => `'${x}'`).join(', ')} incorrect or missing in customColumnOrder`
      );
    }
    this.displayedColumns = this.customHeader
      ? this.customHeader.map(c => c.keyValue)
      : this.options.customColumnOrder
      ? this.options.customColumnOrder
      : this.extractNodeProps(this.tree[0]);
    this.extendedDisplayedColumns = this.actions ? [...this.displayedColumns, 'actions'] : this.displayedColumns;
    this.createDataSource(this.tree);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tree && changes.tree.currentValue && !changes.tree.firstChange) {
      this.createDataSource(changes.tree.currentValue);
    }
  }

  createDataSource(tree: Node<T>[]) {
    this.searchableTree = tree.map(t => this.converterService.toSearchableTree(t));
    const treeTableTree = this.searchableTree.map(st => this.converterService.toTreeTableTree(st, this.options.defaultCollapsible));
    this._treeTable = flatMap(treeTableTree, this.treeService.flatten);
    this.dataSource = this.generateDataSource();
  }

  extractColumnLabel(prop: string): string {
    return this.customHeader ? this.customHeader.find(c => c.keyValue === prop).label : '';
  }

  extractNodeProps(tree: Node<T> & { value: { [k: string]: any } }): string[] {
    return Object.keys(tree.value).filter(x => typeof tree.value[x] !== 'object');
  }

  generateDataSource(): MatTableDataSource<TreeTableNode<T>> {
    return new MatTableDataSource(this._treeTable.filter(x => x.isVisible));
  }

  formatIndentation(node: TreeTableNode<T>, step: number = 5): string {
    return '&nbsp;'.repeat(node.depth * step);
  }

	formatElevation(): string {
		return `mat-elevation-z${this.options.elevation}`;
	}

	checkVisibilityForAction(action: TreeTableAction, node: TreeTableNode<T>): boolean {
    // If the action has no hidden property, show the action.
    if (!action.hasOwnProperty('hideForChild') && !action.hasOwnProperty('hideForGroups')) {
      return true;
    }
    // Show the action based on the hide property.
    return (action.hideForChild && node.children.length > 0) || (action.hideForGroups && node.children.length === 0);
  }

  onNodeClick(clickedNode: TreeTableNode<T>): void {
    clickedNode.isExpanded = !clickedNode.isExpanded;
    this._treeTable.forEach(el => {
      el.isVisible = this.searchableTree.every(st => {
        return this.treeService.searchById(st, el.id).
          fold([], n => n.pathToRoot)
          .every(p => this._treeTable.find(x => x.id === p.id).isExpanded);
      });
    });
    this.dataSource = this.generateDataSource();
    this.nodeClicked.next(clickedNode);
  }

  // Overrides default options with those specified by the user
  parseOptions(defaultOpts: Options<T>): Options<T> {
    return defaults(this.options, defaultOpts);
  }

  onActionClicked(action: EmittedActionTree<T>) {
    this.actionClicked.next(action);
  }

  onTreeLabelClick(clickedNode: TreeTableNode<T>) {
    this.treeLabelClicked.next(clickedNode);
  }

}
