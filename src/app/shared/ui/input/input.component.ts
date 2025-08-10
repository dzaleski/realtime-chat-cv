import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  forwardRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  FormControl,
  FormControlDirective,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputType } from './interfaces/input-type';
import { ErrorMessagePipe } from './pipes/get-error-message.pipe';

@Component({
  standalone: true,
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  imports: [ReactiveFormsModule, ErrorMessagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor, OnInit {
  controlContainer = inject(ControlContainer);

  formControlName = input.required<string>();
  type = input.required<InputType>();
  placeholder = input<string>('');
  label = input<string>('');

  formControl!: FormControl;

  formControlDirective =
    viewChild.required<FormControlDirective>(FormControlDirective);

  ngOnInit(): void {
    this.formControl = this.controlContainer.control?.get(
      this.formControlName()
    ) as FormControl;
  }

  writeValue(value: string): void {
    this.formControlDirective().valueAccessor?.writeValue(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.formControlDirective().valueAccessor?.registerOnChange(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.formControlDirective().valueAccessor?.registerOnTouched(fn);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.formControlDirective().valueAccessor?.setDisabledState?.(isDisabled);
  }
}
