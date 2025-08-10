import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-search-header',
  styleUrl: './search-input.component.scss',
  template: `
    <div class="search-bar">
      <input
        [formControl]="searchControl()"
        type="text"
        placeholder="🔍 Search chats..."
      />
    </div>
  `,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchHeaderComponent {
  searchControl = input.required<FormControl>();
}
