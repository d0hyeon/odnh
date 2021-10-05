import { useCallback, useState, useMemo, useRef, useLayoutEffect, MutableRefObject } from 'react';

type Selector<T> = (event: KeyboardEvent) => T;
type Target<T> = HTMLElement | MutableRefObject<T>;
export type UseKeyPress<S = string, T = HTMLBodyElement> = (
  selector?: Selector<S>, 
  target?: Target<T>
) => S[];

const defaultSelector = (event: KeyboardEvent) => event.code;

function useKeyPress<S = string, T = Element>(
  selector?: Selector<S>,
  target?: Target<T>,
): S[] {
  const [keyCodes, setKeyCodes] = useState([]);
  const handleKeyboardEvent = useMemo(() => selector ?? defaultSelector, [selector]);
  const ticksRef: MutableRefObject<{[key: string]: Boolean}> = useRef({})

  const onKeyDown = useCallback(
    (event) => {
      const value = handleKeyboardEvent(event);
      if(!ticksRef.current[value.toString()]) {
        ticksRef.current[value.toString()] = true;
        setKeyCodes(prev => ([
          ...prev,
          value
        ]))
      }
    },
    [handleKeyboardEvent, ticksRef],
  );

  const onKeyUp = useCallback(
    (event) => {
      const value = handleKeyboardEvent(event);
      delete ticksRef.current[value.toString()];
      setKeyCodes(prev => prev.filter(code => code !== value));
    },
    [handleKeyboardEvent, ticksRef],
  );

  useLayoutEffect(() => {
    const element = target
      ? 'current' in target
        ? target.current
        : target
      : document.body;

    (element as HTMLElement).addEventListener('keydown', onKeyDown);
    (element as HTMLElement).addEventListener('keyup', onKeyUp);

    return () => {
      (element as HTMLElement).removeEventListener('keydown', onKeyDown);
      (element as HTMLElement).removeEventListener('keyup', onKeyUp);
    };
  }, [target]);

  return keyCodes;
};

export default useKeyPress;