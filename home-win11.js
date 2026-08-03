(() => {
  const desktop = document.querySelector('[data-win-desktop]');
  if (!desktop) return;

  const notepadFile = desktop.querySelector('[data-notepad-file]');
  const notepadTabs = [...desktop.querySelectorAll('[data-np-demo]')];
  const notepadBody = desktop.querySelector('[data-notepad-body]');
  const terminalBody = desktop.querySelector('[data-terminal-body]');
  const startButton = desktop.querySelector('[data-start-button]');
  const startMenu = desktop.querySelector('[data-start-menu]');
  const windows = [...desktop.querySelectorAll('[data-window]')];
  const ICON_MAXIMIZE = 'public/fluent-icons/square_16_regular.svg';
  const ICON_RESTORE = 'public/fluent-icons/square_multiple_16_regular.svg';
  let currentDemo = 'windows';

  const demos = {
    windows: {
      file: 'window-layout.ahk',
      script: [
        '#Requires AutoHotkey v2.1',
        '; Tile a workspace in one command.',
        '',
        '#w:: {  ; Win+W',
        '    half := A_ScreenWidth // 2',
        '    WinMove 0, 0, half, A_ScreenHeight, "Notepad"',
        '    WinMove half, 0, half, A_ScreenHeight // 2, "Windows Terminal"',
        '    WinMove half, A_ScreenHeight // 2, half, A_ScreenHeight // 2, "Calculator"',
        '}'
      ]
    },
    text: {
      file: 'hotstrings.ahk',
      script: [
        '#Requires AutoHotkey v2.1',
        '; Hotstrings turn a short trigger into finished writing.',
        '',
        '::;sig:: {',
        '    SendText "Best,`nJustin"',
        '}',
        '',
        '::;ty::Thanks for your help.'
      ]
    },
    clipboard: {
      file: 'clipboard-workflow.ahk',
      script: [
        '#Requires AutoHotkey v2.1',
        '; Transform and reuse everything you copy.',
        '',
        'OnClipboardChange CleanMarkdown',
        '',
        'CleanMarkdown(*) {',
        '    clean := RegExReplace(Trim(A_Clipboard), "\\r\\n?", "`n")',
        '    if (clean != A_Clipboard)',
        '        A_Clipboard := clean',
        '}'
      ]
    },
    files: {
      file: 'download-sorter.ahk',
      script: [
        '#Requires AutoHotkey v2.1',
        '; Sort a messy folder while you keep working.',
        '',
        'routes := Map("pdf", "Documents", "png", "Images", "csv", "Data")',
        '',
        'Loop Files A_Desktop "\\Downloads\\*.*" {',
        '    if !routes.Has(A_LoopFileExt)',
        '        continue',
        '    DirCreate A_Desktop "\\" routes[A_LoopFileExt]',
        '    FileMove A_LoopFileFullPath, A_Desktop "\\" routes[A_LoopFileExt]',
        '}'
      ]
    },
    gui: {
      file: 'release-builder.ahk',
      script: [
        '#Requires AutoHotkey v2.1',
        '; Build a real Windows interface in AHK.',
        '',
        'app := Gui("+Resize", "Release builder")',
        'app.AddText(, "Project name")',
        'name := app.AddEdit("w220")',
        'app.AddText(, "Output folder")',
        'out := app.AddEdit("w220")',
        'app.AddButton("Default", "Build release").OnEvent("Click", Build)',
        'app.Show',
        '',
        'Build(*) => MsgBox("Building " name.Value " → " out.Value)'
      ]
    }
  };

  function renderTerminal() {
    if (!terminalBody) return;
    terminalBody.innerHTML = '<div class="term-line"><span class="term-prompt">PS C:\\AHK&gt;</span> <span class="term-cursor"></span></div>';
  }

  function selectDemo(name, animate = true) {
    const demo = demos[name];
    if (!demo) return;
    currentDemo = name;
    document.querySelectorAll('[data-ahk-feature]').forEach((button) => {
      const active = button.dataset.ahkFeature === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (notepadFile) notepadFile.textContent = `${demo.file} — Notepad`;
    notepadTabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.npDemo === name));
    if (notepadBody) notepadBody.textContent = demo.script.join('\n');
    renderTerminal();
    if (animate) desktop.classList.toggle('is-tiled', name === 'windows');
  }

  // ---- Window + taskbar state --------------------------------------------
  const taskApps = new Map();
  desktop.querySelectorAll('.task-app[data-open-window]').forEach((button) => {
    taskApps.set(button.dataset.openWindow, button);
  });

  const windowByName = (name) => desktop.querySelector(`[data-window="${name}"]`);
  const isOpen = (win) => win && !win.classList.contains('is-hidden');

  function syncTaskbar() {
    windows.forEach((win) => {
      const button = taskApps.get(win.dataset.window);
      if (!button) return;
      const open = isOpen(win);
      button.classList.toggle('is-running', open || win.dataset.minimized === 'true');
      button.classList.toggle('is-active', open && win.classList.contains('is-focused'));
    });
  }

  function setMaximized(win, on) {
    if (!win) return;
    if (on) desktop.classList.remove('is-tiled');
    win.classList.toggle('is-maximized', on);
    if (on) win.classList.remove('is-snapped-left', 'is-snapped-right');
    const button = win.querySelector('[data-window-action="maximize"]');
    if (button) {
      button.setAttribute('aria-label', on ? 'Restore' : 'Maximize');
      const img = button.querySelector('img');
      if (img) img.src = on ? ICON_RESTORE : ICON_MAXIMIZE;
    }
  }

  function focusWindow(windowElement) {
    if (!windowElement) return;
    windows.forEach((item) => item.classList.toggle('is-focused', item === windowElement));
    syncTaskbar();
  }

  function openWindow(name) {
    const windowElement = windowByName(name);
    if (!windowElement) return;
    delete windowElement.dataset.minimized;
    windowElement.classList.remove('is-hidden');
    windowElement.setAttribute('aria-hidden', 'false');
    focusWindow(windowElement);
  }

  function minimizeWindow(win) {
    if (!win) return;
    win.dataset.minimized = 'true';
    win.classList.add('is-hidden');
    win.setAttribute('aria-hidden', 'true');
    syncTaskbar();
  }

  function closeWindow(win) {
    if (!win) return;
    delete win.dataset.minimized;
    win.classList.add('is-hidden');
    win.setAttribute('aria-hidden', 'true');
    syncTaskbar();
  }

  function toggleStart(force) {
    const shouldOpen = typeof force === 'boolean' ? force : startMenu.hidden;
    startMenu.hidden = !shouldOpen;
    startButton.setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen && startSearch) startSearch.focus();
  }

  desktop.addEventListener('click', (event) => {
    const demoButton = event.target.closest('[data-ahk-demo]');
    const openButton = event.target.closest('[data-open-window]');
    const actionButton = event.target.closest('[data-window-action]');

    if (event.target.closest('[data-start-button], [data-task-search]')) {
      toggleStart();
      return;
    }
    const npTab = event.target.closest('[data-np-demo]');
    if (npTab) {
      selectDemo(npTab.dataset.npDemo);
      openWindow('notepad');
    }
    if (demoButton) {
      selectDemo(demoButton.dataset.ahkDemo);
      openWindow('notepad');
      openWindow('terminal');
    }
    if (openButton && !openButton.closest('.desktop-shortcuts')) {
      if (openButton.classList.contains('task-app')) {
        const win = windowByName(openButton.dataset.openWindow);
        if (win) {
          if (isOpen(win) && win.classList.contains('is-focused')) minimizeWindow(win);
          else openWindow(openButton.dataset.openWindow);
        }
      } else {
        openWindow(openButton.dataset.openWindow);
      }
    }
    if (demoButton || openButton) toggleStart(false);

    if (actionButton) {
      const windowElement = actionButton.closest('[data-window]');
      const action = actionButton.dataset.windowAction;
      if (action === 'maximize') {
        setMaximized(windowElement, !windowElement.classList.contains('is-maximized'));
        focusWindow(windowElement);
      } else if (action === 'minimize') {
        minimizeWindow(windowElement);
      } else {
        closeWindow(windowElement);
      }
    }

    const clickedWindow = event.target.closest('[data-window]');
    if (clickedWindow) focusWindow(clickedWindow);
    if (!event.target.closest('[data-start-menu], [data-start-button], [data-task-search]')) toggleStart(false);
  });

  // ---- Dragging, snap assist, restore-from-maximize -----------------------
  const snapPreview = desktop.querySelector('[data-snap-preview]');

  function showSnapPreview(zone) {
    if (!snapPreview) return;
    if (!zone) {
      snapPreview.hidden = true;
      snapPreview.className = 'snap-preview';
      return;
    }
    snapPreview.hidden = false;
    snapPreview.className = `snap-preview snap-${zone}`;
  }

  function snapZone(event, desktopRect) {
    const relX = event.clientX - desktopRect.left;
    const relY = event.clientY - desktopRect.top;
    if (relY <= 24) return 'top';
    if (relX <= 24) return 'left';
    if (relX >= desktop.clientWidth - 24) return 'right';
    return null;
  }

  desktop.querySelectorAll('[data-drag-handle]').forEach((handle) => {
    let drag = null;
    let pendingRestore = null;

    function positionDragged(event) {
      if (!drag) return;
      const maxLeft = desktop.clientWidth - drag.windowElement.offsetWidth - 8;
      const maxTop = desktop.clientHeight - drag.windowElement.offsetHeight - 72;
      drag.windowElement.style.left = `${Math.max(8, Math.min(maxLeft, drag.left + event.clientX - drag.startX))}px`;
      drag.windowElement.style.top = `${Math.max(8, Math.min(maxTop, drag.top + event.clientY - drag.startY))}px`;
      drag.windowElement.style.right = 'auto';
      drag.windowElement.style.bottom = 'auto';
    }

    function beginDrag(windowElement, event, resetPosition) {
      desktop.classList.remove('is-tiled');
      if (resetPosition) {
        windowElement.classList.remove('is-snapped-left', 'is-snapped-right');
        windowElement.style.left = '';
        windowElement.style.top = '';
        windowElement.style.right = '';
        windowElement.style.bottom = '';
      }
      const desktopRect = desktop.getBoundingClientRect();
      const windowRect = windowElement.getBoundingClientRect();
      windowElement.style.width = `${windowRect.width}px`;
      windowElement.style.height = `${windowRect.height}px`;
      drag = {
        windowElement,
        startX: event.clientX,
        startY: event.clientY,
        desktopRect,
        left: windowRect.left - desktopRect.left,
        top: windowRect.top - desktopRect.top
      };
      if (resetPosition) {
        drag.left = event.clientX - desktopRect.left - windowRect.width / 2;
        drag.top = event.clientY - desktopRect.top - 15;
        positionDragged(event);
      }
    }

    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('button') || window.innerWidth <= 900) return;
      const windowElement = handle.closest('[data-window]');
      focusWindow(windowElement);
      handle.setPointerCapture(event.pointerId);
      if (windowElement.classList.contains('is-maximized')) {
        pendingRestore = { windowElement, startX: event.clientX, startY: event.clientY };
        return;
      }
      const wasSnapped = windowElement.classList.contains('is-snapped-left') || windowElement.classList.contains('is-snapped-right');
      beginDrag(windowElement, event, wasSnapped);
    });

    handle.addEventListener('pointermove', (event) => {
      if (pendingRestore && !drag) {
        const dx = event.clientX - pendingRestore.startX;
        const dy = event.clientY - pendingRestore.startY;
        if (dx * dx + dy * dy > 144) {
          setMaximized(pendingRestore.windowElement, false);
          beginDrag(pendingRestore.windowElement, event, true);
          pendingRestore = null;
        }
        return;
      }
      if (!drag) return;
      positionDragged(event);
      showSnapPreview(snapZone(event, drag.desktopRect));
    });

    const endDrag = (event) => {
      pendingRestore = null;
      if (!drag) return;
      const zone = snapZone(event, drag.desktopRect);
      const windowElement = drag.windowElement;
      drag = null;
      showSnapPreview(null);
      if (zone === 'top') {
        setMaximized(windowElement, true);
      } else if (zone === 'left' || zone === 'right') {
        windowElement.style.left = '';
        windowElement.style.top = '';
        windowElement.style.right = '';
        windowElement.style.bottom = '';
        windowElement.style.width = '';
        windowElement.style.height = '';
        windowElement.classList.add(`is-snapped-${zone}`);
      }
    };
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);

    handle.addEventListener('dblclick', (event) => {
      if (event.target.closest('button') || window.innerWidth <= 900) return;
      const windowElement = handle.closest('[data-window]');
      setMaximized(windowElement, !windowElement.classList.contains('is-maximized'));
      focusWindow(windowElement);
    });
  });

  document.querySelectorAll('[data-ahk-feature]').forEach((button) => {
    button.addEventListener('click', () => {
      selectDemo(button.dataset.ahkFeature);
      openWindow('notepad');
      openWindow('terminal');
      desktop.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  // ---- Calculator ----------------------------------------------------------
  const calcDisplay = desktop.querySelector('[data-calc-display]');
  const calcHistory = desktop.querySelector('[data-calc-history]');
  if (calcDisplay) {
    let current = '0';
    let stored = null;
    let op = null;
    let fresh = true;
    const ops = { add: (a, b) => a + b, sub: (a, b) => a - b, mul: (a, b) => a * b, div: (a, b) => a / b };
    const symbols = { add: '+', sub: '−', mul: '×', div: '÷' };
    const show = () => { calcDisplay.textContent = current; };
    const tidy = (n) => String(Math.round(n * 1e10) / 1e10);

    function equals() {
      if (op === null || stored === null) return;
      const b = parseFloat(current);
      if (calcHistory) calcHistory.textContent = `${stored} ${symbols[op]} ${b} =`;
      current = tidy(ops[op](stored, b));
      op = null;
      stored = null;
      fresh = true;
      show();
    }

    function setOp(next) {
      if (op !== null && !fresh) equals();
      stored = parseFloat(current);
      op = next;
      fresh = true;
      if (calcHistory) calcHistory.textContent = `${current} ${symbols[next]}`;
    }

    function unary(fn) {
      current = tidy(fn(parseFloat(current)));
      fresh = true;
      show();
    }

    desktop.querySelectorAll('[data-calc-key]').forEach((key) => {
      key.addEventListener('click', () => {
        const k = key.dataset.calcKey;
        if (/^[0-9]$/.test(k)) {
          if (fresh) { current = k; fresh = false; }
          else if (current.replace(/[-.]/g, '').length < 12) current = current === '0' ? k : current + k;
          show();
        } else if (k === 'dot') {
          if (fresh) { current = '0.'; fresh = false; }
          else if (!current.includes('.')) current += '.';
          show();
        } else if (k === 'neg') {
          if (current !== '0') current = current.startsWith('-') ? current.slice(1) : `-${current}`;
          show();
        } else if (k === 'pct') unary((n) => n / 100);
        else if (k === 'inv') unary((n) => 1 / n);
        else if (k === 'sq') unary((n) => n * n);
        else if (k === 'sqrt') unary(Math.sqrt);
        else if (k === 'ce') { current = '0'; fresh = true; show(); }
        else if (k === 'c') {
          current = '0'; stored = null; op = null; fresh = true;
          if (calcHistory) calcHistory.textContent = '';
          show();
        } else if (k === 'back') {
          if (!fresh) { current = current.length > 1 ? current.slice(0, -1) : '0'; show(); }
        } else if (k === 'eq') equals();
        else if (ops[k]) setOp(k);
      });
    });
  }

  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const date = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
    desktop.querySelectorAll('[data-taskbar-clock]').forEach((node) => { node.textContent = `${time}\n${date}`; });
    desktop.querySelectorAll('[data-desktop-date]').forEach((node) => {
      node.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    });
  }

  // Desktop icons: single-click selects, double-click opens
  const shortcutContainer = desktop.querySelector('.desktop-shortcuts');
  if (shortcutContainer) {
    const clearSelection = () => {
      shortcutContainer.querySelectorAll('.is-selected').forEach((icon) => icon.classList.remove('is-selected'));
    };
    shortcutContainer.addEventListener('click', (event) => {
      const icon = event.target.closest('button, a');
      if (!icon) return;
      event.preventDefault();
      clearSelection();
      icon.classList.add('is-selected');
    });
    shortcutContainer.addEventListener('dblclick', (event) => {
      const icon = event.target.closest('button, a');
      if (!icon) return;
      event.preventDefault();
      if (icon.tagName === 'A') {
        window.location.href = icon.href;
      } else {
        openWindow(icon.dataset.openWindow);
      }
    });
    desktop.addEventListener('click', (event) => {
      if (!event.target.closest('.desktop-shortcuts')) clearSelection();
    });
  }

  // Quick settings flyout from the tray icons
  const trayButton = desktop.querySelector('[data-tray-icons]');
  const quickSettings = desktop.querySelector('[data-quick-settings]');
  const wallpaperImg = desktop.querySelector('.win11-wallpaper-image');
  const setSettings = (open) => {
    if (!quickSettings || !trayButton) return;
    quickSettings.hidden = !open;
    trayButton.setAttribute('aria-expanded', String(open));
  };
  if (trayButton && quickSettings) {
    trayButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const opening = quickSettings.hidden;
      setSettings(opening);
      if (opening) setNotif(false);
    });
    document.addEventListener('click', (event) => {
      if (!quickSettings.hidden && !event.target.closest('[data-quick-settings], [data-tray-icons]')) setSettings(false);
    });
    quickSettings.querySelectorAll('.qs-toggle').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const on = toggle.classList.toggle('is-on');
        toggle.setAttribute('aria-pressed', String(on));
      });
    });
    const brightness = quickSettings.querySelector('[data-qs-brightness]');
    if (brightness && wallpaperImg) {
      brightness.addEventListener('input', () => {
        wallpaperImg.style.filter = `saturate(1.04) contrast(1.02) brightness(${brightness.value / 100})`;
      });
    }
  }

  // Notification center + calendar from the tray clock
  const notifButton = desktop.querySelector('[data-notif-button]');
  const notifCenter = desktop.querySelector('[data-notif-center]');
  function setNotif(open) {
    if (!notifCenter || !notifButton) return;
    notifCenter.hidden = !open;
    notifButton.setAttribute('aria-expanded', String(open));
  }
  if (notifButton && notifCenter) {
    notifButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const opening = notifCenter.hidden;
      setNotif(opening);
      if (opening) setSettings(false);
    });
    document.addEventListener('click', (event) => {
      if (!notifCenter.hidden && !event.target.closest('[data-notif-center], [data-notif-button]')) setNotif(false);
    });

    const notifList = notifCenter.querySelector('[data-notif-list]');
    const clearButton = notifCenter.querySelector('[data-notif-clear]');
    if (clearButton && notifList) {
      clearButton.addEventListener('click', () => {
        notifList.innerHTML = '<div class="notif-empty">No new notifications</div>';
        clearButton.disabled = true;
      });
    }

    const calTitle = notifCenter.querySelector('[data-cal-title]');
    const calGrid = notifCenter.querySelector('[data-cal-grid]');
    const calCursor = new Date();
    calCursor.setDate(1);
    function renderCalendar() {
      if (!calTitle || !calGrid) return;
      const today = new Date();
      const year = calCursor.getFullYear();
      const month = calCursor.getMonth();
      calTitle.textContent = calCursor.toLocaleDateString([], { month: 'long', year: 'numeric' });
      const firstWeekday = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrev = new Date(year, month, 0).getDate();
      let html = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<span class="cal-dow">${d}</span>`).join('');
      for (let i = firstWeekday - 1; i >= 0; i -= 1) html += `<span class="cal-out">${daysInPrev - i}</span>`;
      for (let day = 1; day <= daysInMonth; day += 1) {
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        html += `<span${isToday ? ' class="cal-today"' : ''}>${day}</span>`;
      }
      const trailing = (7 - ((firstWeekday + daysInMonth) % 7)) % 7;
      for (let day = 1; day <= trailing; day += 1) html += `<span class="cal-out">${day}</span>`;
      calGrid.innerHTML = html;
    }
    notifCenter.querySelector('[data-cal-prev]').addEventListener('click', () => {
      calCursor.setMonth(calCursor.getMonth() - 1);
      renderCalendar();
    });
    notifCenter.querySelector('[data-cal-next]').addEventListener('click', () => {
      calCursor.setMonth(calCursor.getMonth() + 1);
      renderCalendar();
    });
    renderCalendar();
  }

  // Desktop right-click context menu
  const contextMenu = desktop.querySelector('[data-context-menu]');
  if (contextMenu) {
    const hideMenu = () => { contextMenu.hidden = true; };
    desktop.addEventListener('contextmenu', (event) => {
      if (event.target.closest('.win-window, .win-taskbar, .win-start-menu, .quick-settings, .notif-center, .desktop-shortcuts')) return;
      event.preventDefault();
      contextMenu.hidden = false;
      const rect = desktop.getBoundingClientRect();
      const x = Math.min(Math.max(8, event.clientX - rect.left), desktop.clientWidth - contextMenu.offsetWidth - 8);
      const y = Math.min(Math.max(8, event.clientY - rect.top), desktop.clientHeight - contextMenu.offsetHeight - 8);
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
    });
    contextMenu.addEventListener('click', (event) => {
      const item = event.target.closest('[role="menuitem"]');
      if (!item) return;
      if (item.hasAttribute('data-menu-refresh')) selectDemo(currentDemo);
      hideMenu();
    });
    document.addEventListener('click', (event) => {
      if (!contextMenu.hidden && !event.target.closest('[data-context-menu]')) hideMenu();
    });
  }

  // Escape closes every flyout, from anywhere on the page
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (contextMenu) contextMenu.hidden = true;
    setSettings(false);
    setNotif(false);
    toggleStart(false);
  });

  // Start menu search filters the pinned grid; Enter opens the first match
  const startSearch = desktop.querySelector('[data-start-search]');
  if (startSearch) {
    startSearch.addEventListener('input', () => {
      const query = startSearch.value.trim().toLowerCase();
      desktop.querySelectorAll('.start-grid > *').forEach((tile) => {
        tile.hidden = query ? !tile.textContent.toLowerCase().includes(query) : false;
      });
    });
    startSearch.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      const first = [...desktop.querySelectorAll('.start-grid > *')].find((tile) => !tile.hidden);
      if (first) first.click();
    });
  }

  selectDemo('windows', false);
  updateClock();
  syncTaskbar();
  setInterval(updateClock, 30000);
})();
