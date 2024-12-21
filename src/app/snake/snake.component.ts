import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { FormsModule } from '@angular/forms';

interface Cell {
  x: number;
  y: number;
}

interface GameState {
  players: {
    id: string;
    state: PlayerState;
    username: string | undefined;
    snake: Cell[];
    score: number;
  }[];
  food: Cell;
}

enum PlayerState {
  ALIVE,
  DEAD,
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type MessageType = 'join' | 'leave' | 'move' | 'state-update';

export type Message<T> = {
  type: MessageType;
  data: T;
};

export type JoinMessageData = {
  username: string;
};

export type MoveMessageData = {
  direction: Direction;
};

export type StateUpdateMessageData = {
  players: Array<PlayerMessageData>;
  food: Cell;
};

export type PlayerMessageData = {
  id: string;
  username: string | undefined;
  state: PlayerState;
  snake: Cell[];
  score: number;
};

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './snake.component.html',
  styleUrl: './snake.component.scss',
})
export class SnakeComponent implements OnInit {
  private webSocketService = inject(WebSocketService);

  username = signal('');
  gridSize = 20;
  grid = signal<Cell[][]>([]);
  gameSessionState = signal<GameState>({ players: [], food: { x: 0, y: 0 } });
  players = computed(() => {
    return this.gameSessionState().players.filter(
      (p) => p.state === PlayerState.ALIVE
    );
  });
  playersOrderedByScore = computed(() =>
    this.players().sort((a, b) => b.score - a.score)
  );
  food = computed(() => this.gameSessionState().food);
  score = computed(
    () => this.players().find((p) => p.id === this.id)?.score || 0
  );
  id = '';
  alive: boolean = true;

  constructor() {
    effect(
      () =>
        (this.alive = this.players().some(
          (p) => p.id === this.id && p.state === PlayerState.ALIVE
        ))
    );
  }

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

  join(): void {
    this.username.set(this.username().trim());
    if (this.username() === '') {
      alert("You can't have an empty username!");
      return;
    }

    const usernameTaken = this.players().some(
      (p) => p.id !== this.id && p.id === this.username()
    );
    if (usernameTaken) {
      alert('Username already taken!');
      return;
    }

    const message: Message<JoinMessageData> = {
      type: 'join',
      data: { username: this.username() },
    };

    this.webSocketService.sendMessage(message);
  }

  leave(): void {
    const message: Message<undefined> = { type: 'leave', data: undefined };
    this.webSocketService.sendMessage(message);
  }

  connectToGame(): void {
    this.id = this.generateRandomId();
    this.webSocketService.connect('ws://localhost:3000?id=' + this.id);

    this.webSocketService.messages$.subscribe((data) => {
      if (data.type === 'state-update') {
        this.gameSessionState.set(data.data as StateUpdateMessageData);
        return;
      }
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
      const message: Message<MoveMessageData> = {
        type: 'move',
        data: { direction: direction as Direction },
      };
      this.webSocketService.sendMessage(message);
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
        p.id === this.id &&
        p.snake.some((c) => c.x === cell.x && c.y === cell.y)
    );
  }

  generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
