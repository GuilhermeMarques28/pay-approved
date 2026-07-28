/// <reference types="react-native" />

declare module '*.css';

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
