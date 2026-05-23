import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-page-header',
  imports: [MatIconButton, MatIcon],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeader {
  @Input() title = '';
  @Input() logoutLabel = 'Logout';
  @Output() logoutClick = new EventEmitter<void>();

  onLogout() {
    this.logoutClick.emit();
  }
}
