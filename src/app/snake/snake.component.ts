import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { WebSocketService } from './web-socket.service';

interface Cell {
  x: number;
  y: number;
}

interface PlayerState {
  players: { socketId: string; snake: Cell[]; score: number }[];
  food: Cell;
}

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [],
  templateUrl: './snake.component.html',
  styleUrl: './snake.component.scss',
})
export class SnakeComponent implements OnInit {
  private webSocketService = inject(WebSocketService);

  gridSize = 20;
  grid = signal<Cell[][]>([]);
  gameSessionState = signal<PlayerState>({ players: [], food: { x: 0, y: 0 } });
  players = computed(() => this.gameSessionState().players);
  playersOrderedByScore = computed(() =>
    this.players().sort((a, b) => b.score - a.score)
  );
  food = computed(() => this.gameSessionState().food);
  score = computed(
    () => this.players().find((p) => p.socketId === this.socketId)?.score || 0
  );
  socketId = '';

  ngOnInit(): void {
    this.initGrid();
    this.connectToGame();
  }

  initGrid(): void {
    this.grid.set(
      Array.from({ length: this.gridSize }, (_, x) =>
        Array.from({ length: this.gridSize }, (_, y) => ({ x, y }))
      )
    );
  }

  connectToGame(): void {
    this.socketId = this.generateRandomId();
    this.webSocketService.connect(
      'ws://localhost:3000?clientId=' + this.socketId
    );

    this.webSocketService.messages$.subscribe((data: PlayerState) => {
      this.gameSessionState.set(data);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    const directionMap: { [key: string]: string } = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };

    const direction = directionMap[event.key];
    if (direction) {
      this.webSocketService.sendMessage({ type: 'direction', direction });
    }
  }

  isSnake(cell: Cell): boolean {
    return this.players()
      .map((p) => p.snake)
      .flat()
      .some((c) => c.x === cell.x && c.y === cell.y);
  }

  isFood(cell: Cell): boolean {
    return this.food().x === cell.x && this.food().y === cell.y;
  }

  isMySnake(cell: Cell): boolean {
    return this.players().some(
      (p) =>
        p.socketId === this.socketId &&
        p.snake.some((c) => c.x === cell.x && c.y === cell.y)
    );
  }

  generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
