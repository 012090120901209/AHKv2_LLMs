(() => {
  const desktop = document.querySelector('[data-win-desktop]');
  if (!desktop) return;

  const demoOutput = desktop.querySelector('[data-demo-output]');
  const demoVisual = desktop.querySelector('[data-demo-visual]');
  const demoStatus = desktop.querySelector('[data-demo-status]');
  const demoLabel = desktop.querySelector('[data-demo-label]');
  const demoTitle = desktop.querySelector('[data-demo-title]');
  const demoEditor = desktop.querySelector('[data-demo-editor]');
  const demoConsole = desktop.querySelector('[data-demo-console]');
  const editorTab = desktop.querySelector('[data-editor-tab]');
  const studioPath = desktop.querySelector('[data-studio-path]');
  const startButton = desktop.querySelector('[data-start-button]');
  const startMenu = desktop.querySelector('[data-start-menu]');
  const windows = [...desktop.querySelectorAll('[data-window]')];
  const studioStatus = desktop.querySelector('[data-studio-status]');
  const ICON_MAXIMIZE = 'public/fluent-icons/square_16_regular.svg';
  const ICON_RESTORE = 'public/fluent-icons/square_multiple_16_regular.svg';
  let statusTimer;
  let currentDemo = 'windows';

  const demos = {
    windows: {
      file: 'window-layout.ahk',
      label: 'WINDOW CONTROL',
      title: 'Tile a workspace in one command.',
      description: 'AHK can find, focus, resize, and arrange native Windows applications around the way you work.',
      visualClass: 'demo-windows',
      visual: '<div class="mini-window mini-one"><span></span><p>Research</p></div><div class="mini-window mini-two"><span></span><p>Editor</p></div><div class="mini-window mini-three"><span></span><p>Console</p></div>',
      script: [
        '<span class="hl-dir">#Requires</span> AutoHotkey <span class="hl-num">v2.1</span>',
        '<span class="hl-com">; Tile a workspace in one command.</span>',
        '',
        '<span class="hl-var">#w</span>:: {  <span class="hl-com">; Win+W</span>',
        '    <span class="hl-var">half</span> := <span class="hl-var">A_ScreenWidth</span> // <span class="hl-num">2</span>',
        '    <span class="hl-fn">WinMove</span> <span class="hl-num">0</span>, <span class="hl-num">0</span>, <span class="hl-var">half</span>, <span class="hl-var">A_ScreenHeight</span>, <span class="hl-str">"Research"</span>',
        '    <span class="hl-fn">WinMove</span> <span class="hl-var">half</span>, <span class="hl-num">0</span>, <span class="hl-var">half</span>, <span class="hl-var">A_ScreenHeight</span> // <span class="hl-num">2</span>, <span class="hl-str">"Editor"</span>',
        '    <span class="hl-fn">WinMove</span> <span class="hl-var">half</span>, <span class="hl-var">A_ScreenHeight</span> // <span class="hl-num">2</span>, <span class="hl-var">half</span>, <span class="hl-var">A_ScreenHeight</span> // <span class="hl-num">2</span>, <span class="hl-str">"Console"</span>',
        '}'
      ],
      output: '&gt; 3 windows tiled across 2 columns · 14 ms'
    },
    text: {
      file: 'hotstrings.ahk',
      label: 'TEXT EXPANSION',
      title: 'Turn a short trigger into finished writing.',
      description: 'Hotstrings expand signatures, case notes, templates, or any repeated text inside almost any Windows application.',
      visualClass: 'demo-text',
      visual: '<div class="demo-text-editor"><header>New message</header><p>Thanks for your help.<br><br><mark>;sig → Best,<br>Justin</mark></p></div>',
      script: [
        '<span class="hl-dir">#Requires</span> AutoHotkey <span class="hl-num">v2.1</span>',
        '<span class="hl-com">; Hotstrings turn a short trigger into finished writing.</span>',
        '',
        '<span class="hl-var">::;sig::</span> {',
        '    <span class="hl-fn">SendText</span> <span class="hl-str">"Best,`nJustin"</span>',
        '}',
        '',
        '<span class="hl-var">::;ty::</span><span class="hl-str">Thanks for your help.</span>'
      ],
      output: '&gt; ;sig expanded to 2 lines · 3 ms'
    },
    clipboard: {
      file: 'clipboard-workflow.ahk',
      label: 'CLIPBOARD WORKFLOWS',
      title: 'Transform and reuse everything you copy.',
      description: 'Watch the clipboard, clean incoming text, keep useful snippets, and paste the right format into the active app.',
      visualClass: 'demo-clipboard',
      visual: '<div class="clipboard-list"><div class="clipboard-item"><span>Raw meeting notes</span><b>captured</b></div><div class="clipboard-item is-picked"><span>Clean Markdown</span><b>selected</b></div><div class="clipboard-item"><span>Plain-text summary</span><b>ready</b></div></div>',
      script: [
        '<span class="hl-dir">#Requires</span> AutoHotkey <span class="hl-num">v2.1</span>',
        '<span class="hl-com">; Transform and reuse everything you copy.</span>',
        '',
        '<span class="hl-fn">OnClipboardChange</span> <span class="hl-var">CleanMarkdown</span>',
        '',
        '<span class="hl-var">CleanMarkdown</span>(*) {',
        '    <span class="hl-var">clean</span> := <span class="hl-fn">RegExReplace</span>(<span class="hl-fn">Trim</span>(<span class="hl-var">A_Clipboard</span>), <span class="hl-str">"\\r\\n?"</span>, <span class="hl-str">"`n"</span>)',
        '    <span class="hl-kw">if</span> (<span class="hl-var">clean</span> != <span class="hl-var">A_Clipboard</span>)',
        '        <span class="hl-var">A_Clipboard</span> := <span class="hl-var">clean</span>',
        '}'
      ],
      output: '&gt; Clipboard cleaned → Markdown · 6 ms'
    },
    files: {
      file: 'download-sorter.ahk',
      label: 'FILE AUTOMATION',
      title: 'Sort a messy folder while you keep working.',
      description: 'AHK can watch directories, rename batches, move files by type, and launch the next step in a desktop workflow.',
      visualClass: 'demo-files',
      visual: '<div class="file-sorter"><div class="file-item"><span>report.pdf</span><b>Documents →</b></div><div class="file-item"><span>capture.png</span><b>Images →</b></div><div class="file-item"><span>results.csv</span><b>Data →</b></div></div>',
      script: [
        '<span class="hl-dir">#Requires</span> AutoHotkey <span class="hl-num">v2.1</span>',
        '<span class="hl-com">; Sort a messy folder while you keep working.</span>',
        '',
        '<span class="hl-var">routes</span> := <span class="hl-fn">Map</span>(<span class="hl-str">"pdf"</span>, <span class="hl-str">"Documents"</span>, <span class="hl-str">"png"</span>, <span class="hl-str">"Images"</span>, <span class="hl-str">"csv"</span>, <span class="hl-str">"Data"</span>)',
        '',
        '<span class="hl-kw">Loop Files</span> <span class="hl-var">A_Desktop</span> <span class="hl-str">"\\Downloads\\*.*"</span> {',
        '    <span class="hl-kw">if</span> !<span class="hl-var">routes</span>.<span class="hl-fn">Has</span>(<span class="hl-var">A_LoopFileExt</span>)',
        '        <span class="hl-kw">continue</span>',
        '    <span class="hl-fn">DirCreate</span> <span class="hl-var">A_Desktop</span> <span class="hl-str">"\\"</span> <span class="hl-var">routes</span>[<span class="hl-var">A_LoopFileExt</span>]',
        '    <span class="hl-fn">FileMove</span> <span class="hl-var">A_LoopFileFullPath</span>, <span class="hl-var">A_Desktop</span> <span class="hl-str">"\\"</span> <span class="hl-var">routes</span>[<span class="hl-var">A_LoopFileExt</span>]',
        '}'
      ],
      output: '&gt; 3 files sorted into Documents, Images, Data · 22 ms'
    },
    gui: {
      file: 'release-builder.ahk',
      label: 'CUSTOM DESKTOP APPS',
      title: 'Build a real Windows interface in AHK.',
      description: 'Create native tools with inputs, buttons, menus, events, and resizable layouts—without leaving AutoHotkey v2.',
      visualClass: 'demo-gui',
      visual: '<div class="gui-preview"><header><span>Release builder</span><span>×</span></header><label>Project name<i></i></label><label>Output folder<i></i></label><footer><button type="button">Build release</button></footer></div>',
      script: [
        '<span class="hl-dir">#Requires</span> AutoHotkey <span class="hl-num">v2.1</span>',
        '<span class="hl-com">; Build a real Windows interface in AHK.</span>',
        '',
        '<span class="hl-var">app</span> := <span class="hl-fn">Gui</span>(<span class="hl-str">"+Resize"</span>, <span class="hl-str">"Release builder"</span>)',
        '<span class="hl-var">app</span>.<span class="hl-fn">AddText</span>(, <span class="hl-str">"Project name"</span>)',
        '<span class="hl-var">name</span> := <span class="hl-var">app</span>.<span class="hl-fn">AddEdit</span>(<span class="hl-str">"w220"</span>)',
        '<span class="hl-var">app</span>.<span class="hl-fn">AddText</span>(, <span class="hl-str">"Output folder"</span>)',
        '<span class="hl-var">out</span> := <span class="hl-var">app</span>.<span class="hl-fn">AddEdit</span>(<span class="hl-str">"w220"</span>)',
        '<span class="hl-var">app</span>.<span class="hl-fn">AddButton</span>(<span class="hl-str">"Default"</span>, <span class="hl-str">"Build release"</span>).<span class="hl-fn">OnEvent</span>(<span class="hl-str">"Click"</span>, <span class="hl-var">Build</span>)',
        '<span class="hl-var">app</span>.<span class="hl-fn">Show</span>()',
        '',
        '<span class="hl-var">Build</span>(*) =&gt; <span class="hl-fn">MsgBox</span>(<span class="hl-str">"Building "</span> <span class="hl-var">name</span>.<span class="hl-var">Value</span> <span class="hl-str">" → "</span> <span class="hl-var">out</span>.<span class="hl-var">Value</span>)'
      ],
      output: '&gt; Gui "Release builder" shown · 9 ms'
    }
  };

  function selectDemo(name, animate = true) {
    const demo = demos[name];
    if (!demo || !demoOutput) return;
    currentDemo = name;
    desktop.querySelectorAll('[data-ahk-demo]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.ahkDemo === name && button.classList.contains('automation-button'));
    });
    document.querySelectorAll('[data-ahk-feature]').forEach((button) => {
      const active = button.dataset.ahkFeature === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    demoOutput.querySelector('.demo-titlebar span').lastChild.textContent = demo.file;
    demoVisual.className = `demo-visual ${demo.visualClass}`;
    demoVisual.innerHTML = demo.visual;
    demoLabel.textContent = demo.label;
    demoTitle.textContent = demo.title;
    if (demoEditor) {
      demoEditor.innerHTML = demo.script
        .map((line, index) => `<div class="editor-line"><span class="editor-ln">${index + 1}</span><code>${line || '&nbsp;'}</code></div>`)
        .join('');
    }
    if (editorTab) editorTab.textContent = demo.file;
    if (studioPath) studioPath.textContent = `C:\\AHK\\${demo.file}`;
    if (!animate) {
      if (demoConsole) demoConsole.innerHTML = demo.output;
      return;
    }
    demoOutput.classList.remove('is-running');
    void demoOutput.offsetWidth;
    demoOutput.classList.add('is-running');
    demoStatus.textContent = 'running';
    if (demoConsole) demoConsole.textContent = `> Running ${demo.file}…`;
    if (studioStatus) studioStatus.textContent = `Running ${demo.file}…`;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      demoStatus.textContent = 'complete';
      demoOutput.classList.remove('is-running');
      if (demoConsole) demoConsole.innerHTML = demo.output;
      if (studioStatus) studioStatus.textContent = `${demo.file} — complete`;
    }, 720);
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

    if (event.target.closest('[data-start-button]')) {
      toggleStart();
      return;
    }
    if (event.target.closest('[data-run-demo]')) selectDemo(currentDemo);
    if (demoButton) selectDemo(demoButton.dataset.ahkDemo);
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
    if (!event.target.closest('[data-start-menu], [data-start-button]')) toggleStart(false);
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
      if (event.button !== 0 || event.target.closest('button') || window.innerWidth <= 1180) return;
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
      if (event.target.closest('button') || window.innerWidth <= 1180) return;
      const windowElement = handle.closest('[data-window]');
      setMaximized(windowElement, !windowElement.classList.contains('is-maximized'));
      focusWindow(windowElement);
    });
  });

  document.querySelectorAll('[data-ahk-feature]').forEach((button) => {
    button.addEventListener('click', () => {
      selectDemo(button.dataset.ahkFeature);
      openWindow('studio');
      desktop.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
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
