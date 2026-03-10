export type Maybe<T> = T | null;

export type MakeMaybe<T> = {
  [P in keyof T]: Maybe<T[P]>;
};

export type MakeUndefined<T> = {
  [P in keyof T]: T[P] | undefined;
};

export type MaybePromise<T> = T | Promise<T>;
