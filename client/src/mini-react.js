const state = {
  hooks: [],
  hookIndex: 0,
  deps: [],
  cleanups: [],
  pendingEffects: [],
  rootElement: null,
  rootContainer: null,
};

function resetHooks() {
  state.hookIndex = 0;
  state.pendingEffects = [];
}

function createElement(type, props, ...children) {
  const flatChildren = [];
  children.forEach((child) => {
    if (Array.isArray(child)) {
      flatChildren.push(...child);
    } else {
      flatChildren.push(child);
    }
  });

  return {
    type,
    props: props || {},
    children: flatChildren,
  };
}

function createDom(node) {
  if (node == null || node === false) {
    return document.createComment('empty');
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(String(node));
  }

  if (typeof node.type === 'function') {
    const props = { ...(node.props || {}), children: node.children };
    return createDom(node.type(props));
  }

  const element = document.createElement(node.type);
  const props = node.props || {};

  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') {
      element.setAttribute('class', value);
      return;
    }

    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
      return;
    }

    if (key === 'value') {
      element.value = value;
      return;
    }

    if (key === 'checked') {
      element.checked = Boolean(value);
      return;
    }

    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
      return;
    }

    if (value === false || value == null) {
      return;
    }

    element.setAttribute(key, value);
  });

  node.children.forEach((child) => {
    element.appendChild(createDom(child));
  });

  return element;
}

function performRender() {
  if (!state.rootContainer || !state.rootElement) {
    return;
  }

  resetHooks();
  const dom = createDom(state.rootElement);
  state.rootContainer.innerHTML = '';
  state.rootContainer.appendChild(dom);
  flushEffects();
}

function flushEffects() {
  const effects = state.pendingEffects.slice();
  state.pendingEffects = [];

  effects.forEach(({ index, effect }) => {
    const cleanup = effect();
    if (typeof cleanup === 'function') {
      state.cleanups[index] = cleanup;
    } else {
      state.cleanups[index] = undefined;
    }
  });
}

function useState(initialValue) {
  const index = state.hookIndex;
  if (state.hooks[index] === undefined) {
    state.hooks[index] = typeof initialValue === 'function' ? initialValue() : initialValue;
  }
  const setState = (update) => {
    const nextValue = typeof update === 'function' ? update(state.hooks[index]) : update;
    state.hooks[index] = nextValue;
    performRender();
  };
  state.hookIndex += 1;
  return [state.hooks[index], setState];
}

function useEffect(effect, deps) {
  const index = state.hookIndex;
  const previous = state.deps[index];
  const hasChanged =
    !deps ||
    !previous ||
    deps.length !== previous.length ||
    deps.some((dep, i) => dep !== previous[i]);

  if (hasChanged) {
    if (typeof state.cleanups[index] === 'function') {
      state.cleanups[index]();
      state.cleanups[index] = undefined;
    }
    state.pendingEffects.push({ index, effect });
    state.deps[index] = deps;
  }

  state.hookIndex += 1;
}

function createRoot(container) {
  return {
    render(element) {
      state.rootContainer = container;
      state.rootElement = element;
      performRender();
    },
  };
}

const React = {
  createElement,
  useState,
  useEffect,
};

export { createRoot };
export default React;
