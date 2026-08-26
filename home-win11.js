(() => {
  const desktop = document.querySelector('[data-win-desktop]');
  if (!desktop) return;

  const demoOutput = desktop.querySelector('[data-demo-output]');
  const demoVisual = desktop.querySelector('[data-demo-visual]');
  const demoStatus = desktop.querySelector('[data-demo-status]');
  const demoLabel = desktop.querySelector('[data-demo-label]');
  const demoTitle = desktop.querySelector('[data-demo-title]');
  const demoDescription = desktop.querySelector('[data-demo-description]');
  const demoCode = desktop.querySelector('[data-demo-code]');
  const demoFileNodes = [...desktop.querySelectorAll('[data-demo-file], [data-window-file], [data-workbench-file]')];
  const consoleMessage = desktop.querySelector('[data-console-message]');
  const runButton = desktop.querySelector('[data-run-demo]');
  const startButton = desktop.querySelector('[data-start-button]');
  const startMenu = desktop.querySelector('[data-start-menu]');
  const windows = [...desktop.querySelectorAll('[data-window]')];
  const desktopLayout = window.matchMedia('(max-width: 1180px)');
  let statusTimer;
  let currentDemoName = 'clipboard';

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

  const demos = {
    windows: {
      file: 'window-layout.ahk',
      label: 'WINDOW CONTROL',
      title: 'Tile a workspace in one command.',
      description: 'AHK can find, focus, resize, and arrange native Windows applications around the way you work.',
      visualClass: 'demo-windows',
      visual: '<div class="workspace-zones"><div class="workspace-zone zone-primary"><b>Editor</b><small>50%</small></div><div class="workspace-zone"><b>Browser</b><small>25%</small></div><div class="workspace-zone"><b>Terminal</b><small>25%</small></div></div>',
      code: '<span class="code-directive">#Requires</span> AutoHotkey v2.1\n\n<span class="code-function">TileWorkspace</span>() {\n    WinMove 0, 0, A_ScreenWidth / 2, A_ScreenHeight, \"A\"\n}'
    },
    text: {
      file: 'hotstrings.ahk',
      label: 'TEXT EXPANSION',
      title: 'Turn a short trigger into finished writing.',
      description: 'Hotstrings expand signatures, case notes, templates, or any repeated text inside almost any Windows application.',
      visualClass: 'demo-text',
      visual: '<div class="demo-text-editor"><header>New message</header><p>Thanks for your help.<br><br><mark>;sig → Best,<br>Justin</mark></p></div>',
      code: '<span class="code-directive">#Requires</span> AutoHotkey v2.1\n\n<span class="code-function">ExpandSignature</span>(*) {\n    SendText \"Best,`nJustin\"\n}\n\nHotstring(\":*:;sig\", ExpandSignature)'
    },
    clipboard: {
      file: 'clipboard-workflow.ahk',
      label: 'CLIPBOARD WORKFLOWS',
      title: 'Transform and reuse everything you copy.',
      description: 'Watch the clipboard, clean incoming text, keep useful snippets, and paste the right format into the active app.',
      visualClass: 'demo-clipboard',
      visual: '<div class="clipboard-list"><div class="clipboard-item"><span>Raw meeting notes</span><b>captured</b></div><div class="clipboard-item is-picked"><span>Clean Markdown</span><b>selected</b></div><div class="clipboard-item"><span>Plain-text summary</span><b>ready</b></div></div>',
      code: '<span class="code-directive">#Requires</span> AutoHotkey v2.1\n\n<span class="code-function">CleanMarkdown</span>(text) {\n    text := RegExReplace(text, \"\\R{3,}\", \"`n`n\")\n    return Trim(text)\n}\n\n<span class="code-variable">A_Clipboard</span> := CleanMarkdown(A_Clipboard)'
    },
    files: {
      file: 'download-sorter.ahk',
      label: 'FILE AUTOMATION',
      title: 'Sort a messy folder while you keep working.',
      description: 'AHK can watch directories, rename batches, move files by type, and launch the next step in a desktop workflow.',
      visualClass: 'demo-files',
      visual: '<div class="file-sorter"><div class="file-item"><span>report.pdf</span><b>Documents →</b></div><div class="file-item"><span>capture.png</span><b>Images →</b></div><div class="file-item"><span>results.csv</span><b>Data →</b></div></div>',
      code: '<span class="code-directive">#Requires</span> AutoHotkey v2.1\n\nLoop Files Downloads \"\\*.*\" {\n    <span class="code-function">SortDownload</span>(A_LoopFileFullPath)\n}'
    },
    gui: {
      file: 'release-builder.ahk',
      label: 'CUSTOM DESKTOP APPS',
      title: 'Build a real Windows interface in AHK.',
      description: 'Create native tools with inputs, buttons, menus, events, and resizable layouts—without leaving AutoHotkey v2.',
      visualClass: 'demo-gui',
      visual: '<div class="gui-preview"><header><span>Release builder</span><span>×</span></header><label>Project name<i></i></label><label>Output folder<i></i></label><footer><button type="button">Build release</button></footer></div>',
      code: '<span class="code-directive">#Requires</span> AutoHotkey v2.1\n\n<span class="code-variable">app</span> := Gui(\"+Resize\", \"Release builder\")\napp.AddEdit(\"w320\", \"Project name\")\napp.AddButton(\"Default\", \"Build release\")\napp.Show()'
    }
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Fades each word up from 40% opacity in sequence, so a line of AHK arrives
  // the way a model streams it. Walking text nodes keeps the syntax-highlight
  // spans the demo data already carries.
  function streamWords(host, animate) {
    if (!host || !animate || reduceMotion.matches) return;
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) textNodes.push(node);

    let index = 0;
    textNodes.forEach((node) => {
      const parts = node.nodeValue.split(/(\s+)/).filter((part) => part.length);
      if (parts.length === 0) return;
      const fragment = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part.trim()) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const word = document.createElement('span');
        word.className = 'streaming-word';
        word.style.animationDelay = `${index * 34}ms`;
        word.textContent = part;
        fragment.appendChild(word);
        index += 1;
      });
      node.parentNode.replaceChild(fragment, node);
    });
  }

  function selectDemo(name, animate = true) {
    const demo = demos[name];
    if (!demo || !demoOutput) return;
    currentDemoName = name;
    desktop.querySelectorAll('[data-ahk-demo]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.ahkDemo === name && button.classList.contains('automation-button'));
    });
    document.querySelectorAll('[data-ahk-feature]').forEach((button) => {
      const active = button.dataset.ahkFeature === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    demoFileNodes.forEach((node) => { node.textContent = demo.file; });
    demoVisual.className = `demo-visual ${demo.visualClass}`;
    demoVisual.innerHTML = demo.visual;
    demoLabel.textContent = demo.label;
    demoTitle.textContent = demo.title;
    demoDescription.textContent = demo.description;
    demoCode.innerHTML = `<code>${demo.code}</code>`;
    streamWords(demoCode, animate);
    if (!animate) return;
    demoOutput.classList.remove('is-running');
    void demoOutput.offsetWidth;
    demoOutput.classList.add('is-running');
    demoStatus.textContent = 'running';
    if (consoleMessage) consoleMessage.textContent = `Running ${demo.file}…`;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      demoStatus.textContent = 'complete';
      if (consoleMessage) consoleMessage.textContent = `Completed · ${demo.file}`;
      demoOutput.classList.remove('is-running');
    }, 720);
  }

  runButton?.addEventListener('click', () => selectDemo(currentDemoName));

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
      // The studio window is centred with left:50% plus translateX(-50%). The
      // offsets below come from the post-transform rect, so the centring shift
      // has to go or the window jumps half its width on the first drag.
      windowElement.style.transform = 'none';
      // The bounds only depend on the window and desktop size, so measure once
      // here instead of re-reading offsetWidth on every pointer event.
      drag.maxLeft = desktop.clientWidth - windowElement.offsetWidth - 8;
      drag.maxTop = desktop.clientHeight - windowElement.offsetHeight - 72;
      focusWindow(windowElement);
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', (event) => {
      if (!drag) return;
      // Pointer events can outpace the display, so coalesce into one write per
      // frame rather than forcing a layout per event.
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

  selectDemo('clipboard', false);
  updateClock();
  setInterval(updateClock, 30000);
})();
