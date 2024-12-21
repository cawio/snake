import { Component, OnInit } from '@angular/core';
import { SnakeComponent } from './snake/snake.component';
import { MenubarModule } from 'primeng/menubar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  imports: [SnakeComponent, MenubarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Multiplayer Snake';
  isMobile: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile = result.matches;
        console.log('Is mobile:', this.isMobile);
      });
  }
}
