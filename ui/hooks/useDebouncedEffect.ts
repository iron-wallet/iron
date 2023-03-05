import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";

export function useDebouncedEffect(
  callback: any,
  dependency: any,
  timeout = 300,
  options = { trailing: true, leading: false }
) {
  const { leading, trailing } = options;
  // the source of truth will be _dependencyRef.current  always
  const [_dependency, _setdependency] = useState(dependency);

  // making use of second approach here we discussed above
  const makeChangeTodependency = useCallback(
    debounce(
      (dependency) => {
        _setdependency(dependency);
      },
      timeout,
      { trailing, leading }
    ),
    [trailing, leading, timeout]
  );

  useEffect(() => {
    if (dependency) {
      makeChangeTodependency(dependency);
    }
  }, dependency);

  useEffect(callback, _dependency);
}
