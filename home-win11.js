(() => {
  const desktop = document.querySelector('[data-win-desktop]');
  if (!desktop) return;

  const searchHome = desktop.querySelector('[data-search-home]');
  const searchForm = desktop.querySelector('[data-search-form]');
  const searchInput = desktop.querySelector('[data-search-input]');
  const searchStatus = desktop.querySelector('[data-search-status]');
  const exampleButton = desktop.querySelector('[data-search-example]');
  const startButton = desktop.querySelector('[data-start-button]');
  const startMenu = desktop.querySelector('[data-start-menu]');
  const windows = [...desktop.querySelectorAll('[data-window]')];
  const desktopLayout = window.matchMedia('(max-width: 1180px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let statusTimer;
  let currentDemoName = 'clipboard';

  const searches = {
    windows: {
      query: 'How can I tile my workspace with AutoHotkey?',
      ready: 'Window control query ready.'
    },
    text: {
      query: 'How do I create text shortcuts with AutoHotkey?',
      ready: 'Text expansion query ready.'
    },
    clipboard: {
      query: 'How can I clean clipboard text with AutoHotkey?',
      ready: 'Clipboard workflow query ready.'
    },
    files: {
      query: 'How can I organize Downloads with AutoHotkey?',
      ready: 'File automation query ready.'
    },
    gui: {
      query: 'How do I build a Windows app with AutoHotkey?',
      ready: 'Desktop app query ready.'
    }
  };
  const searchOrder = ['clipboard', 'windows', 'text', 'files', 'gui'];

  // Dragging writes inline geometry so the window can follow the pointer. Those
  // values outrank responsive CSS, so discard them when crossing into the
  // tablet/mobile layout or the desktop position can leave the app clipped.
  function resetDraggedWindows(event) {
    if (!event.matches) return;
    windows.forEach((windowElement) => {
      ['left', 'top', 'right', 'bottom', 'width', 'height', 'transform', 'will-change']
        .forEach((property) => windowElement.style.removeProperty(property));
    });
  }

  desktopLayout.addEventListener('change', resetDraggedWindows);

  function setSearchStatus(message, restoreAfter = 0) {
    clearTimeout(statusTimer);
    searchStatus.textContent = message;
    if (!restoreAfter) return;
    statusTimer = setTimeout(() => {
      searchStatus.textContent = searches[currentDemoName].ready;
    }, restoreAfter);
  }

  function selectDemo(name, animate = true) {
    const search = searches[name];
    if (!search) return;
    currentDemoName = name;
    searchInput.value = search.query;
    document.querySelectorAll('[data-ahk-feature]').forEach((button) => {
      const active = button.dataset.ahkFeature === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    setSearchStatus(search.ready);
    if (!animate || reduceMotion.matches) return;
    searchHome.classList.remove('is-updating');
    void searchHome.offsetWidth;
    searchHome.classList.add('is-updating');
    setTimeout(() => searchHome.classList.remove('is-updating'), 260);
  }

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
      setSearchStatus('Enter an AutoHotkey question first.');
      searchInput.focus();
      return;
    }
    setSearchStatus(`Searching locally for “${query}”…`);
    statusTimer = setTimeout(() => {
      searchStatus.textContent = 'That workflow can be built with AutoHotkey v2.1.';
    }, reduceMotion.matches ? 0 : 620);
  });

  exampleButton.addEventListener('click', () => {
    const currentIndex = searchOrder.indexOf(currentDemoName);
    const nextName = searchOrder[(currentIndex + 1) % searchOrder.length];
    selectDemo(nextName);
    setSearchStatus('Example query loaded. Press Search AutoHotkey to continue.');
    searchInput.focus();
  });

  function focusWindow(windowElement) {
    if (!windowElement) return;
    windows.forEach((item) => item.classList.toggle('is-focused', item === windowElement));
  }

  function openWindow(name) {
    const windowElement = desktop.querySelector(`[data-window="${name}"]`);
    if (!windowElement) return;
    windowElement.classList.remove('is-hidden');
    windowElement.setAttribute('aria-hidden', 'false');
    focusWindow(windowElement);
  }

  function toggleStart(force) {
    const shouldOpen = typeof force === 'boolean' ? force : startMenu.hidden;
    startMenu.hidden = !shouldOpen;
    startButton.setAttribute('aria-expanded', String(shouldOpen));
  }

  desktop.addEventListener('click', (event) => {
    const demoButton = event.target.closest('[data-ahk-demo]');
    const openButton = event.target.closest('[data-open-window]');
    const actionButton = event.target.closest('[data-window-action]');

    if (event.target.closest('[data-start-button]')) {
      toggleStart();
      return;
    }
    if (demoButton) selectDemo(demoButton.dataset.ahkDemo);
    if (openButton) openWindow(openButton.dataset.openWindow);
    if (demoButton || openButton) toggleStart(false);

    if (actionButton) {
      const windowElement = actionButton.closest('[data-window]');
      const action = actionButton.dataset.windowAction;
      if (action === 'maximize') {
        windowElement.classList.toggle('is-maximized');
        focusWindow(windowElement);
      } else {
        windowElement.classList.add('is-hidden');
        windowElement.setAttribute('aria-hidden', 'true');
      }
    }

    const clickedWindow = event.target.closest('[data-window]');
    if (clickedWindow) focusWindow(clickedWindow);
    if (!event.target.closest('[data-start-menu], [data-start-button]')) toggleStart(false);
  });

  desktop.querySelectorAll('[data-drag-handle]').forEach((handle) => {
    let drag = null;
    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('button') || window.innerWidth <= 1180) return;
      const windowElement = handle.closest('[data-window]');
      if (windowElement.classList.contains('is-maximized')) return;
      const desktopRect = desktop.getBoundingClientRect();
      const windowRect = windowElement.getBoundingClientRect();
      drag = {
        windowElement,
        startX: event.clientX,
        startY: event.clientY,
        left: windowRect.left - desktopRect.left,
        top: windowRect.top - desktopRect.top
      };
      windowElement.style.width = `${windowRect.width}px`;
      windowElement.style.height = `${windowRect.height}px`;
      windowElement.style.willChange = 'left, top';
      windowElement.style.transform = 'none';
      drag.maxLeft = desktop.clientWidth - windowElement.offsetWidth - 8;
      drag.maxTop = desktop.clientHeight - windowElement.offsetHeight - 72;
      focusWindow(windowElement);
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', (event) => {
      if (!drag) return;
      drag.pendingX = event.clientX;
      drag.pendingY = event.clientY;
      if (drag.frame) return;
      drag.frame = requestAnimationFrame(() => {
        drag.frame = 0;
        if (!drag) return;
        const element = drag.windowElement;
        element.style.left = `${Math.max(8, Math.min(drag.maxLeft, drag.left + drag.pendingX - drag.startX))}px`;
        element.style.top = `${Math.max(8, Math.min(drag.maxTop, drag.top + drag.pendingY - drag.startY))}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';
      });
    });
    const endDrag = () => {
      if (!drag) return;
      if (drag.frame) cancelAnimationFrame(drag.frame);
      drag.windowElement.style.willChange = '';
      drag = null;
    };
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  });

  document.querySelectorAll('[data-ahk-feature]').forEach((button) => {
    button.addEventListener('click', () => {
      selectDemo(button.dataset.ahkFeature);
      openWindow('studio');
      desktop.scrollIntoView({
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const date = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
    desktop.querySelectorAll('[data-taskbar-clock]').forEach((node) => { node.textContent = `${time}\n${date}`; });
    desktop.querySelectorAll('[data-desktop-date]').forEach((node) => {
      node.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    });
  }

  selectDemo('clipboard', false);
  updateClock();
  setInterval(updateClock, 30000);
})();
