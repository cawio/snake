import { Component } from '@angular/core';
import { SnakeComponent } from './snake/snake.component';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-root',
  imports: [SnakeComponent, MenubarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Multiplayer Snake';
}
