import { lazy, useState, type ComponentType } from "react";

export type PreloadableComponent<P extends object> = ComponentType<P> & {
  preload: () => Promise<unknown>;
};

export function lazyWithPreload<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
): PreloadableComponent<P> {
  let loaded: ComponentType<P> | undefined;
  let pending: Promise<{ default: ComponentType<P> }> | undefined;

  const preload = () => {
    pending ??= loader().then(
      (module) => {
        loaded = module.default;
        return module;
      },
      (error: unknown) => {
        pending = undefined;
        throw error;
      },
    );
    return pending;
  };

  const LazyComponent = lazy(preload);

  const Preloadable = (props: P) => {
    const [Component] = useState<ComponentType<P>>(
      () => loaded ?? (LazyComponent as unknown as ComponentType<P>),
    );
    return <Component {...props} />;
  };

  return Object.assign(Preloadable, { preload });
}
