import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: WebSocket;
  private incomingMessages = new Subject<any>();

  // Observable for incoming messages
  public messages$ = this.incomingMessages.asObservable();

  // Connect to the WebSocket server
  connect(url: string): void {
    this.socket = new WebSocket(url);

    // Handle incoming messages
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.incomingMessages.next(data);
    };

    // Handle connection errors
    this.socket.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    // Reconnect on close (optional)
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      // Optionally, you can reconnect:
      setTimeout(() => this.connect(url), 1000);
    };
  }

  // Send a message to the WebSocket server
  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket connection is not open.');
    }
  }
}
