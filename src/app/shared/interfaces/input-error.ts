export type ErrorMessageFormatter = (info: { [key: string]: any }) => string;

export interface FormErrorMessages {
  [key: string]: ErrorMessageFormatter;
}
