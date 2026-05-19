export type SpecialKeys = {
  left: {
    control: boolean;
    alt: boolean;
    shift: boolean;
  };
  right: {
    control: boolean;
    alt: boolean;
    shift: boolean;
  };
  functionKeys: [
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
  ];
  backspace: boolean;
  tab: boolean;
  capsLock: boolean;
  meta: boolean;
  locks: {
    scrollLock: boolean;
    capsLock: boolean;
    numLock: boolean;
  };
  arrows: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
};
