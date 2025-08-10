import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import {
  outputFromObservable,
  outputToObservable,
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchResultUser, UserDetails } from '@app/shared/interfaces/user';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-new-chat-dialog-form',
  styleUrl: './new-chat-dialog-form.component.scss',
  templateUrl: './new-chat-dialog-form.component.html',
  imports: [ReactiveFormsModule, InputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewChatDialogFormComponent {
  fb = inject(FormBuilder);
  parentModal = inject(ModalComponent);

  searchForm = this.fb.group({
    search: new FormControl<string>('', {
      nonNullable: true,
    }),
  });

  people = input.required<SearchResultUser[]>();
  numberOfPages = input.required<number>();
  currentPage = input.required<number>();

  invite = output<UserDetails>();
  close = output<void>();
  nextPage = output<void>();
  previousPage = output<void>();
  search = outputFromObservable(
    this.searchForm.controls.search.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    )
  );

  constructor() {
    outputToObservable(this.parentModal.close)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.close.emit());
  }

  onSentInvitation(person: SearchResultUser) {
    if (person.inviteStatus) {
      return;
    }

    const { inviteStatus, ...userDetails } = person;
    this.invite.emit(userDetails);
  }

  onNextPage(): void {
    if (this.currentPage() == this.numberOfPages()) {
      return;
    }

    this.nextPage.emit();
  }

  onPreviousPage(): void {
    if (this.currentPage() == 1) {
      return;
    }

    this.previousPage.emit();
  }
}
