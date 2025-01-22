/**
 * Adapted from https://dev.to/tadasgo/block-user-navigation-with-react-router-v6-417f
 */
import type { History } from "history";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

export type NavBlockerControl = {
  confirm: () => void;
  cancel: () => void;
};

export type NavBlocker = (control: NavBlockerControl) => void;

export function useNavBlocker(onBlock: NavBlocker, when: boolean = true): () => void {
  const { block } = useContext(UNSAFE_NavigationContext).navigator as History;

  // Latest ref pattern
  // Latest version of the function stored to the onBlockRef
  const onBlockRef = useRef(onBlock);
  useLayoutEffect(() => {
    onBlockRef.current = onBlock;
  });

  // A ref to the unblock function so we can pass it out of the hook
  // If we're not blocking this should be a no-op function so the consumer doesn't have to type narrow
  const unblockRef = useRef(() => {});

  // This counter is used to force a re-render whenever the unblock function is called from outside the hook.
  // In the case that unblock is called but the blocking condition doesn't change, the hook wouldn't rerun without this.
  // This is an edge-case. In most circumstances unblock should be called immediately before navigating away.
  const [counter, setCounter] = useState<number>(0);

  useEffect(() => {
    if (!when) {
      unblockRef.current = () => {};
      return;
    }

    let blockerIsActive = false;

    const unblock = block((blocker) => {
      // If the user tries to navigate again while the blocker is active, just let them. This lets the user override
      // the blocker by pressing the back/forward buttons again, which is friendly.
      if (blockerIsActive) {
        unblock();
        return blocker.retry();
      }

      blockerIsActive = true;

      onBlockRef.current({
        confirm: blocker.retry,
        cancel: () => {
          blockerIsActive = false;
        },
      });
    });

    unblockRef.current = () => {
      unblock();
      setCounter((c) => c + 1);
    };

    return unblock;
  }, [block, when, counter]);

  return unblockRef.current;
}
