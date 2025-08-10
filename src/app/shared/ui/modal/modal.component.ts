import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  effect,
  input,
  output,
} from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-modal',
  styles: `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 0.3s ease,
        visibility 0.3s ease;
    }

    .modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
      position: relative;
    }
  `,
  template: `
    <div
      class="modal-overlay"
      [class.open]="isOpen()"
      (click)="onBackdropClick()"
    >
      <div class="modal-content" (click)="$event.stopPropagation()">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  public isOpen = input.required<boolean>();
  public close = output<void>();

  constructor() {
    effect(() => {
      const isOpen = this.isOpen();
      if (isOpen) {
        this.openModal();
      } else {
        this.closeModal();
      }
    });
  }

  @HostListener('document:keydown', ['$event.key'])
  public handleKeydown(key: string) {
    if (key === 'Escape') {
      this.closeModal();
    }
  }

  public onBackdropClick() {
    this.closeModal();
  }

  private openModal(): void {
    // Prevents background scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  private closeModal(): void {
    // Restores background scrolling
    document.body.style.overflow = 'auto';
    this.close.emit();
  }
}
