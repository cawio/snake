import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SnakeComponent } from './snake/snake.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SnakeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'snake';
}
