import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { TreetableComponent } from './component/treetable.component';
import { MatButtonModule } from '@angular/material/button';
export { Node, Options } from './models';
export { TreeService } from './services/tree/tree.service';
export { TreetableComponent } from './component/treetable.component';

@NgModule({
  declarations: [
    TreetableComponent
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [
    TreetableComponent
  ]
})
export class TreetableModule { }
