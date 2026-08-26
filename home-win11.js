(() => {
  const desktop = document.querySelector('[data-win-desktop]');
  if (!desktop) return;

  const demoOutput = desktop.querySelector('[data-demo-output]');
  const utilityContent = desktop.querySelector('[data-utility-content]');
  const utilityStatus = desktop.querySelector('[data-utility-status]');
  const utilityHeading = desktop.querySelector('[data-utility-heading]');
  const utilityDescription = desktop.querySelector('[data-utility-description]');
  const utilityState = desktop.querySelector('.utility-state');
  const utilityIcon = desktop.querySelector('.utility-app-icon img');
  const appTitle = desktop.querySelector('[data-app-title]');
  const demoFileNodes = [...desktop.querySelectorAll('[data-window-file]')];
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
      appTitle: 'Workspace Layout',
      description: 'AHK can find, focus, resize, and arrange native Windows applications around the way you work.',
      state: '3 windows detected',
      icon: 'public/fluent-icons/window_multiple_24_regular.svg',
      status: 'Ready · workspace detected',
      content: `<div class="layout-utility">
        <div class="utility-control-row"><span>Layout preset</span><div class="preset-pills"><button class="is-selected" type="button" data-utility-action="Focus layout selected">Focus</button><button type="button" data-utility-action="Research layout selected">Research</button><button type="button" data-utility-action="Meeting layout selected">Meeting</button></div></div>
        <div class="workspace-monitor" aria-label="Monitor layout preview"><div class="monitor-zone zone-editor"><b>Editor</b><small>50%</small></div><div class="monitor-zone"><b>Browser</b><small>25%</small></div><div class="monitor-zone"><b>Terminal</b><small>25%</small></div></div>
        <div class="utility-action-row"><button class="is-primary" type="button" data-utility-action="Layout applied to 3 windows">Apply layout</button><button type="button" data-utility-action="Window positions restored">Restore</button></div>
      </div>`
    },
    text: {
      file: 'hotstrings.ahk',
      appTitle: 'Text Expander',
      description: 'Hotstrings expand signatures, case notes, templates, or any repeated text inside almost any Windows application.',
      state: '3 shortcuts active',
      icon: 'public/fluent-icons/text_case_title_24_regular.svg',
      status: 'Ready · listening for shortcuts',
      content: `<div class="text-utility">
        <div class="utility-list-heading"><span>Shortcut</span><span>Expansion</span></div>
        <div class="expansion-row"><kbd>;sig</kbd><span>Best,<br>Justin</span><i>Active</i></div>
        <div class="expansion-row"><kbd>;date</kbd><span>Wednesday, August 26</span><i>Active</i></div>
        <div class="expansion-row"><kbd>;case</kbd><span>Case note template</span><i>Active</i></div>
        <div class="utility-action-row"><button class="is-primary" type="button" data-utility-action="New shortcut added">Add shortcut</button><button type="button" data-utility-action="Shortcuts paused">Pause all</button></div>
      </div>`
    },
    clipboard: {
      file: 'clipboard-workflow.ahk',
      appTitle: 'Clipboard Formatter',
      description: 'Watch the clipboard, clean incoming text, keep useful snippets, and paste the right format into the active app.',
      state: 'Watching clipboard',
      icon: 'public/fluent-icons/clipboard_24_regular.svg',
      status: 'Ready · clipboard listener active',
      content: `<div class="clipboard-utility">
        <label class="utility-label">Clipboard text <span>342 characters</span></label>
        <textarea class="utility-textarea" readonly>Meeting notes

We reviewed the release checklist and assigned the remaining tasks.

Next review: Thursday at 10:00 AM.</textarea>
        <div class="utility-action-row" aria-label="Text transformations"><button class="is-primary" type="button" data-utility-action="Markdown cleaned">Clean Markdown</button><button type="button" data-utility-action="Converted to title case">Title Case</button><button type="button" data-utility-action="Last change undone">Undo</button></div>
        <section class="utility-result-card" aria-label="Formatted result"><header><span>Formatted output</span><small>Plain text</small></header><p><strong>Meeting notes</strong><br>We reviewed the release checklist and assigned the remaining tasks.<br><br>Next review: Thursday at 10:00 AM.</p></section>
      </div>`
    },
    files: {
      file: 'download-sorter.ahk',
      appTitle: 'Downloads Organizer',
      description: 'AHK can watch directories, rename batches, move files by type, and launch the next step in a desktop workflow.',
      state: '3 files ready',
      icon: 'public/fluent-icons/folder_24_regular.svg',
      status: 'Ready · Downloads folder monitored',
      content: `<div class="files-utility">
        <div class="utility-list-heading file-columns"><span>File</span><span>Destination</span></div>
        <div class="native-file-row"><span><i class="file-type">PDF</i><b>quarterly-report.pdf</b><small>2.4 MB</small></span><em>Documents</em></div>
        <div class="native-file-row"><span><i class="file-type image">IMG</i><b>desktop-capture.png</b><small>1.1 MB</small></span><em>Pictures</em></div>
        <div class="native-file-row"><span><i class="file-type data">CSV</i><b>benchmark-results.csv</b><small>86 KB</small></span><em>Data</em></div>
        <div class="utility-action-row"><button class="is-primary" type="button" data-utility-action="3 files organized">Organize 3 files</button><button type="button" data-utility-action="Folder opened">Open folder</button></div>
      </div>`
    },
    gui: {
      file: 'release-builder.ahk',
      appTitle: 'Release Builder',
      description: 'Create native tools with inputs, buttons, menus, events, and resizable layouts—without leaving AutoHotkey v2.',
      state: 'Project configured',
      icon: 'public/fluent-icons/window_dev_tools_24_regular.svg',
      status: 'Ready · output folder available',
      content: `<form class="release-utility">
        <label class="native-field">Project name<input value="AHK Clipboard Tools" readonly></label>
        <label class="native-field">Entry script<input value="src\\ClipboardTools.ahk" readonly></label>
        <label class="native-field wide">Output folder<span class="input-with-action"><input value="dist\\ClipboardTools.exe" readonly><button type="button" data-utility-action="Output folder selected">Browse…</button></span></label>
        <label class="native-check wide"><input type="checkbox" checked> Include version metadata</label>
        <div class="utility-action-row wide"><button class="is-primary" type="button" data-utility-action="Release built successfully">Build release</button><button type="button" data-utility-action="Build settings saved">Save settings</button></div>
      </form>`
    }
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function selectDemo(name, animate = true) {
    const demo = demos[name];
    if (!demo || !demoOutput) return;
    currentDemoName = name;
    document.querySelectorAll('[data-ahk-feature]').forEach((button) => {
      const active = button.dataset.ahkFeature === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    demoFileNodes.forEach((node) => { node.textContent = demo.file; });
    appTitle.textContent = demo.appTitle;
    utilityHeading.textContent = demo.appTitle;
    utilityDescription.textContent = demo.description;
    utilityState.textContent = demo.state;
    utilityIcon.src = demo.icon;
    utilityContent.innerHTML = demo.content;
    desktop.querySelector('[data-window="studio"]').setAttribute('aria-label', demo.appTitle);
    utilityStatus.textContent = demo.status;
    if (!animate) return;
    demoOutput.classList.remove('is-running');
    void demoOutput.offsetWidth;
    demoOutput.classList.add('is-running');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      demoOutput.classList.remove('is-running');
    }, 520);
  }

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
    const utilityAction = event.target.closest('[data-utility-action]');

    if (event.target.closest('[data-start-button]')) {
      toggleStart();
      return;
    }
    if (demoButton) selectDemo(demoButton.dataset.ahkDemo);
    if (openButton) openWindow(openButton.dataset.openWindow);
    if (demoButton || openButton) toggleStart(false);
    if (utilityAction) {
      utilityStatus.textContent = utilityAction.dataset.utilityAction;
      demoOutput.classList.remove('is-running');
      void demoOutput.offsetWidth;
      demoOutput.classList.add('is-running');
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => {
        utilityStatus.textContent = demos[currentDemoName].status;
        demoOutput.classList.remove('is-running');
      }, 1100);
    }

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
