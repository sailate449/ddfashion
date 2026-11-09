var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    if (!("__unenv__" in performance)) {
      const proto = Performance.prototype;
      for (const key of Object.getOwnPropertyNames(proto)) {
        if (key !== "constructor" && !(key in performance)) {
          const desc = Object.getOwnPropertyDescriptor(proto, key);
          if (desc) {
            Object.defineProperty(performance, key, desc);
          }
        }
      }
    }
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {
      }
      unref() {
      }
      // --- unimplemented methods ---
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      // --- attached interfaces ---
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, workerdProcess, unenvProcess, exit, features, platform, _channel, _debugEnd, _debugProcess, _disconnect, _events, _eventsCount, _exiting, _fatalException, _getActiveHandles, _getActiveRequests, _handleQueue, _kill, _linkedBinding, _maxListeners, _pendingMessage, _preload_modules, _rawDebug, _send, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, abort, addListener, allowedNodeEnvironmentFlags, arch, argv, argv0, assert2, availableMemory, binding, channel, chdir, config, connected, constrainedMemory, cpuUsage, cwd, debugPort, disconnect, dlopen, domain, emit, emitWarning, env, eventNames, execArgv, execPath, exitCode, finalization, getActiveResourcesInfo, getegid, geteuid, getgid, getgroups, getMaxListeners, getuid, hasUncaughtExceptionCaptureCallback, hrtime3, initgroups, kill, listenerCount, listeners, loadEnvFile, mainModule, memoryUsage, moduleLoadList, nextTick, off, on, once, openStdin, permission, pid, ppid, prependListener, prependOnceListener, rawListeners, reallyExit, ref, release, removeAllListeners, removeListener, report, resourceUsage, send, setegid, seteuid, setgid, setgroups, setMaxListeners, setSourceMapsEnabled, setuid, setUncaughtExceptionCaptureCallback, sourceMapsEnabled, stderr, stdin, stdout, throwDeprecation, title, traceDeprecation, umask, unref, uptime, version, versions, _process, process_default;
var init_process2 = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    workerdProcess = getBuiltinModule("node:process");
    unenvProcess = new Process({
      env: globalProcess.env,
      hrtime,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess.nextTick
    });
    ({ exit, features, platform } = workerdProcess);
    ({
      _channel,
      _debugEnd,
      _debugProcess,
      _disconnect,
      _events,
      _eventsCount,
      _exiting,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _handleQueue,
      _kill,
      _linkedBinding,
      _maxListeners,
      _pendingMessage,
      _preload_modules,
      _rawDebug,
      _send,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      arch,
      argv,
      argv0,
      assert: assert2,
      availableMemory,
      binding,
      channel,
      chdir,
      config,
      connected,
      constrainedMemory,
      cpuUsage,
      cwd,
      debugPort,
      disconnect,
      dlopen,
      domain,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exitCode,
      finalization,
      getActiveResourcesInfo,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getMaxListeners,
      getuid,
      hasUncaughtExceptionCaptureCallback,
      hrtime: hrtime3,
      initgroups,
      kill,
      listenerCount,
      listeners,
      loadEnvFile,
      mainModule,
      memoryUsage,
      moduleLoadList,
      nextTick,
      off,
      on,
      once,
      openStdin,
      permission,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      reallyExit,
      ref,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      send,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setMaxListeners,
      setSourceMapsEnabled,
      setuid,
      setUncaughtExceptionCaptureCallback,
      sourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      throwDeprecation,
      title,
      traceDeprecation,
      umask,
      unref,
      uptime,
      version,
      versions
    } = unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// ../cloudflare/firebase-rest.js
var firebase_rest_exports = {};
__export(firebase_rest_exports, {
  FIELD_DELETE_SENTINEL: () => FIELD_DELETE_SENTINEL,
  JSON_HEADERS: () => JSON_HEADERS,
  commitFirestoreWrites: () => commitFirestoreWrites,
  createFirebaseCustomToken: () => createFirebaseCustomToken,
  createFirebaseUser: () => createFirebaseUser,
  createServiceAccountAccessToken: () => createServiceAccountAccessToken,
  decodeFirestoreFields: () => decodeFirestoreFields,
  decodeFirestoreValue: () => decodeFirestoreValue,
  deleteFirebaseUser: () => deleteFirebaseUser,
  encodeFirestoreFields: () => encodeFirestoreFields,
  encodeFirestoreValue: () => encodeFirestoreValue,
  firebaseAdminRequest: () => firebaseAdminRequest,
  firestoreDatabaseRoot: () => firestoreDatabaseRoot,
  firestoreDeleteWrite: () => firestoreDeleteWrite,
  firestoreRequest: () => firestoreRequest,
  firestoreUpdateWrite: () => firestoreUpdateWrite,
  getFirestoreDocument: () => getFirestoreDocument,
  jsonResponse: () => jsonResponse,
  listCollectionIds: () => listCollectionIds,
  lookupFirebaseUserByEmail: () => lookupFirebaseUserByEmail,
  normalizeEmail: () => normalizeEmail,
  resolveServerRole: () => resolveServerRole,
  runFirestoreTransaction: () => runFirestoreTransaction,
  runStructuredQuery: () => runStructuredQuery,
  sha256Hex: () => sha256Hex,
  updateFirebaseUser: () => updateFirebaseUser,
  verifyFirebaseIdToken: () => verifyFirebaseIdToken
});
function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}
function normalizeEmail(raw) {
  return String(raw || "").trim().toLowerCase();
}
function sha256Hex(value) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value))).then((bytes) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join(""));
}
function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function pemToBytes(pem) {
  const body = String(pem || "").replace(/\\n/g, "\n").replace(/^"|"$/g, "").replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  return base64UrlToBytes(body.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""));
}
async function getFirebaseSigningKeys() {
  const now = Date.now();
  if (cachedFirebaseKeys && now - cachedFirebaseKeysAt < 50 * 60 * 1e3) return cachedFirebaseKeys;
  const response = await fetch(FIREBASE_CERTS_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Unable to retrieve Firebase token verification keys.");
  const data = await response.json();
  cachedFirebaseKeys = data.keys || [];
  cachedFirebaseKeysAt = now;
  return cachedFirebaseKeys;
}
async function verifyFirebaseIdToken(token, env2) {
  const projectId = String(env2.FIREBASE_PROJECT_ID || "").trim();
  if (!projectId) throw new Error("Missing FIREBASE_PROJECT_ID Cloudflare variable.");
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid Firebase ID token.");
  const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[1])));
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported Firebase ID token signature.");
  const now = Math.floor(Date.now() / 1e3);
  if (claims.aud !== projectId || claims.iss !== `https://securetoken.google.com/${projectId}` || !claims.sub || typeof claims.sub !== "string" || claims.sub.length > 128 || !Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) || claims.iat > now + 300 || !Number.isFinite(claims.auth_time) || claims.auth_time > now + 300) {
    throw new Error("Invalid or expired Firebase ID token.");
  }
  const keyData = (await getFirebaseSigningKeys()).find((key) => key.kid === header.kid);
  if (!keyData) {
    cachedFirebaseKeys = null;
    const refreshed = await getFirebaseSigningKeys();
    const retryKey = refreshed.find((key) => key.kid === header.kid);
    if (!retryKey) throw new Error("Unrecognized Firebase token signing key.");
    return verifySignatureAndReturn(parts, retryKey, claims);
  }
  return verifySignatureAndReturn(parts, keyData, claims);
}
async function verifySignatureAndReturn(parts, jwk, claims) {
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!valid) throw new Error("Invalid Firebase ID token signature.");
  return { ...claims, uid: claims.sub };
}
async function createServiceAccountAccessToken(env2) {
  const now = Math.floor(Date.now() / 1e3);
  const clientEmail = String(env2.FIREBASE_CLIENT_EMAIL || "").trim();
  const privateKeyPem = String(env2.FIREBASE_PRIVATE_KEY || "").trim();
  const tokenKey = `${clientEmail}:${env2.FIREBASE_PROJECT_ID || ""}`;
  if (cachedAccessToken && cachedTokenKey === tokenKey && now < cachedAccessTokenUntil - 60) {
    return cachedAccessToken;
  }
  if (!clientEmail || !privateKeyPem) {
    throw new Error("Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY Cloudflare secret.");
  }
  const header = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({
    iss: clientEmail,
    scope: FIRESTORE_SCOPE,
    aud: OAUTH_TOKEN_URL,
    iat: now,
    exp: now + 3600
  })));
  const unsigned = `${header}.${payload}`;
  const signingKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToBytes(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", signingKey, new TextEncoder().encode(unsigned));
  const assertion = `${unsigned}.${bytesToBase64Url(signature)}`;
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error("Firebase service-account authorization failed.");
  cachedAccessToken = data.access_token;
  cachedTokenKey = tokenKey;
  cachedAccessTokenUntil = now + Math.min(Number(data.expires_in) || 3600, 3600);
  return cachedAccessToken;
}
function encodeFirestoreValue(value) {
  if (value === null || value === void 0) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeFirestoreValue) } };
  if (typeof value === "object") return { mapValue: { fields: encodeFirestoreFields(value) } };
  return { nullValue: null };
}
function encodeFirestoreFields(object) {
  const fields = {};
  for (const [key, value] of Object.entries(object || {})) {
    if (value === void 0 || value === FIELD_DELETE_SENTINEL) continue;
    fields[key] = encodeFirestoreValue(value);
  }
  return fields;
}
function decodeFirestoreValue(value) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ("mapValue" in value) return decodeFirestoreFields(value.mapValue.fields || {});
  return null;
}
function decodeFirestoreFields(fields) {
  const result = {};
  for (const [key, value] of Object.entries(fields || {})) result[key] = decodeFirestoreValue(value);
  return result;
}
function firestoreDatabaseRoot(env2) {
  const projectId = String(env2.FIREBASE_PROJECT_ID || "").trim();
  if (!projectId) throw new Error("Missing FIREBASE_PROJECT_ID Cloudflare variable.");
  return `${FIRESTORE_ROOT}/${encodeURIComponent(projectId)}/databases/(default)/documents`;
}
function firestoreDocumentUrl(env2, collectionPath, documentId) {
  const cleanCol = String(collectionPath).split("/").map(encodeURIComponent).join("/");
  return `${firestoreDatabaseRoot(env2)}/${cleanCol}/${encodeURIComponent(documentId)}`;
}
async function firestoreRequest(env2, url, options = {}) {
  const accessToken = await createServiceAccountAccessToken(env2);
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...options.headers || {} }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok && response.status !== 404) {
    const message = data.error?.message || `Firestore request failed (${response.status}).`;
    const error5 = new Error(message);
    error5.status = response.status;
    error5.firestoreStatus = data.error?.status;
    throw error5;
  }
  return { response, data };
}
async function getFirestoreDocument(env2, collection, documentId, transaction = null) {
  let url = firestoreDocumentUrl(env2, collection, documentId);
  if (transaction) url += `?transaction=${encodeURIComponent(transaction)}`;
  const { response, data } = await firestoreRequest(env2, url);
  if (response.status === 404) return { exists: false, id: String(documentId), data: {} };
  return { exists: true, id: String(documentId), data: decodeFirestoreFields(data.fields || {}) };
}
async function runStructuredQuery(env2, structuredQuery, parentPath = "", transaction = null) {
  const root = firestoreDatabaseRoot(env2);
  const url = parentPath ? `${root}/${parentPath}:runQuery` : `${root}:runQuery`;
  const body = { structuredQuery };
  if (transaction) body.transaction = transaction;
  const { data } = await firestoreRequest(env2, url, {
    method: "POST",
    body: JSON.stringify(body)
  });
  if (!Array.isArray(data)) return [];
  const results = [];
  for (const row of data) {
    if (row && row.document && row.document.name) {
      const parts = row.document.name.split("/");
      const id = decodeURIComponent(parts[parts.length - 1]);
      results.push({
        id,
        exists: true,
        data: decodeFirestoreFields(row.document.fields || {})
      });
    }
  }
  return results;
}
async function listCollectionIds(env2, parentDocPath = "") {
  const root = firestoreDatabaseRoot(env2);
  const url = parentDocPath ? `${root}/${parentDocPath}:listCollectionIds` : `${root}:listCollectionIds`;
  const { data } = await firestoreRequest(env2, url, {
    method: "POST",
    body: JSON.stringify({ pageSize: 200 })
  });
  return Array.isArray(data.collectionIds) ? data.collectionIds : [];
}
async function commitFirestoreWrites(env2, writes, transaction) {
  const url = `${firestoreDatabaseRoot(env2)}:commit`;
  const { data } = await firestoreRequest(env2, url, {
    method: "POST",
    body: JSON.stringify({ writes, ...transaction ? { transaction } : {} })
  });
  return data;
}
function firestoreUpdateWrite(collection, documentId, fields, options = {}) {
  const projectId = options.projectId || "";
  const cleanCol = String(collection).split("/").map(encodeURIComponent).join("/");
  const name = `${FIRESTORE_ROOT}/${encodeURIComponent(projectId)}/databases/(default)/documents/${cleanCol}/${encodeURIComponent(documentId)}`;
  const write = { update: { name, fields: encodeFirestoreFields(fields) } };
  if (options.fieldPaths?.length) write.updateMask = { fieldPaths: options.fieldPaths };
  if (options.exists !== void 0) write.currentDocument = { exists: options.exists };
  return write;
}
function resolveServerRole(email, env2) {
  const clean = normalizeEmail(email);
  const masterList = String(env2.ADMIN_MASTER_EMAIL || "sailate449@gmail.com").split(",").map(normalizeEmail).filter(Boolean);
  const staffList = String(env2.ADMIN_STAFF_EMAIL || "staff@gmail.com").split(",").map(normalizeEmail).filter(Boolean);
  if (masterList.includes(clean)) return "admin_master";
  if (staffList.includes(clean)) return "admin_staff";
  return "customer";
}
async function runFirestoreTransaction(env2, documentRefs, worker) {
  const root = firestoreDatabaseRoot(env2);
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: begun } = await firestoreRequest(env2, `${root}:beginTransaction`, {
      method: "POST",
      body: JSON.stringify({ options: { readWrite: {} } })
    });
    const transaction = begun.transaction;
    try {
      const snapshots = await Promise.all(documentRefs.map(async (ref2) => {
        const cleanCol = String(ref2.collection).split("/").map(encodeURIComponent).join("/");
        const url = `${root}/${cleanCol}/${encodeURIComponent(ref2.id)}?transaction=${encodeURIComponent(transaction)}`;
        const { response, data } = await firestoreRequest(env2, url);
        return response.status === 404 ? { exists: false, data: {} } : { exists: true, data: decodeFirestoreFields(data.fields || {}) };
      }));
      const outcome = await worker(snapshots);
      if (outcome.writes?.length) await commitFirestoreWrites(env2, outcome.writes, transaction);
      else await firestoreRequest(env2, `${root}:commit`, { method: "POST", body: JSON.stringify({ transaction }) });
      return outcome.result;
    } catch (error5) {
      await firestoreRequest(env2, `${root}:rollback`, {
        method: "POST",
        body: JSON.stringify({ transaction })
      }).catch(() => {
      });
      if (error5.firestoreStatus === "ABORTED" && attempt < 4) continue;
      throw error5;
    }
  }
  throw new Error("Firestore transaction could not be completed.");
}
function firestoreDeleteWrite(collection, documentId, projectId) {
  const cleanCol = String(collection).split("/").map(encodeURIComponent).join("/");
  return { delete: `${FIRESTORE_ROOT}/${encodeURIComponent(projectId)}/databases/(default)/documents/${cleanCol}/${encodeURIComponent(documentId)}` };
}
async function firebaseAdminRequest(env2, method, payload) {
  const projectId = String(env2.FIREBASE_PROJECT_ID || "").trim();
  const accessToken = await createServiceAccountAccessToken(env2);
  const apiKey = String(env2.FIREBASE_WEB_API_KEY || "").trim();
  if (!apiKey) throw new Error("Missing FIREBASE_WEB_API_KEY Cloudflare variable.");
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/${method}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error5 = new Error(data.error?.message || `Firebase Authentication request failed (${response.status}).`);
    error5.status = response.status;
    error5.authCode = data.error?.message || "";
    throw error5;
  }
  return data;
}
async function lookupFirebaseUserByEmail(env2, email) {
  const data = await firebaseAdminRequest(env2, "accounts:lookup", { email: [normalizeEmail(email)] });
  return (data.users || [])[0] || null;
}
async function createFirebaseUser(env2, user) {
  return firebaseAdminRequest(env2, "accounts", user);
}
async function updateFirebaseUser(env2, user) {
  return firebaseAdminRequest(env2, "accounts:update", user);
}
async function deleteFirebaseUser(env2, uid) {
  return firebaseAdminRequest(env2, "accounts:delete", { localId: uid });
}
async function createFirebaseCustomToken(env2, uid, claims = {}) {
  const now = Math.floor(Date.now() / 1e3);
  const clientEmail = String(env2.FIREBASE_CLIENT_EMAIL || "").trim();
  const privateKeyPem = String(env2.FIREBASE_PRIVATE_KEY || "").trim();
  if (!clientEmail || !privateKeyPem) throw new Error("Missing Firebase service-account secrets.");
  const header = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    iat: now,
    exp: now + 3600,
    uid,
    claims
  })));
  const unsigned = `${header}.${payload}`;
  const signingKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToBytes(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", signingKey, new TextEncoder().encode(unsigned));
  return `${unsigned}.${bytesToBase64Url(signature)}`;
}
var FIREBASE_CERTS_URL, OAUTH_TOKEN_URL, FIRESTORE_SCOPE, FIRESTORE_ROOT, cachedFirebaseKeys, cachedFirebaseKeysAt, cachedAccessToken, cachedAccessTokenUntil, cachedTokenKey, FIELD_DELETE_SENTINEL, JSON_HEADERS;
var init_firebase_rest = __esm({
  "../cloudflare/firebase-rest.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    FIREBASE_CERTS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
    OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
    FIRESTORE_SCOPE = "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit";
    FIRESTORE_ROOT = "https://firestore.googleapis.com/v1/projects";
    cachedFirebaseKeys = null;
    cachedFirebaseKeysAt = 0;
    cachedAccessToken = null;
    cachedAccessTokenUntil = 0;
    cachedTokenKey = "";
    FIELD_DELETE_SENTINEL = /* @__PURE__ */ Symbol.for("dd.firestore.field.delete");
    JSON_HEADERS = {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };
    __name(jsonResponse, "jsonResponse");
    __name(normalizeEmail, "normalizeEmail");
    __name(sha256Hex, "sha256Hex");
    __name(base64UrlToBytes, "base64UrlToBytes");
    __name(bytesToBase64Url, "bytesToBase64Url");
    __name(pemToBytes, "pemToBytes");
    __name(getFirebaseSigningKeys, "getFirebaseSigningKeys");
    __name(verifyFirebaseIdToken, "verifyFirebaseIdToken");
    __name(verifySignatureAndReturn, "verifySignatureAndReturn");
    __name(createServiceAccountAccessToken, "createServiceAccountAccessToken");
    __name(encodeFirestoreValue, "encodeFirestoreValue");
    __name(encodeFirestoreFields, "encodeFirestoreFields");
    __name(decodeFirestoreValue, "decodeFirestoreValue");
    __name(decodeFirestoreFields, "decodeFirestoreFields");
    __name(firestoreDatabaseRoot, "firestoreDatabaseRoot");
    __name(firestoreDocumentUrl, "firestoreDocumentUrl");
    __name(firestoreRequest, "firestoreRequest");
    __name(getFirestoreDocument, "getFirestoreDocument");
    __name(runStructuredQuery, "runStructuredQuery");
    __name(listCollectionIds, "listCollectionIds");
    __name(commitFirestoreWrites, "commitFirestoreWrites");
    __name(firestoreUpdateWrite, "firestoreUpdateWrite");
    __name(resolveServerRole, "resolveServerRole");
    __name(runFirestoreTransaction, "runFirestoreTransaction");
    __name(firestoreDeleteWrite, "firestoreDeleteWrite");
    __name(firebaseAdminRequest, "firebaseAdminRequest");
    __name(lookupFirebaseUserByEmail, "lookupFirebaseUserByEmail");
    __name(createFirebaseUser, "createFirebaseUser");
    __name(updateFirebaseUser, "updateFirebaseUser");
    __name(deleteFirebaseUser, "deleteFirebaseUser");
    __name(createFirebaseCustomToken, "createFirebaseCustomToken");
  }
});

// api/_cf-adapter.js
function sanitizeFieldPath(fp) {
  return String(fp).split(".").map((part) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(part) ? part : `\`${part.replace(/\`/g, "\\`")}\``).join(".");
}
function collectTopLevelFieldPaths(obj) {
  return Object.keys(obj || {}).map(sanitizeFieldPath);
}
function buildWriteOperation(projectId, type, docRef, data, options = {}) {
  if (type === "delete") {
    return firestoreDeleteWrite(docRef.collectionPath, docRef.id, projectId);
  }
  if (type === "create") {
    return firestoreUpdateWrite(docRef.collectionPath, docRef.id, data, {
      projectId,
      exists: false
    });
  }
  if (type === "update") {
    const fieldPaths = collectTopLevelFieldPaths(data);
    return firestoreUpdateWrite(docRef.collectionPath, docRef.id, data, {
      projectId,
      exists: true,
      fieldPaths
    });
  }
  if (options && options.merge === true) {
    const fieldPaths = collectTopLevelFieldPaths(data);
    return firestoreUpdateWrite(docRef.collectionPath, docRef.id, data, {
      projectId,
      fieldPaths
    });
  }
  return firestoreUpdateWrite(docRef.collectionPath, docRef.id, data, { projectId });
}
function createAdminCompat(env2) {
  const firestoreInstance = new FirestoreClient(env2);
  const authInstance = new AuthClient(env2);
  const firestoreFn = /* @__PURE__ */ __name(() => firestoreInstance, "firestoreFn");
  firestoreFn.FieldPath = {
    documentId: /* @__PURE__ */ __name(() => "__name__", "documentId")
  };
  firestoreFn.FieldValue = {
    delete: /* @__PURE__ */ __name(() => FIELD_DELETE_SENTINEL, "delete")
  };
  return {
    apps: [true],
    app: /* @__PURE__ */ __name(() => ({}), "app"),
    initializeApp: /* @__PURE__ */ __name(() => ({}), "initializeApp"),
    firestore: firestoreFn,
    auth: /* @__PURE__ */ __name(() => authInstance, "auth"),
    resolveServerRole: /* @__PURE__ */ __name((email) => resolveServerRole(email, env2), "resolveServerRole")
  };
}
function sha256HexSync(ascii) {
  const rightRotate = /* @__PURE__ */ __name((value, amount) => value >>> amount | value << 32 - amount, "rightRotate");
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = "";
  const bytes = new TextEncoder().encode(String(ascii));
  const bitLength = bytes.length * 8;
  let hash = sha256HexSync.h = sha256HexSync.h || [];
  const k = sha256HexSync.k = sha256HexSync.k || [];
  let primeCounter = k.length;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = mathPow(candidate, 0.5) * maxWord | 0;
      k[primeCounter++] = mathPow(candidate, 1 / 3) * maxWord | 0;
    }
  }
  hash = hash.slice(0, 8);
  const padded = new Uint8Array(bytes.length + 9 + 63 >> 6 << 6);
  padded.set(bytes);
  padded[bytes.length] = 128;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLength >>> 0, false);
  view.setUint32(padded.length - 8, Math.floor(bitLength / maxWord) >>> 0, false);
  for (let j = 0; j < padded.length; j += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(j + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ w[i - 15] >>> 3;
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ w[i - 2] >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 | 0;
    }
    let a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], h = hash[7];
    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = e & f ^ ~e & g;
      const temp1 = h + S1 + ch + k[i] + w[i] | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = a & b ^ a & c ^ b & c;
      const temp2 = S0 + maj | 0;
      h = g;
      g = f;
      f = e;
      e = d + temp1 | 0;
      d = c;
      c = b;
      b = a;
      a = temp1 + temp2 | 0;
    }
    hash[0] = hash[0] + a | 0;
    hash[1] = hash[1] + b | 0;
    hash[2] = hash[2] + c | 0;
    hash[3] = hash[3] + d | 0;
    hash[4] = hash[4] + e | 0;
    hash[5] = hash[5] + f | 0;
    hash[6] = hash[6] + g | 0;
    hash[7] = hash[7] + h | 0;
  }
  for (let i = 0; i < 8; i++) {
    result += (hash[i] >>> 0).toString(16).padStart(8, "0");
  }
  return result;
}
var OP_MAP, DocSnap, QuerySnap, DocRef, QueryRef, CollectionRef, WriteBatch, TransactionRunner, FirestoreClient, AuthClient, cryptoCompat, BufferCompat;
var init_cf_adapter = __esm({
  "api/_cf-adapter.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_firebase_rest();
    OP_MAP = {
      "==": "EQUAL",
      "<": "LESS_THAN",
      "<=": "LESS_THAN_OR_EQUAL",
      ">": "GREATER_THAN",
      ">=": "GREATER_THAN_OR_EQUAL",
      "!=": "NOT_EQUAL",
      "array-contains": "ARRAY_CONTAINS",
      "in": "IN"
    };
    __name(sanitizeFieldPath, "sanitizeFieldPath");
    __name(collectTopLevelFieldPaths, "collectTopLevelFieldPaths");
    DocSnap = class {
      static {
        __name(this, "DocSnap");
      }
      constructor(ref2, exists, dataObj) {
        this.ref = ref2;
        this.id = ref2.id;
        this.exists = Boolean(exists);
        this._data = dataObj || {};
      }
      data() {
        return this.exists ? { ...this._data } : void 0;
      }
    };
    QuerySnap = class {
      static {
        __name(this, "QuerySnap");
      }
      constructor(docs) {
        this.docs = docs || [];
        this.size = this.docs.length;
        this.empty = this.docs.length === 0;
      }
      forEach(cb) {
        this.docs.forEach(cb);
      }
    };
    DocRef = class {
      static {
        __name(this, "DocRef");
      }
      constructor(db, collectionPath, id) {
        this.db = db;
        this.collectionPath = String(collectionPath);
        this.id = String(id);
        this.path = `${this.collectionPath}/${this.id}`;
      }
      async get(transaction = null) {
        const res = await getFirestoreDocument(this.db.env, this.collectionPath, this.id, transaction);
        return new DocSnap(this, res.exists, res.data);
      }
      async set(data, options = {}) {
        const write = buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "set", this, data, options);
        await commitFirestoreWrites(this.db.env, [write]);
      }
      async create(data) {
        const write = buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "create", this, data);
        await commitFirestoreWrites(this.db.env, [write]);
      }
      async update(data) {
        const write = buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "update", this, data);
        await commitFirestoreWrites(this.db.env, [write]);
      }
      async delete() {
        const write = firestoreDeleteWrite(this.collectionPath, this.id, this.db.env.FIREBASE_PROJECT_ID);
        await commitFirestoreWrites(this.db.env, [write]);
      }
      async listCollections() {
        const ids = await listCollectionIds(this.db.env, this.path);
        return ids.map((subId) => new CollectionRef(this.db, `${this.path}/${subId}`));
      }
    };
    __name(buildWriteOperation, "buildWriteOperation");
    QueryRef = class _QueryRef {
      static {
        __name(this, "QueryRef");
      }
      constructor(db, collectionPath, filters = [], orders = [], limitCount = null, startAfterValues = null) {
        this.db = db;
        this.collectionPath = String(collectionPath);
        this._filters = filters;
        this._orders = orders;
        this._limit = limitCount;
        this._startAfter = startAfterValues;
      }
      where(field, op, value) {
        return new _QueryRef(
          this.db,
          this.collectionPath,
          [...this._filters, { field, op, value }],
          this._orders,
          this._limit,
          this._startAfter
        );
      }
      orderBy(field, direction = "asc") {
        const dir3 = String(direction || "asc").toLowerCase() === "desc" ? "DESCENDING" : "ASCENDING";
        return new _QueryRef(
          this.db,
          this.collectionPath,
          this._filters,
          [...this._orders, { field, dir: dir3 }],
          this._limit,
          this._startAfter
        );
      }
      limit(n) {
        return new _QueryRef(
          this.db,
          this.collectionPath,
          this._filters,
          this._orders,
          Number(n),
          this._startAfter
        );
      }
      startAfter(...values) {
        return new _QueryRef(
          this.db,
          this.collectionPath,
          this._filters,
          this._orders,
          this._limit,
          values
        );
      }
      async get(transaction = null) {
        const segments = this.collectionPath.split("/");
        const collectionId = segments[segments.length - 1];
        const parentPath = segments.length > 1 ? segments.slice(0, -1).join("/") : "";
        const rootDocPrefix = `${firestoreDatabaseRoot(this.db.env)}/${this.collectionPath}`;
        const structuredQuery = {
          from: [{ collectionId }]
        };
        if (this._filters.length === 1) {
          const f = this._filters[0];
          structuredQuery.where = {
            fieldFilter: {
              field: { fieldPath: f.field },
              op: OP_MAP[f.op] || "EQUAL",
              value: encodeFirestoreValue(f.value)
            }
          };
        } else if (this._filters.length > 1) {
          structuredQuery.where = {
            compositeFilter: {
              op: "AND",
              filters: this._filters.map((f) => ({
                fieldFilter: {
                  field: { fieldPath: f.field },
                  op: OP_MAP[f.op] || "EQUAL",
                  value: encodeFirestoreValue(f.value)
                }
              }))
            }
          };
        }
        if (this._orders.length > 0) {
          structuredQuery.orderBy = this._orders.map((o) => ({
            field: { fieldPath: o.field },
            direction: o.dir
          }));
        }
        if (this._startAfter && this._startAfter.length > 0) {
          structuredQuery.startAt = {
            before: false,
            values: this._startAfter.map((val, idx) => {
              const orderField = this._orders[idx]?.field;
              if (orderField === "__name__") {
                const fullRefName = String(val).startsWith("projects/") ? String(val) : `${rootDocPrefix.replace(/^https:\/\/firestore\.googleapis\.com\/v1\//, "")}/${encodeURIComponent(String(val))}`;
                return { referenceValue: fullRefName };
              }
              return encodeFirestoreValue(val);
            })
          };
        }
        if (this._limit !== null && Number.isFinite(this._limit)) {
          structuredQuery.limit = Math.max(1, Math.floor(this._limit));
        }
        const rawDocs = await runStructuredQuery(this.db.env, structuredQuery, parentPath, transaction);
        const snaps = rawDocs.map((item) => new DocSnap(new DocRef(this.db, this.collectionPath, item.id), true, item.data));
        return new QuerySnap(snaps);
      }
    };
    CollectionRef = class extends QueryRef {
      static {
        __name(this, "CollectionRef");
      }
      constructor(db, collectionPath) {
        super(db, collectionPath);
      }
      doc(id) {
        const docId = id ? String(id) : `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        return new DocRef(this.db, this.collectionPath, docId);
      }
    };
    WriteBatch = class {
      static {
        __name(this, "WriteBatch");
      }
      constructor(db) {
        this.db = db;
        this.writes = [];
      }
      set(docRef, data, options = {}) {
        this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "set", docRef, data, options));
        return this;
      }
      create(docRef, data) {
        this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "create", docRef, data));
        return this;
      }
      update(docRef, data) {
        this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "update", docRef, data));
        return this;
      }
      delete(docRef) {
        this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "delete", docRef));
        return this;
      }
      async commit() {
        if (!this.writes.length) return;
        await commitFirestoreWrites(this.db.env, this.writes);
      }
    };
    TransactionRunner = class {
      static {
        __name(this, "TransactionRunner");
      }
      constructor(db, transactionId) {
        this.db = db;
        this.transactionId = transactionId;
        this.writes = [];
      }
      async get(refOrQuery) {
        if (refOrQuery instanceof DocRef) {
          return refOrQuery.get(this.transactionId);
        }
        if (refOrQuery instanceof QueryRef) {
          return refOrQuery.get(this.transactionId);
        }
        throw new Error("Unsupported transaction get target.");
      }
      set(docRef, data, options = {}) {
        this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "set", docRef, data, options));
        return this;
      }
      create(docRef, data) {
        this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "create", docRef, data));
        return this;
      }
      update(docRef, data) {
        this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "update", docRef, data));
        return this;
      }
      delete(docRef) {
        this.writes.push(buildWriteOperation(this.db.env.FIREBASE_PROJECT_ID, "delete", docRef));
        return this;
      }
    };
    FirestoreClient = class {
      static {
        __name(this, "FirestoreClient");
      }
      constructor(env2) {
        this.env = env2;
      }
      collection(path) {
        return new CollectionRef(this, path);
      }
      batch() {
        return new WriteBatch(this);
      }
      async listCollections() {
        const ids = await listCollectionIds(this.env, "");
        return ids.map((id) => new CollectionRef(this, id));
      }
      async runTransaction(updateFunction) {
        const root = firestoreDatabaseRoot(this.env);
        for (let attempt = 0; attempt < 5; attempt++) {
          const { data: begun } = await firestoreRequest(this.env, `${root}:beginTransaction`, {
            method: "POST",
            body: JSON.stringify({ options: { readWrite: {} } })
          });
          const transactionId = begun.transaction;
          const tx = new TransactionRunner(this, transactionId);
          try {
            const result = await updateFunction(tx);
            if (tx.writes.length > 0) {
              await commitFirestoreWrites(this.env, tx.writes, transactionId);
            } else {
              await firestoreRequest(this.env, `${root}:commit`, {
                method: "POST",
                body: JSON.stringify({ transaction: transactionId })
              });
            }
            return result;
          } catch (error5) {
            await firestoreRequest(this.env, `${root}:rollback`, {
              method: "POST",
              body: JSON.stringify({ transaction: transactionId })
            }).catch(() => {
            });
            if (error5.firestoreStatus === "ABORTED" && attempt < 4) continue;
            throw error5;
          }
        }
        throw new Error("Firestore transaction could not be completed after retries.");
      }
    };
    AuthClient = class {
      static {
        __name(this, "AuthClient");
      }
      constructor(env2) {
        this.env = env2;
      }
      async verifyIdToken(idToken) {
        return verifyFirebaseIdToken(idToken, this.env);
      }
      async getUserByEmail(email) {
        const user = await lookupFirebaseUserByEmail(this.env, email);
        if (!user) {
          const err = new Error("There is no user record corresponding to the provided identifier.");
          err.code = "auth/user-not-found";
          throw err;
        }
        return {
          uid: user.localId,
          email: user.email,
          displayName: user.displayName || "",
          emailVerified: Boolean(user.emailVerified)
        };
      }
      async setCustomUserClaims(uid, claims) {
        await updateFirebaseUser(this.env, {
          localId: uid,
          customAttributes: JSON.stringify(claims || {})
        });
      }
    };
    __name(createAdminCompat, "createAdminCompat");
    __name(sha256HexSync, "sha256HexSync");
    cryptoCompat = {
      createHash(alg) {
        if (String(alg).toLowerCase() !== "sha256") throw new Error(`Unsupported hash: ${alg}`);
        let data = "";
        return {
          update(val) {
            data += String(val);
            return this;
          },
          digest(enc) {
            return sha256HexSync(data);
          }
        };
      },
      randomBytes(size) {
        const bytes = crypto.getRandomValues(new Uint8Array(size));
        return {
          toString(enc) {
            if (enc === "hex") return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
            return String.fromCharCode(...bytes);
          }
        };
      }
    };
    BufferCompat = {
      from(input, encoding = "utf8") {
        if (encoding === "base64") {
          const bin = atob(String(input));
          const arr = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          return arr;
        }
        const bytes = new TextEncoder().encode(String(input));
        return {
          toString(enc) {
            if (enc === "base64") {
              let bin = "";
              for (const b of bytes) bin += String.fromCharCode(b);
              return btoa(bin);
            }
            return new TextDecoder().decode(bytes);
          }
        };
      }
    };
  }
});

// api/chat-data.js
function cleanText(value) {
  return String(value || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, 2e3);
}
async function onRequest({ request, env: env2 }) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (request.method !== "POST") return jsonResponse(405, { ok: false, error: "Method Not Allowed" });
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) return jsonResponse(401, { ok: false, error: "Login \u101C\u102F\u1015\u103A\u1015\u103C\u102E\u1038\u1019\u103E Chat \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B" });
    let body = {};
    try {
      body = await request.json();
    } catch (_) {
      return jsonResponse(400, { ok: false, error: "Invalid JSON request body." });
    }
    const admin2 = createAdminCompat(env2);
    const auth = admin2.auth();
    const db = admin2.firestore();
    const decoded = await auth.verifyIdToken(token);
    const profileSnap = await db.collection("users").doc(decoded.uid).get();
    const profile3 = profileSnap.exists ? profileSnap.data() || {} : {};
    const role = ["admin_master", "admin_staff"].includes(profile3.role) ? profile3.role : "customer";
    const isAdmin = role === "admin_master" || role === "admin_staff";
    const action = String(body.action || "get").toLowerCase();
    const chatsRef = db.collection("customer_chats");
    if (action === "list") {
      if (!isAdmin) return jsonResponse(403, { ok: false, error: "Admin \u1001\u103D\u1004\u1037\u103A\u1015\u103C\u102F\u1001\u103B\u1000\u103A \u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B" });
      const snap = await chatsRef.orderBy("updatedAt", "desc").limit(500).get();
      const chats = {};
      snap.forEach((doc) => {
        chats[doc.id] = { ...doc.data(), id: doc.id };
      });
      return jsonResponse(200, { ok: true, chats });
    }
    if (action === "get") {
      const targetUid = isAdmin && body.userId ? String(body.userId) : decoded.uid;
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(targetUid)) return jsonResponse(400, { ok: false, error: "Invalid chat user." });
      if (!isAdmin && targetUid !== decoded.uid) return jsonResponse(403, { ok: false, error: "\u1000\u102D\u102F\u101A\u103A\u1015\u102D\u102F\u1004\u103A Chat \u1000\u102D\u102F\u101E\u102C \u1000\u103C\u100A\u1037\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B" });
      const snap = await chatsRef.doc(targetUid).get();
      return jsonResponse(200, { ok: true, chat: snap.exists ? { ...snap.data(), id: snap.id } : null });
    }
    if (action === "send_user" || action === "send_admin") {
      const text = cleanText(body.text);
      if (!text) return jsonResponse(400, { ok: false, error: "\u1005\u102C\u1010\u102D\u102F\u1021\u101C\u103D\u1010\u103A \u1015\u102D\u102F\u1037\u104D\u1019\u101B\u1015\u102B\u104B" });
      const targetUid = action === "send_admin" ? String(body.userId || "") : decoded.uid;
      if (action === "send_admin" && !isAdmin) return jsonResponse(403, { ok: false, error: "Admin \u1001\u103D\u1004\u1037\u103A\u1015\u103C\u102F\u1001\u103B\u1000\u103A \u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B" });
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(targetUid)) return jsonResponse(400, { ok: false, error: "Invalid chat user." });
      const ref2 = chatsRef.doc(targetUid);
      const now = Date.now();
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref2);
        const old = snap.exists ? snap.data() || {} : {};
        const messages = Array.isArray(old.messages) ? old.messages.slice(-299) : [];
        const sender = action === "send_admin" ? "admin" : "user";
        messages.push({ sender, senderUid: decoded.uid, text, time: now });
        const userSnap = action === "send_user" ? profileSnap : null;
        const displayName = String(old.name || profile3.name || decoded.name || decoded.email || "Customer").slice(0, 120);
        const next = {
          uid: targetUid,
          email: normalizeEmail(old.email || (action === "send_user" ? decoded.email : "")),
          name: displayName,
          messages,
          unreadAdmin: Math.max(0, Number(old.unreadAdmin || 0)) + (sender === "user" ? 1 : 0),
          unreadUser: sender === "admin" ? Math.max(0, Number(old.unreadUser || 0)) + 1 : Math.max(0, Number(old.unreadUser || 0)),
          createdAt: old.createdAt || now,
          updatedAt: now
        };
        if (sender === "user" && userSnap && userSnap.exists) {
          const user = userSnap.data() || {};
          next.name = String(user.name || user.email || displayName).slice(0, 120);
          next.email = normalizeEmail(user.email || decoded.email);
        }
        tx.set(ref2, next, { merge: true });
      });
      return jsonResponse(200, { ok: true, message: "\u1015\u102D\u102F\u1037\u1015\u103C\u102E\u1038\u1015\u102B\u1015\u103C\u102E\u104B" });
    }
    if (action === "mark_read") {
      const targetUid = isAdmin && body.userId ? String(body.userId) : decoded.uid;
      if (!isAdmin && targetUid !== decoded.uid) return jsonResponse(403, { ok: false, error: "Forbidden." });
      const ref2 = chatsRef.doc(targetUid);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref2);
        if (!snap.exists) return;
        tx.update(ref2, isAdmin ? { unreadAdmin: 0, updatedAt: Date.now() } : { unreadUser: 0, updatedAt: Date.now() });
      });
      return jsonResponse(200, { ok: true });
    }
    if (action === "migrate_legacy") {
      if (!isAdmin) return jsonResponse(403, { ok: false, error: "Admin \u1001\u103D\u1004\u1037\u103A\u1015\u103C\u102F\u1001\u103B\u1000\u103A \u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B" });
      const legacySnap = await db.collection("store_config").doc("chats").get();
      if (!legacySnap.exists || !legacySnap.data().threads) return jsonResponse(200, { ok: true, migrated: 0 });
      let migrated = 0;
      const threads = legacySnap.data().threads || {};
      for (const legacy of Object.values(threads)) {
        const email = normalizeEmail(legacy && legacy.name);
        if (!email || !email.includes("@")) continue;
        let user;
        try {
          user = await auth.getUserByEmail(email);
        } catch (_) {
          continue;
        }
        const uid = user.uid;
        const ref2 = chatsRef.doc(uid);
        await db.runTransaction(async (tx) => {
          const current = await tx.get(ref2);
          if (current.exists) return;
          const messages = (Array.isArray(legacy.messages) ? legacy.messages : []).slice(-300).map((m) => ({
            sender: m && m.sender === "admin" ? "admin" : "user",
            senderUid: m && m.sender === "admin" ? decoded.uid : uid,
            text: cleanText(m && m.text),
            time: Number(m && m.time) || Date.now()
          })).filter((m) => m.text);
          tx.create(ref2, {
            uid,
            email,
            name: email,
            messages,
            unreadAdmin: Math.max(0, Number(legacy.unreadAdmin || 0)),
            unreadUser: Math.max(0, Number(legacy.unreadUser || 0)),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            migratedFromLegacy: true
          });
        });
        migrated++;
      }
      return jsonResponse(200, { ok: true, migrated });
    }
    return jsonResponse(400, { ok: false, error: "Unknown chat action." });
  } catch (err) {
    console.error("Cloudflare chat-data error:", err);
    return jsonResponse(401, { ok: false, error: err.message || "Chat request failed." });
  }
}
var init_chat_data = __esm({
  "api/chat-data.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_firebase_rest();
    init_cf_adapter();
    __name(cleanText, "cleanText");
    __name(onRequest, "onRequest");
  }
});

// api/imagekit-auth.js
async function onRequest2({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  return jsonResponse(410, {
    ok: false,
    error: "Legacy ImageKit signature endpoint disabled. Use the secure imagekit-upload endpoint."
  });
}
var init_imagekit_auth = __esm({
  "api/imagekit-auth.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_firebase_rest();
    __name(onRequest2, "onRequest");
  }
});

// api/imagekit-upload.js
function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
async function onRequest3({ request, env: env2 }) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (request.method !== "POST") return jsonResponse(405, { ok: false, error: "Method Not Allowed" });
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) return jsonResponse(401, { ok: false, error: "Login \u101C\u102F\u1015\u103A\u1015\u103C\u102E\u1038\u1019\u103E \u1015\u102F\u1036\u1010\u1004\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B" });
    const decoded = await verifyFirebaseIdToken(token, env2);
    const uid = decoded.sub;
    const body = await request.json().catch(() => ({}));
    const purpose = String(body.purpose || "");
    const now = Date.now();
    const limitKey = `${uid}_${purpose}`.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 140);
    const maxUploads = purpose === "admin_asset" ? 30 : 20;
    await runFirestoreTransaction(env2, [{ collection: "image_upload_rate_limits", id: limitKey }], ([snap]) => {
      const current = snap.exists ? snap.data || {} : {};
      const windowStart = Number(current.windowStart || 0);
      const active = windowStart > 0 && now - windowStart < 10 * 60 * 1e3;
      const count3 = active ? Math.max(0, Number(current.count) || 0) : 0;
      if (count3 >= maxUploads) {
        throw new Error("\u1015\u102F\u1036\u1010\u1004\u103A\u1019\u103E\u102F \u1021\u1000\u103C\u102D\u1019\u103A\u101B\u1031 \u1000\u1014\u1037\u103A\u101E\u1010\u103A\u1001\u103B\u1000\u103A \u1015\u103C\u100A\u1037\u103A\u101E\u103D\u102C\u1038\u1015\u102B\u1015\u103C\u102E\u104B \u1041\u1040 \u1019\u102D\u1014\u1005\u103A\u1021\u1000\u103C\u102C \u1015\u103C\u1014\u103A\u1000\u103C\u102D\u102F\u1038\u1005\u102C\u1038\u1015\u102B\u104B");
      }
      return {
        writes: [
          firestoreUpdateWrite("image_upload_rate_limits", limitKey, {
            uid,
            purpose,
            windowStart: active ? windowStart : now,
            count: count3 + 1,
            updatedAt: now
          }, { projectId: env2.FIREBASE_PROJECT_ID, exists: snap.exists })
        ],
        result: true
      };
    });
    const mimeType = String(body.mimeType || "").toLowerCase();
    const allowedMime = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMime.includes(mimeType)) throw new Error("JPEG, PNG, WebP \u1015\u102F\u1036\u1016\u102D\u102F\u1004\u103A\u1019\u103B\u102C\u1038\u101E\u102C \u1010\u1004\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
    const base64 = String(body.fileBase64 || "").replace(/^data:[^,]+,/, "");
    if (!base64 || base64.length > 56e5) throw new Error("\u1015\u102F\u1036\u1016\u102D\u102F\u1004\u103A\u1021\u101B\u103D\u101A\u103A\u1021\u1005\u102C\u1038 4MB \u1011\u1000\u103A \u1019\u1000\u103B\u1031\u102C\u103A\u101B\u1015\u102B\u104B");
    const bytes = base64ToUint8Array(base64);
    if (!bytes.length || bytes.length > 4 * 1024 * 1024) throw new Error("\u1015\u102F\u1036\u1016\u102D\u102F\u1004\u103A\u1021\u101B\u103D\u101A\u103A\u1021\u1005\u102C\u1038 4MB \u1011\u1000\u103A \u1019\u1000\u103B\u1031\u102C\u103A\u101B\u1015\u102B\u104B");
    const pngSig = [137, 80, 78, 71, 13, 10, 26, 10];
    const isJpeg = bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const isPng = bytes.length > 8 && pngSig.every((b, idx) => bytes[idx] === b);
    const isWebp = bytes.length > 12 && String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" && String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP";
    if (!(isJpeg || isPng || isWebp)) throw new Error("\u1015\u102F\u1036\u1016\u102D\u102F\u1004\u103A\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1000\u102D\u102F \u1021\u1010\u100A\u103A\u1019\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u104B JPEG, PNG, WebP \u101E\u102C \u1010\u1004\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
    const actualMime = isJpeg ? "image/jpeg" : isPng ? "image/png" : "image/webp";
    if (actualMime !== mimeType) throw new Error("\u1015\u102F\u1036\u1016\u102D\u102F\u1004\u103A MIME Type \u1014\u103E\u1004\u1037\u103A File Content \u1019\u1000\u102D\u102F\u1000\u103A\u100A\u102E\u1015\u102B\u104B");
    const fileName = String(body.fileName || `dd-fashion-${Date.now()}.jpg`).replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 100);
    const isAdminAsset = purpose === "admin_asset";
    let folder = "";
    if (purpose === "customer_upload") {
      const productId = String(body.productId || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 100);
      if (!productId) throw new Error("Review \u1015\u102F\u1036\u1021\u1010\u103D\u1000\u103A Product ID \u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
      folder = `/production/reviews/${uid}/${productId}`;
    } else if (isAdminAsset) {
      const userSnap = await getFirestoreDocument(env2, "users", uid);
      const profileRole = userSnap.exists ? String((userSnap.data || {}).role || "") : "";
      const role = ["admin_master", "admin_staff"].includes(profileRole) ? profileRole : "customer";
      if (!["admin_master", "admin_staff"].includes(role)) throw new Error("Admin \u1001\u103D\u1004\u1037\u103A\u1015\u103C\u102F\u1001\u103B\u1000\u103A\u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
      const assetType = String(body.assetType || "products");
      const allowedFolders = { products: "products", promotions: "promotions", "payment-qr": "payment-qr" };
      if (!allowedFolders[assetType]) throw new Error("Upload folder \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
      folder = `/production/${allowedFolders[assetType]}`;
    } else {
      throw new Error("Upload purpose \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
    }
    const privateKey = String(env2.IMAGEKIT_PRIVATE_KEY || "").trim();
    if (!privateKey || !env2.IMAGEKIT_PUBLIC_KEY || !env2.IMAGEKIT_URL_ENDPOINT) {
      throw new Error("ImageKit Environment Variables \u1019\u1015\u103C\u100A\u1037\u103A\u1005\u102F\u1036\u1015\u102B\u104B");
    }
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: actualMime }), fileName);
    form.append("fileName", fileName);
    form.append("folder", folder);
    form.append("useUniqueFileName", "true");
    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: `Basic ${btoa(`${privateKey}:`)}` },
      body: form
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) throw new Error(data.message || `ImageKit upload failed (${response.status})`);
    return jsonResponse(200, { ok: true, url: data.url, fileId: data.fileId, folder });
  } catch (error5) {
    console.error("Cloudflare imagekit-upload error:", error5.message);
    return jsonResponse(400, { ok: false, error: error5.message || "Image upload failed." });
  }
}
var init_imagekit_upload = __esm({
  "api/imagekit-upload.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_firebase_rest();
    __name(base64ToUint8Array, "base64ToUint8Array");
    __name(onRequest3, "onRequest");
  }
});

// api/_otp.js
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}
function getClientIp(request) {
  return String(request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown").split(",")[0].trim();
}
function generateSixDigitOtp() {
  const bytes = new Uint32Array(1);
  const limit = Math.floor(4294967296 / 9e5) * 9e5;
  do {
    crypto.getRandomValues(bytes);
  } while (bytes[0] >= limit);
  return String(1e5 + bytes[0] % 9e5);
}
function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((v) => v.toString(16).padStart(2, "0")).join("");
}
async function hashOtpWithSalt(otp, salt, env2) {
  const pepper = String(env2.FIREBASE_PRIVATE_KEY || "").slice(0, 32) || "ddfashion-otp-pepper-2026";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pepper), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${salt}:${String(otp).trim()}`));
  return [...new Uint8Array(signature)].map((v) => v.toString(16).padStart(2, "0")).join("");
}
function constantTimeEqualHex(a, b) {
  const left = String(a || "").toLowerCase();
  const right = String(b || "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(left) || !/^[0-9a-f]{64}$/.test(right)) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}
function getEmailJsConfig(env2) {
  const serviceId = String(env2.EMAILJS_SERVICE_ID || "").trim();
  const templateId = String(env2.EMAILJS_TEMPLATE_ID || "").trim();
  const publicKey = String(env2.EMAILJS_PUBLIC_KEY || "").trim();
  const privateKey = String(env2.EMAILJS_PRIVATE_KEY || "").trim();
  if (!serviceId || !templateId || !publicKey) {
    throw new Error("Missing EmailJS environment variables (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY).");
  }
  return { serviceId, templateId, publicKey, privateKey };
}
function otpChallengeId(purpose, emailHash) {
  return `${purpose}_${emailHash}`;
}
var OTP_EXPIRY_MS, RESEND_COOLDOWN_MS, MAX_OTP_ATTEMPTS, HOURLY_WINDOW_MS, MAX_EMAIL_OTP_PER_HOUR, MAX_IP_OTP_PER_HOUR;
var init_otp = __esm({
  "api/_otp.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_firebase_rest();
    OTP_EXPIRY_MS = 15 * 60 * 1e3;
    RESEND_COOLDOWN_MS = 60 * 1e3;
    MAX_OTP_ATTEMPTS = 5;
    HOURLY_WINDOW_MS = 60 * 60 * 1e3;
    MAX_EMAIL_OTP_PER_HOUR = 5;
    MAX_IP_OTP_PER_HOUR = 15;
    __name(isValidEmail, "isValidEmail");
    __name(getClientIp, "getClientIp");
    __name(generateSixDigitOtp, "generateSixDigitOtp");
    __name(randomSalt, "randomSalt");
    __name(hashOtpWithSalt, "hashOtpWithSalt");
    __name(constantTimeEqualHex, "constantTimeEqualHex");
    __name(getEmailJsConfig, "getEmailJsConfig");
    __name(otpChallengeId, "otpChallengeId");
  }
});

// api/send-otp.js
function error3(status, payload) {
  return jsonResponse(status, { ok: false, ...payload });
}
async function onRequest4({ request, env: env2 }) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  } });
  if (request.method !== "POST") return error3(405, { error: "Method Not Allowed" });
  try {
    let body;
    try {
      body = await request.json();
    } catch (_) {
      return error3(400, { error: "Invalid JSON request body." });
    }
    const email = normalizeEmail(body.email);
    const purpose = ["reset", "login"].includes(body.purpose) ? body.purpose : "register";
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");
    if (!isValidEmail(email)) return error3(400, { error: "\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u101E\u1031\u102C Email \u101C\u102D\u1015\u103A\u1005\u102C \u1011\u100A\u1037\u103A\u101E\u103D\u1004\u103A\u1038\u1015\u1031\u1038\u1015\u102B\u101B\u1014\u103A\u104B (Please enter a valid email address.)" });
    if (purpose === "register" && password !== confirmPassword) return error3(400, { error: "Password \u1014\u103E\u1004\u1037\u103A Confirm Password \u1019\u1010\u1030\u100A\u102E\u1015\u102B\u104B" });
    if (purpose === "register" && password.length < 6) return error3(400, { error: "Password \u101E\u100A\u103A \u1021\u1014\u100A\u103A\u1038\u1006\u102F\u1036\u1038 (\u1046) \u101C\u102F\u1036\u1038 \u101B\u103E\u102D\u101B\u1015\u102B\u1019\u100A\u103A\u104B (Password must be at least 6 characters.)" });
    const existingUser = await lookupFirebaseUserByEmail(env2, email);
    if (purpose === "register" && existingUser) return error3(409, { code: "EMAIL_EXISTS", error: "\u1024 Email \u1016\u103C\u1004\u1037\u103A \u1021\u1000\u1031\u102C\u1004\u1037\u103A\u101B\u103E\u102D\u1015\u103C\u102E\u1038\u101E\u102C\u1038\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B Login \u101D\u1004\u103A\u1015\u102B\u104B (Account already exists for this email.)" });
    if (purpose !== "register" && !existingUser) return error3(404, { code: "USER_NOT_FOUND", error: "\u1024 Email \u1016\u103C\u1004\u1037\u103A \u1021\u1000\u1031\u102C\u1004\u1037\u103A\u1019\u1010\u103D\u1031\u1037\u1015\u102B\u104B Register \u1021\u101B\u1004\u103A\u101C\u102F\u1015\u103A\u1015\u102B\u104B" });
    const { serviceId, templateId, publicKey, privateKey } = getEmailJsConfig(env2);
    const now = Date.now();
    const clientIp = getClientIp(request);
    const clientIpHash = await sha256Hex(clientIp);
    const ipKey = `ip_${await sha256Hex(clientIp)}`;
    const emailKey = otpChallengeId(purpose, await sha256Hex(email));
    const otpCode = generateSixDigitOtp();
    const salt = randomSalt();
    const otpHash = await hashOtpWithSalt(otpCode, salt, env2);
    const expiresAt = now + OTP_EXPIRY_MS;
    const reservation = await runFirestoreTransaction(env2, [
      { collection: "otp_rate_limits", id: ipKey },
      { collection: "otp_challenges", id: emailKey }
    ], ([ipSnap, challengeSnap]) => {
      const ipData = ipSnap.data || {};
      const challengeData = challengeSnap.data || {};
      const ipWindowStart = Number(ipData.windowStart || 0);
      const ipCount = Number(ipData.count || 0);
      if (ipSnap.exists && now - ipWindowStart < HOURLY_WINDOW_MS && ipCount >= MAX_IP_OTP_PER_HOUR) return { writes: [], result: { blocked: "ip" } };
      const lastSentAt = Number(challengeData.lastSentAt || 0);
      if (challengeSnap.exists && now - lastSentAt < RESEND_COOLDOWN_MS) {
        return { writes: [], result: { blocked: "cooldown", retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1e3) } };
      }
      const emailWindowStart = Number(challengeData.windowStart || 0);
      const emailSendCount = challengeSnap.exists && now - emailWindowStart < HOURLY_WINDOW_MS ? Number(challengeData.sendCount || 0) : 0;
      if (emailSendCount >= MAX_EMAIL_OTP_PER_HOUR) return { writes: [], result: { blocked: "email" } };
      const nextChallenge = {
        email,
        purpose,
        otpHash,
        salt,
        attempts: 0,
        maxAttempts: MAX_OTP_ATTEMPTS,
        createdAt: now,
        lastSentAt: now,
        expiresAt,
        windowStart: emailSendCount ? emailWindowStart : now,
        sendCount: emailSendCount + 1,
        clientIpHash,
        verified: false,
        consumedAt: null,
        status: "active"
      };
      const nextIp = {
        windowStart: !ipSnap.exists || now - ipWindowStart >= HOURLY_WINDOW_MS ? now : ipWindowStart,
        count: !ipSnap.exists || now - ipWindowStart >= HOURLY_WINDOW_MS ? 1 : ipCount + 1,
        updatedAt: now
      };
      return { writes: [
        firestoreUpdateWrite("otp_challenges", emailKey, nextChallenge, { projectId: env2.FIREBASE_PROJECT_ID, exists: challengeSnap.exists }),
        firestoreUpdateWrite("otp_rate_limits", ipKey, nextIp, { projectId: env2.FIREBASE_PROJECT_ID, exists: ipSnap.exists })
      ], result: { ok: true } };
    });
    if (reservation.blocked === "ip") return error3(429, { code: "RATE_LIMITED_IP", error: "OTP \u1010\u1031\u102C\u1004\u103A\u1038\u1006\u102D\u102F\u1019\u103E\u102F \u1021\u1000\u103C\u102D\u1019\u103A\u101B\u1031 \u1019\u103B\u102C\u1038\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104B \u1001\u1031\u1010\u1039\u1010\u1005\u1031\u102C\u1004\u1037\u103A\u1006\u102D\u102F\u1004\u103A\u1038\u1015\u103C\u102E\u1038\u1019\u103E \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1000\u103C\u102D\u102F\u1038\u1005\u102C\u1038\u1015\u102B\u104B" });
    if (reservation.blocked === "cooldown") return error3(429, { code: "COOLDOWN_ACTIVE", retryAfterSeconds: reservation.retryAfterSeconds, error: `OTP \u1000\u102F\u1012\u103A\u1021\u101E\u1005\u103A \u1011\u1015\u103A\u1019\u1036\u1010\u1031\u102C\u1004\u103A\u1038\u1006\u102D\u102F\u101B\u1014\u103A ${reservation.retryAfterSeconds} \u1005\u1000\u1039\u1000\u1014\u1037\u103A \u1005\u1031\u102C\u1004\u1037\u103A\u1006\u102D\u102F\u1004\u103A\u1038\u1015\u1031\u1038\u1015\u102B\u104B` });
    if (reservation.blocked === "email") return error3(429, { code: "RATE_LIMITED_EMAIL", error: "\u1041 \u1014\u102C\u101B\u102E\u1021\u1010\u103D\u1004\u103A\u1038 OTP \u1010\u1031\u102C\u1004\u103A\u1038\u1006\u102D\u102F\u1014\u102D\u102F\u1004\u103A\u101E\u100A\u1037\u103A \u1021\u1000\u103C\u102D\u1019\u103A\u101B\u1031 \u1015\u103C\u100A\u1037\u103A\u101E\u103D\u102C\u1038\u1015\u102B\u1015\u103C\u102E\u104B \u1014\u1031\u102C\u1000\u103A\u1019\u103E \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1000\u103C\u102D\u102F\u1038\u1005\u102C\u1038\u1015\u102B\u104B" });
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: email,
        user_email: email,
        email,
        to_name: email.split("@")[0],
        otp_code: otpCode,
        passcode: otpCode,
        code: otpCode,
        shop_name: "DD Fashion Boutique",
        purpose: purpose === "register" ? "Account Registration" : purpose === "login" ? "Login Verification" : "Password Reset",
        expiry_minutes: "15",
        message: `\u101E\u1004\u103A\u104F DD Fashion Verification Code (OTP) \u1019\u103E\u102C ${otpCode} \u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B (\u1041\u1045 \u1019\u102D\u1014\u1005\u103A\u1021\u1010\u103D\u1004\u103A\u1038 \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1015\u102B)`
      }
    };
    if (privateKey) payload.accessToken = privateKey;
    const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: request.headers.get("Origin") || env2.SITE_URL || "https://ddfashion.netlify.app" },
      body: JSON.stringify(payload)
    });
    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      await removeChallengeOnDeliveryFailure(env2, emailKey, otpHash);
      console.error("Cloudflare EmailJS delivery failed:", emailResponse.status, errText.slice(0, 500));
      return error3(502, { code: "EMAIL_DELIVERY_FAILED", error: "Email \u1015\u1031\u1038\u1015\u102D\u102F\u1037\u101B\u102C\u1010\u103D\u1004\u103A \u1021\u1001\u1000\u103A\u1021\u1001\u1032\u101B\u103E\u102D\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104B EmailJS Settings \u1000\u102D\u102F \u1005\u1005\u103A\u1006\u1031\u1038\u1015\u102B\u104B" });
    }
    return jsonResponse(200, {
      ok: true,
      email,
      purpose,
      expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1e3),
      cooldownSeconds: Math.floor(RESEND_COOLDOWN_MS / 1e3),
      message: `\u2713 ${email} \u101E\u102D\u102F\u1037 \u1002\u100F\u1014\u103A\u1038 (\u1046) \u101C\u102F\u1036\u1038 OTP \u1000\u102F\u1012\u103A \u1015\u1031\u1038\u1015\u102D\u102F\u1037\u1015\u103C\u102E\u1038\u1015\u102B\u1015\u103C\u102E! (\u1041\u1045 \u1019\u102D\u1014\u1005\u103A\u1021\u1010\u103D\u1004\u103A\u1038 \u101B\u102D\u102F\u1000\u103A\u1011\u100A\u1037\u103A\u1015\u102B)`
    });
  } catch (err) {
    console.error("Cloudflare send-otp error:", err);
    return error3(500, { error: err.message || "OTP \u1015\u1031\u1038\u1015\u102D\u102F\u1037\u101B\u102C\u1010\u103D\u1004\u103A Server \u1021\u1019\u103E\u102C\u1038\u1021\u101A\u103D\u1004\u103A\u1038 \u1016\u103C\u1005\u103A\u1015\u1031\u102B\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104B" });
  }
}
async function removeChallengeOnDeliveryFailure(env2, emailKey, otpHash) {
  const { runFirestoreTransaction: runFirestoreTransaction2, firestoreDeleteWrite: firestoreDeleteWrite2 } = await Promise.resolve().then(() => (init_firebase_rest(), firebase_rest_exports));
  await runFirestoreTransaction2(env2, [{ collection: "otp_challenges", id: emailKey }], ([snap]) => ({
    writes: snap.exists && snap.data.otpHash === otpHash ? [firestoreDeleteWrite2("otp_challenges", emailKey, env2.FIREBASE_PROJECT_ID)] : [],
    result: null
  }));
}
var init_send_otp = __esm({
  "api/send-otp.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_firebase_rest();
    init_otp();
    __name(error3, "error");
    __name(onRequest4, "onRequest");
    __name(removeChallengeOnDeliveryFailure, "removeChallengeOnDeliveryFailure");
  }
});

// api/_financial-safety.js
function finiteWhole(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}
function normalizeFinancialSafety(input = {}) {
  const source = input || {};
  return {
    maxTotalDiscountPercent: Math.min(90, Math.max(1, finiteWhole(source.maxTotalDiscountPercent, DEFAULT_FINANCIAL_SAFETY.maxTotalDiscountPercent))),
    maxTotalDiscountAmount: Math.min(1e9, Math.max(0, finiteWhole(source.maxTotalDiscountAmount, DEFAULT_FINANCIAL_SAFETY.maxTotalDiscountAmount))),
    maxCashbackUsePercent: Math.min(100, Math.max(1, finiteWhole(source.maxCashbackUsePercent, DEFAULT_FINANCIAL_SAFETY.maxCashbackUsePercent))),
    allowCouponWithPoints: source.allowCouponWithPoints === true,
    allowCouponWithCashback: source.allowCouponWithCashback === true,
    allowPointsWithCashback: source.allowPointsWithCashback === true,
    // Cashback tier/order caps are intentionally retired. Admin-defined
    // Monthly and Lifetime reward values are paid as configured.
    maxCashbackRewardPerTier: 1e8,
    maxCashbackRewardPerOrder: 1e8,
    maxReviewPointsPerReview: Math.min(1e6, Math.max(1, finiteWhole(source.maxReviewPointsPerReview, DEFAULT_FINANCIAL_SAFETY.maxReviewPointsPerReview)))
  };
}
function totalDiscountCap(subtotal, settings) {
  const s = normalizeFinancialSafety(settings);
  const byPercent = Math.floor(Math.max(0, Number(subtotal) || 0) * s.maxTotalDiscountPercent / 100);
  return s.maxTotalDiscountAmount > 0 ? Math.min(byPercent, s.maxTotalDiscountAmount) : byPercent;
}
function cashbackUseCap(remainingBeforeCashback, rawSubtotal, discountsAlreadyUsed, minPayable, settings) {
  const remaining = Number(remainingBeforeCashback);
  const subtotal = Number(rawSubtotal);
  const used = Number(discountsAlreadyUsed);
  const minimum = Number(minPayable);
  if (![remaining, subtotal, used, minimum].every(Number.isFinite) || remaining < 0 || subtotal < 0 || used < 0 || minimum < 0) {
    throw new Error("Cashback \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1001\u103D\u1004\u1037\u103A \u1000\u1014\u1037\u103A\u101E\u1010\u103A\u1001\u103B\u1000\u103A\u1010\u103D\u1000\u103A\u1001\u103B\u1000\u103A\u1019\u103E\u102F \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
  }
  const s = normalizeFinancialSafety(settings);
  const percentCap = Math.floor(remaining * s.maxCashbackUsePercent / 100);
  const payableCap = Math.max(0, remaining - minimum);
  const globalDiscountCap = Math.max(0, totalDiscountCap(subtotal, s) - used);
  return Math.max(0, Math.min(percentCap, payableCap, globalDiscountCap));
}
function assertTotalDiscountWithinCap(subtotal, discountAmounts, settings) {
  const baseSubtotal = Number(subtotal);
  if (!Number.isFinite(baseSubtotal) || baseSubtotal < 0) throw new Error("Order \u1005\u102F\u1005\u102F\u1015\u1031\u102B\u1004\u103A\u1038\u1010\u1014\u103A\u1016\u102D\u102F\u1038 \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
  const values = Array.isArray(discountAmounts) ? discountAmounts : [discountAmounts];
  let total = 0;
  for (const amount of values) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) throw new Error("Discount \u1015\u1019\u102C\u100F \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
    total += value;
    if (!Number.isFinite(total)) throw new Error("\u1005\u102F\u1005\u102F\u1015\u1031\u102B\u1004\u103A\u1038 Discount \u1015\u1019\u102C\u100F \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
  }
  const cap = totalDiscountCap(baseSubtotal, settings);
  if (total > cap) throw new Error(`\u1005\u102F\u1005\u102F\u1015\u1031\u102B\u1004\u103A\u1038 Discount \u1021\u1019\u103B\u102C\u1038\u1006\u102F\u1036\u1038 ${cap.toLocaleString()} Ks \u101E\u102C \u1001\u103D\u1004\u1037\u103A\u1015\u103C\u102F\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B \u101C\u1000\u103A\u101B\u103E\u102D ${total.toLocaleString()} Ks \u1016\u103C\u1005\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104B`);
  return { total, cap };
}
function assertStackingAllowed({ coupon = false, points = false, cashback = false }, settings) {
  const s = normalizeFinancialSafety(settings);
  if (coupon && points && !s.allowCouponWithPoints) throw new Error("Admin \u101E\u1010\u103A\u1019\u103E\u1010\u103A\u1001\u103B\u1000\u103A\u1021\u101B Coupon \u1014\u103E\u1004\u1037\u103A Points \u1000\u102D\u102F \u1010\u1005\u103A\u1001\u102B\u1010\u100A\u103A\u1038 \u1021\u101E\u102F\u1036\u1038\u1019\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u104B");
  if (coupon && cashback && !s.allowCouponWithCashback) throw new Error("Admin \u101E\u1010\u103A\u1019\u103E\u1010\u103A\u1001\u103B\u1000\u103A\u1021\u101B Coupon \u1014\u103E\u1004\u1037\u103A Cashback \u1000\u102D\u102F \u1010\u1005\u103A\u1001\u102B\u1010\u100A\u103A\u1038 \u1021\u101E\u102F\u1036\u1038\u1019\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u104B");
  if (points && cashback && !s.allowPointsWithCashback) throw new Error("Admin \u101E\u1010\u103A\u1019\u103E\u1010\u103A\u1001\u103B\u1000\u103A\u1021\u101B Points \u1014\u103E\u1004\u1037\u103A Cashback \u1000\u102D\u102F \u1010\u1005\u103A\u1001\u102B\u1010\u100A\u103A\u1038 \u1021\u101E\u102F\u1036\u1038\u1019\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u104B");
}
function getPromoUsageLimits(promo = {}) {
  const rawTotal = promo.totalUsageLimit;
  const parsedTotal = Number(rawTotal);
  const total = rawTotal === void 0 || rawTotal === null || rawTotal === "" ? DEFAULT_PROMO_TOTAL_USAGE_LIMIT : Number.isFinite(parsedTotal) && parsedTotal >= 0 ? Math.floor(parsedTotal) : 1;
  const perUser = finiteWhole(promo.perUserUsageLimit, 1);
  return {
    total: Math.max(0, Math.min(1e7, total)),
    perUser: Math.max(1, Math.min(1e3, perUser))
  };
}
function assertPromoUsageAllowed(promo, totalUsed, userUsed) {
  const limits = getPromoUsageLimits(promo);
  const safeCount = /* @__PURE__ */ __name((value) => {
    if (value === void 0 || value === null || value === "") return 0;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : Number.MAX_SAFE_INTEGER;
  }, "safeCount");
  if (limits.total > 0 && safeCount(totalUsed) >= limits.total) throw new Error("\u1024 Promotion Coupon \u104F \u1005\u102F\u1005\u102F\u1015\u1031\u102B\u1004\u103A\u1038\u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1001\u103D\u1004\u1037\u103A \u1015\u103C\u100A\u1037\u103A\u101E\u103D\u102C\u1038\u1015\u102B\u1015\u103C\u102E\u104B");
  if (safeCount(userUsed) >= limits.perUser) throw new Error(`\u1024 Coupon \u1000\u102D\u102F Customer \u1010\u1005\u103A\u1026\u1038\u101C\u103B\u103E\u1004\u103A ${limits.perUser} \u1000\u103C\u102D\u1019\u103A\u101E\u102C \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B`);
  return limits;
}
function validateRewardCaps(settings) {
  const s = normalizeFinancialSafety(settings);
  const review4 = finiteWhole(settings.points4Star, 0);
  const review5 = finiteWhole(settings.points5Star, 0);
  const photo = finiteWhole(settings.photoBonusPoints, 0);
  if (review4 < 0 || review5 < 0 || photo < 0 || review4 + photo > s.maxReviewPointsPerReview || review5 + photo > s.maxReviewPointsPerReview) {
    throw new Error(`Review Points \u101E\u100A\u103A Review \u1010\u1005\u103A\u1001\u102F\u101C\u103B\u103E\u1004\u103A ${s.maxReviewPointsPerReview.toLocaleString()} Pts \u1011\u1000\u103A \u1019\u1015\u102D\u102F\u101B\u1015\u102B\u104B`);
  }
  const lifetime = Array.isArray(settings.purchaseTiers) ? settings.purchaseTiers : [];
  const monthly = Array.isArray(settings.monthlyPurchaseTiers) ? settings.monthlyPurchaseTiers : [];
  const all = [...lifetime, ...monthly];
  let cashbackTotal = 0;
  for (const tier of all) {
    const threshold = finiteWhole(tier.threshold, 0);
    const value = Number(tier.rewardValue);
    if (!String(tier.id || "").trim() || threshold < 1 || !Number.isFinite(value) || value < 0) throw new Error("Purchase Reward Tier \u1021\u1001\u103B\u1000\u103A\u1021\u101C\u1000\u103A \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
    cashbackTotal += finiteWhole(value);
  }
  return s;
}
var DEFAULT_PROMO_TOTAL_USAGE_LIMIT, DEFAULT_FINANCIAL_SAFETY;
var init_financial_safety = __esm({
  "api/_financial-safety.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    DEFAULT_PROMO_TOTAL_USAGE_LIMIT = 0;
    DEFAULT_FINANCIAL_SAFETY = Object.freeze({
      maxTotalDiscountPercent: 50,
      maxTotalDiscountAmount: 0,
      maxCashbackUsePercent: 50,
      allowCouponWithPoints: false,
      allowCouponWithCashback: false,
      allowPointsWithCashback: false,
      maxCashbackRewardPerTier: 5e4,
      maxCashbackRewardPerOrder: 1e5,
      maxReviewPointsPerReview: 1e3
    });
    __name(finiteWhole, "finiteWhole");
    __name(normalizeFinancialSafety, "normalizeFinancialSafety");
    __name(totalDiscountCap, "totalDiscountCap");
    __name(cashbackUseCap, "cashbackUseCap");
    __name(assertTotalDiscountWithinCap, "assertTotalDiscountWithinCap");
    __name(assertStackingAllowed, "assertStackingAllowed");
    __name(getPromoUsageLimits, "getPromoUsageLimits");
    __name(assertPromoUsageAllowed, "assertPromoUsageAllowed");
    __name(validateRewardCaps, "validateRewardCaps");
  }
});

// api/store-data.js
function initFirebaseAdmin() {
  admin = createAdminCompat(currentEnv);
  return admin;
}
function getRewardSettings(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const settings = { ...DEFAULT_REWARD_SETTINGS, ...source };
  settings.purchaseTiers = (Array.isArray(source.purchaseTiers) ? source.purchaseTiers : []).filter((tier) => !LEGACY_AUTO_PURCHASE_TIER_IDS.has(String(tier?.id || "")) && tier?.rewardType === "cashback");
  settings.monthlyPurchaseTiers = Array.isArray(source.monthlyPurchaseTiers) ? source.monthlyPurchaseTiers : [];
  if (Number(source.adminConfigVersion || 0) < 2) {
    if (Number(source.points4Star) === 10) settings.points4Star = 0;
    if (Number(source.points5Star) === 20) settings.points5Star = 0;
    if (Number(source.photoBonusPoints) === 5) settings.photoBonusPoints = 0;
  }
  return settings;
}
function isComingSoonOnlyProduct(product) {
  if (!product || typeof product !== "object") return false;
  const section = String(product.displaySection || "").trim().toLowerCase();
  if (section === "coming_soon") return true;
  if (section === "shop" || section === "both") return false;
  return product.comingSoon === true && product.showInShop !== true;
}
function isPyinOoLwinCity(value) {
  const compact = String(value || "").normalize("NFC").toLowerCase().replace(/[\s.,()\-_/]+/g, "");
  const aliases = ["pol", "pyinoolwin", "pyinoolwinn", "pyinoowlwin", "pyinoowin", "\u1015\u103C\u1004\u103A\u1026\u1038\u101C\u103D\u1004\u103A", "\u1015\u103C\u1004\u103A\u1026\u1038\u101C\u1004\u103A", "\u1019\u1031\u1019\u103C\u102D\u102F\u1037", "\u1019\u1031\u1019\u103C\u102D\u102F\u1037\u1019\u103C\u102D\u102F\u1037"];
  return aliases.some((alias) => compact.includes(alias));
}
function isOrderRefunded(order = {}) {
  const status = String(order.status || "").trim().toLowerCase();
  const refundStatus = String(order.refundStatus || order.refund_state || "").trim().toLowerCase();
  const paymentStatus = String(order.paymentStatus || "").trim().toLowerCase();
  return status === "refunded" || refundStatus === "refunded" || paymentStatus === "refunded" || order.refunded === true || order.refundCompleted === true || Boolean(order.refundedAt) || Boolean(order.refundReason);
}
function myanmarMonthKey(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yangon", year: "numeric", month: "2-digit" }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value || "";
  const month = parts.find((part) => part.type === "month")?.value || "";
  return `${year}-${month}`;
}
function safeFinancialCount(value) {
  if (value === void 0 || value === null || value === "") return 0;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.min(1e9, Math.floor(number)) : 1e9;
}
function isTrustedImageKitUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && (parsed.hostname === "ik.imagekit.io" || parsed.hostname.endsWith(".imagekit.io"));
  } catch (_) {
    return false;
  }
}
function isCustomerReviewImageUrl(value, uid, productId) {
  if (!isTrustedImageKitUrl(value) || !uid || !productId) return false;
  try {
    const parsed = new URL(value);
    const segments = decodeURIComponent(parsed.pathname).split("/").filter(Boolean);
    const reviewIndex = segments.indexOf("reviews");
    return reviewIndex >= 0 && segments[reviewIndex + 1] === String(uid) && segments[reviewIndex + 2] === String(productId);
  } catch (_) {
    return false;
  }
}
async function verifyImageKitPhotoUrl(value, uid, productId) {
  if (!isCustomerReviewImageUrl(value, uid, productId)) return false;
  try {
    const response = await fetch(value, { method: "HEAD", signal: AbortSignal.timeout(5e3) });
    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    return response.ok && contentType.startsWith("image/");
  } catch (_) {
    return false;
  }
}
async function verifyCustomerToken(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!idToken) {
    throw new Error("Authentication required. Please log in first.");
  }
  initFirebaseAdmin();
  const auth = admin.auth();
  const db = admin.firestore();
  const decoded = await auth.verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: normalizeEmail(decoded.email || ""),
    name: decoded.name || (decoded.email ? decoded.email.split("@")[0] : "Customer"),
    db
  };
}
async function verifyAdminRequest(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!idToken) {
    throw new Error("Missing Firebase ID token for Admin action.");
  }
  initFirebaseAdmin();
  const auth = admin.auth();
  const db = admin.firestore();
  const decoded = await auth.verifyIdToken(idToken);
  const email = normalizeEmail(decoded.email);
  const userSnap = await db.collection("users").doc(decoded.uid).get();
  const profileRole = userSnap.exists ? String((userSnap.data() || {}).role || "") : "";
  const effectiveRole = ["admin_master", "admin_staff"].includes(profileRole) ? profileRole : "customer";
  if (effectiveRole !== "admin_master" && effectiveRole !== "admin_staff") {
    throw new Error("Unauthorized: Admin or Staff privileges required.");
  }
  return { uid: decoded.uid, email, role: effectiveRole, db };
}
async function ensurePromoCouponCounter(db, code) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const counterRef = db.collection("promo_coupon_counters").doc(normalizedCode);
  const currentSnap = await counterRef.get();
  if (currentSnap.exists) {
    const current = currentSnap.data() || {};
    if (current.active !== true) await counterRef.set({ code: normalizedCode, active: true, updatedAt: Date.now() }, { merge: true });
    return { ref: counterRef, usageCount: safeFinancialCount(current.usageCount) };
  }
  const legacyOrders = await db.collection("orders").where("couponCode", "==", normalizedCode).get();
  const legacyUsageCount = legacyOrders.docs.reduce((count3, orderDoc) => {
    const oldOrder = orderDoc.data() || {};
    const status = String(oldOrder.status || "").toLowerCase();
    return status === "cancelled" || status === "canceled" || status === "refunded" || oldOrder.refundedAt || oldOrder.refundReason ? count3 : count3 + 1;
  }, 0);
  const usageCount = await db.runTransaction(async (tx) => {
    const freshSnap = await tx.get(counterRef);
    if (freshSnap.exists) return safeFinancialCount((freshSnap.data() || {}).usageCount);
    tx.create(counterRef, { code: normalizedCode, active: true, usageCount: legacyUsageCount, migratedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() });
    return legacyUsageCount;
  });
  return { ref: counterRef, usageCount };
}
async function ensurePromoUserUsage(db, code, userId) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const usageRef = db.collection("promo_coupon_usage").doc(cryptoCompat.createHash("sha256").update(`${normalizedCode}:${userId}`).digest("hex"));
  const currentSnap = await usageRef.get();
  if (currentSnap.exists) {
    const current = currentSnap.data() || {};
    return { ref: usageRef, usageCount: safeFinancialCount(current.usageCount), orderIds: Array.isArray(current.orderIds) ? current.orderIds.map(String) : [] };
  }
  const priorOrders = await db.collection("orders").where("userId", "==", userId).get();
  const orderIds = priorOrders.docs.filter((orderDoc) => {
    const oldOrder = orderDoc.data() || {};
    const status = String(oldOrder.status || "").toLowerCase();
    return String(oldOrder.couponCode || "").trim().toUpperCase() === normalizedCode && !["cancelled", "canceled", "refunded"].includes(status) && !oldOrder.refundedAt && !oldOrder.refundReason;
  }).map((orderDoc) => orderDoc.id).slice(-1e4);
  const usageCount = await db.runTransaction(async (tx) => {
    const freshSnap = await tx.get(usageRef);
    if (freshSnap.exists) return safeFinancialCount((freshSnap.data() || {}).usageCount);
    tx.create(usageRef, { code: normalizedCode, userId, usageCount: orderIds.length, orderIds, migratedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() });
    return orderIds.length;
  });
  const finalSnap = await usageRef.get();
  const finalData = finalSnap.exists ? finalSnap.data() || {} : {};
  return { ref: usageRef, usageCount, orderIds: Array.isArray(finalData.orderIds) ? finalData.orderIds.map(String) : orderIds };
}
function restorePromoCouponUsageInTransaction(tx, db, code, userId, orderId, promoCounterSnap, promoUsageSnap, promoCounterRef, promoUsageRef) {
  if (!code || !promoCounterSnap || !promoCounterSnap.exists) return false;
  const counter = promoCounterSnap.data() || {};
  const nextTotalUsage = Math.max(0, safeFinancialCount(counter.usageCount) - 1);
  let nextUserUsage = null;
  if (promoUsageSnap && promoUsageSnap.exists) {
    const usage = promoUsageSnap.data() || {};
    const orderIds = Array.isArray(usage.orderIds) ? usage.orderIds.map(String) : [];
    if (!orderIds.includes(String(orderId))) return false;
    const remainingOrderIds = orderIds.filter((id) => id !== String(orderId));
    nextUserUsage = Math.max(0, safeFinancialCount(usage.usageCount) - 1);
    tx.set(promoUsageRef, {
      usageCount: nextUserUsage,
      orderIds: remainingOrderIds,
      lastOrderId: remainingOrderIds.length ? remainingOrderIds[remainingOrderIds.length - 1] : null,
      lastUsageRestoredAt: Date.now()
    }, { merge: true });
  }
  tx.set(promoCounterRef, { code: String(code).trim().toUpperCase(), usageCount: nextTotalUsage, updatedAt: Date.now(), lastUsageRestoredAt: Date.now() }, { merge: true });
  tx.create(db.collection("financial_audit_logs").doc(`promo_usage_restore_${orderId}`), {
    eventType: "promotion_coupon_usage_restored",
    code,
    userId: userId || null,
    orderId,
    usageCountAfter: nextUserUsage,
    totalUsageAfter: nextTotalUsage,
    createdAt: Date.now()
  });
  return true;
}
async function syncProductVisibleReviews(db, productId) {
  const pid2 = String(productId || "");
  if (!pid2) return;
  const revSnap = await db.collection("reviews").where("productId", "==", pid2).get();
  const visibleReviews = [];
  revSnap.forEach((doc) => {
    const d = doc.data();
    if (d && d.hidden !== true) {
      visibleReviews.push({
        id: d.id || doc.id,
        userId: d.userId || "",
        name: d.userName || d.name || "Customer",
        rating: Number(d.rating || 5),
        text: d.text || "",
        photos: Array.isArray(d.photos) ? d.photos : [],
        pointsAwarded: Number(d.pointsAwarded || 0),
        time: Number(d.createdAt || d.time || Date.now())
      });
    }
  });
  visibleReviews.sort((a, b) => (b.time || 0) - (a.time || 0));
  await db.collection("products").doc(pid2).set({
    reviews: visibleReviews,
    updatedAt: Date.now()
  }, { merge: true });
}
function collectProductImageUrls(product) {
  const found = /* @__PURE__ */ new Set();
  const visit = /* @__PURE__ */ __name((value, key = "") => {
    if (typeof value === "string") {
      if (/^(images?|imageUrl|imageURL|img|photo|thumbnail|cover)$/i.test(key) || /^https:\/\//i.test(value)) {
        try {
          const u = new URL(value);
          if (u.protocol === "https:" && (u.hostname === "ik.imagekit.io" || u.hostname.endsWith(".imagekit.io"))) {
            const parts = decodeURIComponent(u.pathname).split("/").filter(Boolean);
            const productionIndex = parts.indexOf("production");
            if (productionIndex >= 0) found.add("/" + parts.slice(productionIndex).join("/"));
          }
        } catch (_) {
        }
      }
    } else if (Array.isArray(value)) value.forEach((item) => visit(item, key));
    else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => visit(v, k));
  }, "visit");
  visit(product || {});
  return [...found];
}
async function deleteProductImageKitAssets(product) {
  const urls = collectProductImageUrls(product);
  const storedAssets = Array.isArray(product && product.imageKitAssets) ? product.imageKitAssets : [];
  const storedFileIds = new Set(storedAssets.map((a) => a && String(a.fileId || "").trim()).filter(Boolean));
  if (!urls.length && !storedFileIds.size) return { deleted: 0, skipped: 0 };
  const privateKey = String(process.env.IMAGEKIT_PRIVATE_KEY || "").trim();
  if (!privateKey) throw new Error("IMAGEKIT_PRIVATE_KEY \u1019\u101B\u103E\u102D\u1015\u102B\u104B \u1015\u102F\u1036\u1019\u1016\u103B\u1000\u103A\u1018\u1032 Product Delete \u1000\u102D\u102F \u101B\u1015\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B");
  const auth = `Basic ${BufferCompat.from(`${privateKey}:`).toString("base64")}`;
  const targets = new Set(urls);
  const fileIds = new Set(storedFileIds);
  for (const targetPath of targets) {
    const fileName = targetPath.split("/").pop();
    if (!fileName) continue;
    const query = `name="${fileName.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    let skip = 0;
    while (true) {
      const endpoint = new URL("https://api.imagekit.io/v1/files");
      endpoint.searchParams.set("searchQuery", query);
      endpoint.searchParams.set("limit", "1000");
      endpoint.searchParams.set("skip", String(skip));
      const response = await fetch(endpoint, { headers: { Authorization: auth, Accept: "application/json" } });
      if (!response.ok) throw new Error(`ImageKit \u1015\u102F\u1036\u1005\u102C\u101B\u1004\u103A\u1038\u1016\u1010\u103A\u1019\u101B\u1015\u102B (${response.status})\u104B Product \u1000\u102D\u102F \u1019\u1016\u103B\u1000\u103A\u1011\u102C\u1038\u1015\u102B\u104B`);
      const files = await response.json();
      if (!Array.isArray(files)) throw new Error("ImageKit \u1015\u102F\u1036\u1005\u102C\u101B\u1004\u103A\u1038\u1015\u102F\u1036\u1005\u1036 \u1019\u1019\u103E\u1014\u103A\u1015\u102B\u104B Product \u1000\u102D\u102F \u1019\u1016\u103B\u1000\u103A\u1011\u102C\u1038\u1015\u102B\u104B");
      for (const file of files) {
        if (!file || !file.fileId || !file.url) continue;
        try {
          const fileUrl = new URL(file.url);
          const listedPath = String(file.filePath || (fileUrl.pathname.split("/").slice(2).join("/") ? "/" + fileUrl.pathname.split("/").slice(2).join("/") : ""));
          if (decodeURIComponent(listedPath) === targetPath) fileIds.add(String(file.fileId));
        } catch (_) {
        }
      }
      if (files.length < 1e3) break;
      skip += files.length;
      if (skip > 2e4) throw new Error("ImageKit \u101B\u103E\u102C\u1016\u103D\u1031\u1019\u103E\u102F \u1021\u1000\u1014\u1037\u103A\u1021\u101E\u1010\u103A\u1000\u103B\u1031\u102C\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104B Product \u1000\u102D\u102F \u1019\u1016\u103B\u1000\u103A\u1011\u102C\u1038\u1015\u102B\u104B");
    }
  }
  let deleted = 0;
  for (const fileId of fileIds) {
    const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, { method: "DELETE", headers: { Authorization: auth, Accept: "application/json" } });
    if (!response.ok && response.status !== 404) throw new Error(`ImageKit \u1015\u102F\u1036\u1016\u103B\u1000\u103A\u1019\u101B\u1015\u102B (${response.status})\u104B Database Product \u1000\u102D\u102F \u1019\u1016\u103B\u1000\u103A\u1011\u102C\u1038\u1015\u102B\u104B`);
    deleted++;
  }
  return { deleted, skipped: urls.length - fileIds.size };
}
async function onRequest5(context2) {
  const { request, env: env2 } = context2;
  currentEnv = env2 || {};
  initFirebaseAdmin();
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization") || "";
  const rawBody = await request.text().catch(() => "");
  const event = {
    httpMethod: request.method,
    headers: {
      authorization: authHeader,
      Authorization: authHeader
    },
    body: rawBody
  };
  const res = await exports.handler(event);
  return new Response(res.body || "", {
    status: res.statusCode || 200,
    headers: res.headers || JSON_HEADERS
  });
}
var currentEnv, admin, process, exports, DEFAULT_REWARD_SETTINGS, LEGACY_AUTO_PURCHASE_TIER_IDS;
var init_store_data = __esm({
  "api/store-data.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_financial_safety();
    init_cf_adapter();
    currentEnv = {};
    admin = null;
    process = { get env() {
      return currentEnv;
    } };
    __name(initFirebaseAdmin, "initFirebaseAdmin");
    exports = {};
    DEFAULT_REWARD_SETTINGS = {
      // Reward amounts and purchase tiers are Admin-only. Missing configuration
      // must never grant points, cashback, discounts, or purchase rewards.
      points4Star: 0,
      points5Star: 0,
      photoBonusPoints: 0,
      couponValidityDays: 0,
      rewardCouponsEnabled: true,
      rewardCouponTiersEnabled: true,
      lifetimeCashbackTiersEnabled: true,
      monthlyCashbackTiersEnabled: true,
      minPayableAmount: 1e3,
      checkoutPointsEnabled: false,
      pointsPer1000Ks: 100,
      reverseReviewPointsOnRefund: true,
      keepReviewAfterRefund: true,
      ...DEFAULT_FINANCIAL_SAFETY,
      purchaseTiers: [],
      monthlyPurchaseTiers: [],
      tiers: []
    };
    LEGACY_AUTO_PURCHASE_TIER_IDS = /* @__PURE__ */ new Set(["spend_200k", "spend_500k", "spend_1m"]);
    __name(getRewardSettings, "getRewardSettings");
    __name(isComingSoonOnlyProduct, "isComingSoonOnlyProduct");
    __name(isPyinOoLwinCity, "isPyinOoLwinCity");
    __name(isOrderRefunded, "isOrderRefunded");
    __name(myanmarMonthKey, "myanmarMonthKey");
    __name(safeFinancialCount, "safeFinancialCount");
    __name(isTrustedImageKitUrl, "isTrustedImageKitUrl");
    __name(isCustomerReviewImageUrl, "isCustomerReviewImageUrl");
    __name(verifyImageKitPhotoUrl, "verifyImageKitPhotoUrl");
    __name(verifyCustomerToken, "verifyCustomerToken");
    __name(verifyAdminRequest, "verifyAdminRequest");
    __name(ensurePromoCouponCounter, "ensurePromoCouponCounter");
    __name(ensurePromoUserUsage, "ensurePromoUserUsage");
    __name(restorePromoCouponUsageInTransaction, "restorePromoCouponUsageInTransaction");
    __name(syncProductVisibleReviews, "syncProductVisibleReviews");
    __name(collectProductImageUrls, "collectProductImageUrls");
    __name(deleteProductImageKitAssets, "deleteProductImageKitAssets");
    exports.handler = async (event) => {
      if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: JSON_HEADERS, body: "" };
      }
      if (event.httpMethod !== "POST") {
        return {
          statusCode: 405,
          headers: JSON_HEADERS,
          body: JSON.stringify({ ok: false, error: "Method Not Allowed" })
        };
      }
      try {
        let body = {};
        try {
          body = JSON.parse(event.body || "{}");
        } catch (e) {
          return {
            statusCode: 400,
            headers: JSON_HEADERS,
            body: JSON.stringify({ ok: false, error: "Invalid JSON request body." })
          };
        }
        const action = String(body.action || "").trim();
        if (action === "customer_create_order") {
          initFirebaseAdmin();
          const db2 = admin.firestore();
          const orderData = body.order;
          if (!orderData || !orderData.id || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Invalid order payload." }) };
          }
          const customer = await verifyCustomerToken(event);
          const requestedUserId = String(orderData.userId || "").trim();
          if (requestedUserId && requestedUserId !== customer.uid) {
            throw new Error("Order Account \u101E\u100A\u103A \u101C\u1000\u103A\u101B\u103E\u102D Login \u101D\u1004\u103A\u1011\u102C\u1038\u101E\u1031\u102C Account \u1014\u103E\u1004\u1037\u103A \u1019\u1000\u102D\u102F\u1000\u103A\u100A\u102E\u1015\u102B\u104B");
          }
          const paymentMethodValue = String(orderData.paymentMethod || "").toLowerCase();
          const isCODOrder = paymentMethodValue.includes("cod") || String(orderData.paymentMethodId || "").toUpperCase() === "COD";
          const isPOLCity = isPyinOoLwinCity(orderData.city);
          if (isCODOrder && !isPOLCity) {
            throw new Error("COD \u101D\u1014\u103A\u1006\u1031\u102C\u1004\u103A\u1019\u103E\u102F\u1000\u102D\u102F \u1015\u103C\u1004\u103A\u1026\u1038\u101C\u103D\u1004\u103A (POL / \u1019\u1031\u1019\u103C\u102D\u102F\u1037) \u1019\u103C\u102D\u102F\u1037\u1010\u103D\u1004\u103A\u1038\u101E\u102C \u101B\u101B\u103E\u102D\u1015\u102B\u101E\u100A\u103A\u104B \u1021\u1001\u103C\u102C\u1038\u1019\u103C\u102D\u102F\u1037\u1019\u103B\u102C\u1038\u1021\u1010\u103D\u1000\u103A KPay \u101E\u102D\u102F\u1037\u1019\u101F\u102F\u1010\u103A WavePay \u1000\u102D\u102F \u101B\u103D\u1031\u1038\u1001\u103B\u101A\u103A\u1015\u102B\u104B");
          }
          if (!isCODOrder && (typeof orderData.paymentSlip !== "string" || !/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(orderData.paymentSlip) || orderData.paymentSlip.length > 75e4)) {
            throw new Error("KPay / WavePay \u1004\u103D\u1031\u101C\u103D\u103E\u1032 Screenshot \u1000\u102D\u102F \u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1005\u103D\u102C \u1010\u1004\u103A\u1015\u103C\u102E\u1038\u1019\u103E Order \u1010\u1004\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
          }
          const userId = customer.uid;
          const orderId = String(orderData.id).trim().replace(/^#+/, "");
          const normalizedId = orderId.startsWith("ord_") ? orderId : `ord_${orderId}`;
          if (!/^ord_[A-Za-z0-9_-]{6,120}$/.test(normalizedId)) throw new Error("Invalid order ID.");
          const orderRef = db2.collection("orders").doc(normalizedId);
          const cashbackUseRequested = Math.floor(Number(orderData.cashbackUseAmount || 0));
          const pointsUseRequested = Math.floor(Number(orderData.pointsUseAmount || 0));
          if (!Number.isFinite(cashbackUseRequested) || cashbackUseRequested < 0) throw new Error("Cashback \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1019\u100A\u1037\u103A \u1015\u1019\u102C\u100F \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          if (!Number.isFinite(pointsUseRequested) || pointsUseRequested < 0) throw new Error("Points \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1019\u100A\u1037\u103A \u1015\u1019\u102C\u100F \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          if ((cashbackUseRequested > 0 || pointsUseRequested > 0) && (!customer || String(customer.uid) !== userId)) throw new Error("Points/Cashback \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u101B\u1014\u103A Login \u101D\u1004\u103A\u1011\u102C\u1038\u101E\u1031\u102C Customer Account \u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
          const cashbackUserRef = customer ? db2.collection("users").doc(userId) : null;
          const couponCode = orderData.couponCode ? String(orderData.couponCode).trim().toUpperCase() : null;
          if (couponCode && !/^[A-Z0-9_-]{3,40}$/.test(couponCode)) throw new Error("Coupon Code \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const redeemedRef = couponCode ? db2.collection("redeemed_coupons").doc(couponCode) : null;
          const promoCouponsRef = db2.collection("store_config").doc("coupons");
          const isRegularPromoCode = Boolean(couponCode && !/^(RWD|MS)/.test(couponCode));
          const promoUsageRef = isRegularPromoCode && customer ? db2.collection("promo_coupon_usage").doc(cryptoCompat.createHash("sha256").update(`${couponCode}:${userId}`).digest("hex")) : null;
          let promoCounterRef = null;
          let legacyTotalCouponUsageCount = 0;
          let legacyUserCouponUsageCount = 0;
          let legacyUserCouponOrderIds = [];
          if (isRegularPromoCode && customer) {
            const priorCouponConfig = await promoCouponsRef.get();
            const priorPromoExists = priorCouponConfig.exists && Array.isArray((priorCouponConfig.data() || {}).items) && (priorCouponConfig.data() || {}).items.some((item) => String(item.code || "").trim().toUpperCase() === couponCode && item.isRewardCoupon !== true && item.disabled !== true);
            if (priorPromoExists) {
              const counter = await ensurePromoCouponCounter(db2, couponCode);
              promoCounterRef = counter.ref;
              legacyTotalCouponUsageCount = counter.usageCount;
            }
          }
          if (promoUsageRef) {
            const userUsage = await ensurePromoUserUsage(db2, couponCode, userId);
            legacyUserCouponUsageCount = userUsage.usageCount;
            legacyUserCouponOrderIds = userUsage.orderIds;
          }
          const productRefs = orderData.items.map((item) => db2.collection("products").doc(String(item.id || "")));
          const uniqueIds = productRefs.map((r) => r.id);
          if (uniqueIds.some((id) => !id) || new Set(uniqueIds).size !== uniqueIds.length) throw new Error("Order items \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const result = await db2.runTransaction(async (tx) => {
            const existingSnap = await tx.get(orderRef);
            if (existingSnap.exists) {
              const old = existingSnap.data() || {};
              if (String(old.userId || "") !== userId) throw new Error("Order ID already belongs to another customer.");
              return { alreadyExists: true, order: old };
            }
            const [productSnaps, couponSnap, promoCouponsSnap, cashbackUserSnap, rewardSettingsSnap, promoUsageSnap, promoCounterSnap] = await Promise.all([
              Promise.all(productRefs.map((ref2) => tx.get(ref2))),
              redeemedRef ? tx.get(redeemedRef) : Promise.resolve(null),
              tx.get(promoCouponsRef),
              cashbackUserRef ? tx.get(cashbackUserRef) : Promise.resolve(null),
              tx.get(db2.collection("store_config").doc("reward_settings")),
              promoUsageRef ? tx.get(promoUsageRef) : Promise.resolve(null),
              promoCounterRef ? tx.get(promoCounterRef) : Promise.resolve(null)
            ]);
            let rawTotal = 0;
            const cleanItems = orderData.items.map((item, idx) => {
              const snap = productSnaps[idx];
              if (!snap.exists) throw new Error(`\u1015\u1005\u1039\u1005\u100A\u103A\u1038 \u1019\u1010\u103D\u1031\u1037\u1015\u102B: ${String(item.id || "")}`);
              const product = snap.data() || {};
              if (product.deleting === true || product.deleted === true) throw new Error(`\u1024\u1015\u1005\u1039\u1005\u100A\u103A\u1038\u1000\u102D\u102F \u1016\u101A\u103A\u101B\u103E\u102C\u1038\u1014\u1031\u1015\u102B\u101E\u100A\u103A \u101E\u102D\u102F\u1037\u1019\u101F\u102F\u1010\u103A \u1016\u103B\u1000\u103A\u1015\u103C\u102E\u1038\u1016\u103C\u1005\u103A\u101E\u1031\u102C\u1000\u103C\u1031\u102C\u1004\u1037\u103A Order \u1010\u1004\u103A\u104D\u1019\u101B\u1015\u102B: ${String(product.name || item.id)}`);
              if (isComingSoonOnlyProduct(product)) {
                throw new Error(`\u1024\u1015\u1005\u1039\u1005\u100A\u103A\u1038\u101E\u100A\u103A Coming Soon \u1016\u103C\u1005\u103A\u1014\u1031\u101E\u1031\u1038\u101E\u1031\u102C\u1000\u103C\u1031\u102C\u1004\u1037\u103A Order \u1010\u1004\u103A\u104D\u1019\u101B\u101E\u1031\u1038\u1015\u102B: ${String(product.name || item.id)}`);
              }
              const qty = Math.floor(Number(item.qty) || 0);
              const price = Number(product.price);
              if (!Number.isFinite(qty) || qty < 1 || qty > 100 || !Number.isFinite(price) || price < 0) throw new Error("\u1015\u1005\u1039\u1005\u100A\u103A\u1038\u1021\u101B\u1031\u1021\u1010\u103D\u1000\u103A \u101E\u102D\u102F\u1037\u1019\u101F\u102F\u1010\u103A \u1008\u1031\u1038\u1014\u103E\u102F\u1014\u103A\u1038 \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
              const stock = Number(product.stock || 0);
              if (stock < qty) throw new Error(`\u101C\u1000\u103A\u1000\u103B\u1014\u103A\u1015\u1005\u1039\u1005\u100A\u103A\u1038 \u1019\u101C\u102F\u1036\u101C\u1031\u102C\u1000\u103A\u1015\u102B: ${product.name || item.id}`);
              const lineTotal = price * qty;
              if (!Number.isFinite(lineTotal) || lineTotal < 0 || lineTotal > 1e12) throw new Error("Order \u1015\u1005\u1039\u1005\u100A\u103A\u1038\u1010\u1014\u103A\u1016\u102D\u102F\u1038\u101E\u100A\u103A \u101E\u1010\u103A\u1019\u103E\u1010\u103A\u1011\u102C\u1038\u101E\u1031\u102C \u1021\u1019\u103B\u102C\u1038\u1006\u102F\u1036\u1038\u1015\u1019\u102C\u100F\u1011\u1000\u103A \u1000\u103B\u1031\u102C\u103A\u101C\u103D\u1014\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104B");
              rawTotal += lineTotal;
              if (!Number.isFinite(rawTotal) || rawTotal > 1e12) throw new Error("Order \u1005\u102F\u1005\u102F\u1015\u1031\u102B\u1004\u103A\u1038\u1010\u1014\u103A\u1016\u102D\u102F\u1038 \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
              return {
                id: snap.id,
                name: String(product.name || item.name || ""),
                price,
                qty,
                category: String(product.category || ""),
                brand: String(product.brand || ""),
                size: String(item.size || item.selectedSize || ""),
                selectedSize: String(item.selectedSize || item.size || ""),
                color: String(item.color || ""),
                img: String(product.img || item.img || "").slice(0, 18e4)
              };
            });
            let discountAmount = 0;
            let rewardCouponToMarkUsed = false;
            if (couponCode) {
              if (couponSnap && couponSnap.exists) {
                const rewardSettings2 = rewardSettingsSnap && rewardSettingsSnap.exists ? rewardSettingsSnap.data() || {} : {};
                if (rewardSettings2.rewardCouponsEnabled === false) throw new Error("Admin \u1019\u103E Reward Coupon \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1001\u103D\u1004\u1037\u103A\u1000\u102D\u102F \u101A\u102C\u101A\u102E\u1015\u102D\u1010\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B");
                const c = couponSnap.data() || {};
                if (String(c.userId || "") !== userId) throw new Error("\u1024 Reward Coupon \u101E\u100A\u103A \u101E\u1004\u1037\u103A\u1021\u1000\u1031\u102C\u1004\u1037\u103A\u1021\u1010\u103D\u1000\u103A \u1019\u101F\u102F\u1010\u103A\u1015\u102B\u104B");
                if (c.revoked === true || c.revokedBySourceRefund === true) throw new Error("\u1024 Reward Coupon \u1000\u102D\u102F \u1019\u1030\u101C Order Refund \u1000\u103C\u1031\u102C\u1004\u1037\u103A \u1015\u101A\u103A\u1016\u103B\u1000\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B");
                if (c.used === true) throw new Error("\u1024 Reward Coupon \u1000\u102D\u102F \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1015\u103C\u102E\u1038\u101E\u102C\u1038 \u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
                if (Number(c.expiresAt || 0) > 0 && Number(c.expiresAt) <= Date.now()) throw new Error("\u1024 Reward Coupon \u101E\u1000\u103A\u1010\u1019\u103A\u1038\u1000\u102F\u1014\u103A\u1006\u102F\u1036\u1038\u101E\u103D\u102C\u1038\u1015\u102B\u1015\u103C\u102E\u104B");
                const percent = Math.min(90, Math.max(1, Number(c.percent) || 0));
                const allowed = Array.isArray(c.productIds) ? c.productIds : ["all"];
                const eligibleSubtotal = cleanItems.reduce((sum, item) => sum + (allowed.includes("all") || allowed.includes(item.id) ? item.price * item.qty : 0), 0);
                if (eligibleSubtotal <= 0) throw new Error("\u1024 Reward Coupon \u101E\u100A\u103A \u1001\u103C\u1004\u103A\u1038\u1010\u1031\u102C\u1004\u103A\u1038\u1011\u1032\u101B\u103E\u102D \u101E\u1010\u103A\u1019\u103E\u1010\u103A\u1011\u102C\u1038\u101E\u1031\u102C \u1015\u1005\u1039\u1005\u100A\u103A\u1038\u1019\u103B\u102C\u1038\u1014\u103E\u1004\u1037\u103A \u1021\u1000\u103B\u102F\u1036\u1038\u1019\u101D\u1004\u103A\u1015\u102B\u104B");
                const minPurchase = Math.max(0, Number(c.minPurchase || 0));
                if (eligibleSubtotal < minPurchase) throw new Error(`\u1024 Coupon \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u101B\u1014\u103A \u101E\u1010\u103A\u1019\u103E\u1010\u103A\u1011\u102C\u1038\u101E\u1031\u102C Products \u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1021\u1014\u100A\u103A\u1038\u1006\u102F\u1036\u1038 ${minPurchase.toLocaleString()} Ks \u1016\u102D\u102F\u1038 \u101D\u101A\u103A\u101A\u1030\u101B\u1014\u103A\u101C\u102D\u102F\u1015\u102B\u101E\u100A\u103A\u104B \u101C\u1000\u103A\u101B\u103E\u102D ${eligibleSubtotal.toLocaleString()} Ks \u101E\u102C\u101B\u103E\u102D\u1015\u102B\u101E\u100A\u103A\u104B`);
                const percentDiscount = Math.round(eligibleSubtotal * percent / 100);
                const maxDiscount = Math.max(0, Number(c.maxDiscount || 0));
                discountAmount = maxDiscount > 0 ? Math.min(percentDiscount, maxDiscount) : percentDiscount;
                rewardCouponToMarkUsed = true;
              } else {
                const promoItems = promoCouponsSnap && promoCouponsSnap.exists && Array.isArray((promoCouponsSnap.data() || {}).items) ? (promoCouponsSnap.data() || {}).items : [];
                const promo = promoItems.find((item) => String(item.code || "").trim().toUpperCase() === couponCode && item.isRewardCoupon !== true);
                if (!promo || promo.disabled === true) throw new Error("Coupon \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B \u101E\u102D\u102F\u1037\u1019\u101F\u102F\u1010\u103A \u1015\u101A\u103A\u1016\u103B\u1000\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B");
                if (Number(promo.expiresAt || 0) > 0 && Number(promo.expiresAt) <= Date.now()) throw new Error("\u1024 Coupon \u101E\u1000\u103A\u1010\u1019\u103A\u1038\u1000\u102F\u1014\u103A\u1006\u102F\u1036\u1038\u101E\u103D\u102C\u1038\u1015\u102B\u1015\u103C\u102E\u104B");
                if (!customer || !promoUsageRef) throw new Error("Promotion Coupon \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u101B\u1014\u103A Customer Account \u1016\u103C\u1004\u1037\u103A Login \u101D\u1004\u103A\u1011\u102C\u1038\u101B\u1014\u103A\u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
                const currentUserUsage = promoUsageSnap && promoUsageSnap.exists ? safeFinancialCount((promoUsageSnap.data() || {}).usageCount) : legacyUserCouponUsageCount;
                const activePromoCounterRef = promoCounterRef || db2.collection("promo_coupon_counters").doc(couponCode);
                const activePromoCounterSnap = promoCounterSnap || await tx.get(activePromoCounterRef);
                const currentTotalUsage = activePromoCounterSnap && activePromoCounterSnap.exists ? safeFinancialCount((activePromoCounterSnap.data() || {}).usageCount) : legacyTotalCouponUsageCount;
                const usageLimits = assertPromoUsageAllowed(promo, currentTotalUsage, currentUserUsage);
                const percent = Math.min(90, Math.max(1, Number(promo.percent) || 0));
                const allowed = Array.isArray(promo.productIds) && promo.productIds.length ? promo.productIds.map(String) : ["all"];
                const eligibleSubtotal = cleanItems.reduce((sum, item) => sum + (allowed.includes("all") || allowed.includes(item.id) ? item.price * item.qty : 0), 0);
                if (eligibleSubtotal <= 0) throw new Error("\u1024 Coupon \u101E\u100A\u103A \u1001\u103C\u1004\u103A\u1038\u1010\u1031\u102C\u1004\u103A\u1038\u1011\u1032\u101B\u103E\u102D \u1015\u1005\u1039\u1005\u100A\u103A\u1038\u1019\u103B\u102C\u1038\u1014\u103E\u1004\u1037\u103A \u1021\u1000\u103B\u102F\u1036\u1038\u1019\u101D\u1004\u103A\u1015\u102B\u104B");
                const rawPromoDiscount = Math.round(eligibleSubtotal * percent / 100);
                const promoMaxDiscount = Math.max(0, Number(promo.maxDiscount || 0));
                discountAmount = promoMaxDiscount > 0 ? Math.min(rawPromoDiscount, promoMaxDiscount) : rawPromoDiscount;
                tx.set(activePromoCounterRef, { code: couponCode, usageCount: currentTotalUsage + 1, lastUsedAt: Date.now(), updatedAt: Date.now() }, { merge: true });
                const promoUsageOrderIds = promoUsageSnap && promoUsageSnap.exists ? Array.isArray(promoUsageSnap.data()?.orderIds) ? promoUsageSnap.data().orderIds.map(String) : [] : legacyUserCouponOrderIds;
                if (promoUsageOrderIds.includes(normalizedId)) throw new Error("\u1024 Order ID \u1016\u103C\u1004\u1037\u103A Coupon \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1019\u103E\u102F\u1000\u102D\u102F \u1019\u103E\u1010\u103A\u1010\u1019\u103A\u1038\u1010\u1004\u103A\u1015\u103C\u102E\u1038\u101E\u102C\u1038\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
                tx.set(promoUsageRef, { code: couponCode, userId, usageCount: currentUserUsage + 1, orderIds: [...promoUsageOrderIds, normalizedId].slice(-1e4), lastUsedAt: Date.now(), lastOrderId: normalizedId }, { merge: true });
                tx.create(db2.collection("financial_audit_logs").doc(`coupon_${normalizedId}`), {
                  eventType: "promotion_coupon_used",
                  code: couponCode,
                  userId,
                  orderId: normalizedId,
                  discountAmount,
                  totalUsageAfter: currentTotalUsage + 1,
                  userUsageAfter: currentUserUsage + 1,
                  totalUsageLimit: usageLimits.total,
                  perUserUsageLimit: usageLimits.perUser,
                  createdAt: Date.now()
                });
              }
            }
            const rewardSettings = rewardSettingsSnap && rewardSettingsSnap.exists ? getRewardSettings(rewardSettingsSnap.data()) : DEFAULT_REWARD_SETTINGS;
            const safetySettings = normalizeFinancialSafety(rewardSettings);
            assertStackingAllowed({ coupon: Boolean(couponCode), points: pointsUseRequested > 0, cashback: cashbackUseRequested > 0 }, safetySettings);
            const minPayableAmount = Math.max(1, Math.floor(Number(rewardSettings.minPayableAmount ?? 1e3)));
            if (rawTotal < minPayableAmount) throw new Error(`\u1021\u1014\u100A\u103A\u1038\u1006\u102F\u1036\u1038 \u1015\u1031\u1038\u1001\u103B\u1031\u101B\u1019\u100A\u1037\u103A\u1004\u103D\u1031 ${minPayableAmount.toLocaleString()} Ks \u1015\u103C\u100A\u1037\u103A\u101B\u1014\u103A\u101C\u102D\u102F\u1015\u102B\u101E\u100A\u103A\u104B`);
            discountAmount = Math.min(discountAmount, Math.max(0, rawTotal - minPayableAmount));
            discountAmount = Math.min(discountAmount, totalDiscountCap(rawTotal, safetySettings));
            if (rewardCouponToMarkUsed) tx.update(redeemedRef, { used: true, usedAt: Date.now(), usedOrderId: normalizedId, usedDiscountAmount: discountAmount });
            const totalAfterCoupon = Math.max(0, Math.round(rawTotal - discountAmount));
            const walletUserData = cashbackUserSnap && cashbackUserSnap.exists ? cashbackUserSnap.data() || {} : {};
            const walletBalance = Math.max(0, Number(walletUserData.cashbackBalance || 0));
            const pointsBalance = Math.max(0, Number(walletUserData.pointsBalance || 0));
            if (pointsUseRequested > pointsBalance) throw new Error(`Points \u101C\u1000\u103A\u1000\u103B\u1014\u103A ${pointsBalance.toLocaleString()} Pts \u101E\u102C\u101B\u103E\u102D\u1015\u102B\u101E\u100A\u103A\u104B`);
            if (pointsUseRequested > 0 && rewardSettings.checkoutPointsEnabled !== true) throw new Error("Admin \u1019\u103E Checkout Points \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1001\u103D\u1004\u1037\u103A\u1000\u102D\u102F \u1016\u103D\u1004\u1037\u103A\u1019\u1011\u102C\u1038\u101E\u1031\u1038\u1015\u102B\u104B");
            const pointsPer1000Ks = Math.max(1, Math.floor(Number(rewardSettings.pointsPer1000Ks || 100)));
            const pointsBlocks = Math.floor(pointsUseRequested / pointsPer1000Ks);
            const pointsUsed = pointsBlocks * pointsPer1000Ks;
            const pointsDiscountAmount = pointsBlocks * 1e3;
            if (pointsUseRequested !== pointsUsed) throw new Error(`Points \u1000\u102D\u102F ${pointsPer1000Ks} Pts \u1021\u1006\u1004\u1037\u103A\u101C\u102D\u102F\u1000\u103A\u101E\u102C \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B`);
            if (pointsDiscountAmount > 0 && (!customer || !cashbackUserRef)) throw new Error("Points \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u101B\u1014\u103A Customer Login \u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
            if (cashbackUseRequested > walletBalance) throw new Error(`Cashback \u101C\u1000\u103A\u1000\u103B\u1014\u103A ${walletBalance.toLocaleString()} Ks \u101E\u102C\u101B\u103E\u102D\u1015\u102B\u101E\u100A\u103A\u104B`);
            const remainingBeforeCashback = totalAfterCoupon - pointsDiscountAmount;
            if (remainingBeforeCashback < minPayableAmount) throw new Error(`Coupon/Points \u101C\u103B\u103E\u1031\u102C\u1037\u1015\u103C\u102E\u1038\u1014\u1031\u102C\u1000\u103A \u1021\u1014\u100A\u103A\u1038\u1006\u102F\u1036\u1038 ${minPayableAmount.toLocaleString()} Ks \u1015\u1031\u1038\u1001\u103B\u1031\u101B\u1014\u103A \u1000\u103B\u1014\u103A\u101B\u1015\u102B\u1019\u100A\u103A\u104B \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1019\u100A\u1037\u103A Points \u1000\u102D\u102F \u101C\u103B\u103E\u1031\u102C\u1037\u1015\u102B\u104B`);
            const maxCashbackAllowed = cashbackUseCap(
              remainingBeforeCashback,
              rawTotal,
              discountAmount + pointsDiscountAmount,
              minPayableAmount,
              safetySettings
            );
            if (cashbackUseRequested > maxCashbackAllowed) throw new Error(`Order \u1010\u1005\u103A\u1001\u102F\u1010\u103D\u1004\u103A Cashback \u1000\u102D\u102F \u1000\u103B\u1014\u103A\u1004\u103D\u1031\u104F ${safetySettings.maxCashbackUsePercent}% \u1021\u1011\u102D\u101E\u102C \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B \u1021\u1019\u103B\u102C\u1038\u1006\u102F\u1036\u1038 ${maxCashbackAllowed.toLocaleString()} Ks \u101E\u102C \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B`);
            const cashbackUsed = cashbackUseRequested;
            const { total: combinedDiscount } = assertTotalDiscountWithinCap(rawTotal, [discountAmount, pointsDiscountAmount, cashbackUsed], safetySettings);
            const finalTotal = Math.max(minPayableAmount, remainingBeforeCashback - cashbackUsed);
            const now = Date.now();
            let cashbackWallet = null;
            if (cashbackUsed > 0 && cashbackUserRef) {
              const walletUser = cashbackUserSnap.data() || {};
              const nextBalance = walletBalance - cashbackUsed;
              const nextTotalUsed = Math.max(0, Number(walletUser.cashbackTotalUsed || 0)) + cashbackUsed;
              const history = Array.isArray(walletUser.cashbackHistory) ? walletUser.cashbackHistory.slice() : [];
              const historyEntry = { id: `use_${normalizedId}`, type: "used", amount: cashbackUsed, orderId: normalizedId, createdAt: now, balanceAfter: nextBalance };
              history.unshift(historyEntry);
              tx.set(cashbackUserRef, { cashbackBalance: nextBalance, cashbackTotalUsed: nextTotalUsed, cashbackHistory: history.slice(0, 100), updatedAt: now }, { merge: true });
              tx.create(db2.collection("cashback_ledger").doc(`use_${normalizedId}`), { id: `use_${normalizedId}`, userId, orderId: normalizedId, type: "used", amount: cashbackUsed, balanceBefore: walletBalance, balanceAfter: nextBalance, createdAt: now });
              cashbackWallet = { balance: nextBalance, totalUsed: nextTotalUsed, history: history.slice(0, 100) };
            }
            let pointsWallet = null;
            if (pointsUsed > 0 && cashbackUserRef) {
              const nextPointsBalance = pointsBalance - pointsUsed;
              const pointsHistory = Array.isArray(walletUserData.pointsHistory) ? walletUserData.pointsHistory.slice() : [];
              pointsHistory.unshift({ id: `checkout_${normalizedId}`, type: "checkout_used", points: pointsUsed, discountAmount: pointsDiscountAmount, orderId: normalizedId, createdAt: now, balanceAfter: nextPointsBalance });
              tx.set(cashbackUserRef, { pointsBalance: nextPointsBalance, pointsTotalUsed: Math.max(0, Number(walletUserData.pointsTotalUsed || 0)) + pointsUsed, pointsHistory: pointsHistory.slice(0, 100), updatedAt: now }, { merge: true });
              tx.create(db2.collection("points_ledger").doc(`checkout_${normalizedId}`), { id: `checkout_${normalizedId}`, userId, type: "checkout_redemption", pointsDelta: -pointsUsed, balanceBefore: pointsBalance, balanceAfter: nextPointsBalance, discountAmount: pointsDiscountAmount, orderId: normalizedId, reason: "Checkout Points \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1019\u103E\u102F", createdAt: now });
              pointsWallet = { balance: nextPointsBalance, totalUsed: Math.max(0, Number(walletUserData.pointsTotalUsed || 0)) + pointsUsed };
            }
            const sanitizedOrder = {
              id: normalizedId,
              userId,
              customerEmail: customer ? customer.email : String(orderData.customerEmail || "").trim().slice(0, 254),
              customerName: String(customer ? customer.name : orderData.customerName || "").trim().slice(0, 100),
              phone: String(orderData.phone || "").trim().slice(0, 40),
              city: String(orderData.city || "").trim().slice(0, 100),
              address: String(orderData.address || "").trim().slice(0, 500),
              paymentMethod: String(orderData.paymentMethod || "KBZPay").slice(0, 50),
              paymentSlip: orderData.paymentSlip || null,
              couponCode: couponCode || null,
              discountAmount,
              cashbackUsed,
              pointsUsed,
              pointsDiscountAmount,
              minPayableAmount,
              items: cleanItems,
              subtotal: rawTotal,
              totalAmount: finalTotal,
              status: "pending",
              createdAt: Number(orderData.createdAt) || now,
              updatedAt: now
            };
            tx.create(orderRef, sanitizedOrder);
            tx.create(db2.collection("financial_audit_logs").doc(`checkout_${normalizedId}`), {
              eventType: "checkout_discount_applied",
              userId,
              orderId: normalizedId,
              couponCode: couponCode || null,
              couponDiscount: discountAmount,
              pointsUsed,
              pointsDiscountAmount,
              cashbackUsed,
              totalDiscount: discountAmount + pointsDiscountAmount + cashbackUsed,
              rawTotal,
              finalTotal,
              createdAt: now
            });
            productSnaps.forEach((snap, idx) => {
              const product = snap.data() || {};
              tx.update(productRefs[idx], { stock: Number(product.stock || 0) - cleanItems[idx].qty, updatedAt: now });
            });
            return { alreadyExists: false, order: sanitizedOrder, cashbackWallet, pointsWallet };
          });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: normalizedId, order: result.order, alreadyExists: result.alreadyExists, cashbackWallet: result.cashbackWallet || null, pointsWallet: result.pointsWallet || null }) };
        }
        if (action === "customer_add_review") {
          const { uid, email, name, db: db2 } = await verifyCustomerToken(event);
          const productId = String(body.productId || "").trim();
          const reviewInput = body.review || {};
          const rawRating = Number(reviewInput.rating);
          if (!Number.isInteger(rawRating) || rawRating < 1 || rawRating > 5) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Rating \u1000\u102D\u102F 1 \u1019\u103E 5 \u1021\u1010\u103D\u1004\u103A\u1038 \u101B\u103D\u1031\u1038\u1001\u103B\u101A\u103A\u1015\u102B\u104B" }) };
          }
          const rating = rawRating;
          const text = String(reviewInput.text || "").trim();
          if (!productId || text.length < 20) {
            return {
              statusCode: 400,
              headers: JSON_HEADERS,
              body: JSON.stringify({ ok: false, error: "Review \u1005\u102C\u101E\u102C\u1038\u1000\u102D\u102F \u1021\u1014\u100A\u103A\u1038\u1006\u102F\u1036\u1038 \u1005\u102C\u101C\u102F\u1036\u1038 \u1042\u1040 \u101B\u1031\u1038\u1015\u1031\u1038\u1015\u102B\u104B" })
            };
          }
          const photoCandidates = Array.isArray(reviewInput.photos) ? reviewInput.photos.filter(isTrustedImageKitUrl).slice(0, 4) : [];
          const photoChecks = await Promise.all(photoCandidates.map(async (url) => ({ url, valid: await verifyImageKitPhotoUrl(url, uid, productId) })));
          const photos = photoChecks.filter((x) => x.valid).map((x) => x.url);
          const deterministicReviewId = `rev_${uid}_${productId}`;
          const reviewRef = db2.collection("reviews").doc(deterministicReviewId);
          const rewardClaimRef = db2.collection("review_reward_claims").doc(deterministicReviewId);
          const userRef = db2.collection("users").doc(uid);
          const prodRef = db2.collection("products").doc(productId);
          const rewardCfgRef = db2.collection("store_config").doc("reward_settings");
          const customerOrdersQuery = db2.collection("orders").where("userId", "==", uid);
          const txResult = await db2.runTransaction(async (tx) => {
            const [existingRevSnap, claimSnap, priorClaimsSnap, priorReviewsSnap, userSnap, prodSnap, cfgSnap, customerOrdersSnap] = await Promise.all([
              tx.get(reviewRef),
              tx.get(rewardClaimRef),
              tx.get(db2.collection("review_reward_claims").where("userId", "==", uid).where("productId", "==", productId)),
              tx.get(db2.collection("reviews").where("userId", "==", uid).where("productId", "==", productId)),
              tx.get(userRef),
              tx.get(prodRef),
              tx.get(rewardCfgRef),
              tx.get(customerOrdersQuery)
            ]);
            if (!prodSnap.exists) throw new Error("Product \u1019\u101B\u103E\u102D\u1010\u1031\u102C\u1037\u1015\u102B\u104B Review \u1010\u1004\u103A\u104D\u1019\u101B\u1015\u102B\u104B");
            const eligibleOrder = customerOrdersSnap.docs.find((orderDoc) => {
              const order = orderDoc.data() || {};
              if (String(order.status || "").toLowerCase() !== "completed") return false;
              if (isOrderRefunded(order)) return false;
              return Array.isArray(order.items) && order.items.some(
                (item) => String(item.id || item.productId || "") === productId && Number(item.qty || 0) > 0
              );
            });
            const rewardCfg = cfgSnap.exists ? getRewardSettings(cfgSnap.data()) : DEFAULT_REWARD_SETTINGS;
            const reviewSafety = normalizeFinancialSafety(rewardCfg);
            const existingRev = existingRevSnap.exists ? existingRevSnap.data() || {} : null;
            const legacyRewardedClaim = priorClaimsSnap.docs.some((d) => {
              const data = d.data() || {};
              return data.userId === uid && data.productId === productId;
            });
            const legacyRewardedReview = priorReviewsSnap.docs.some((d) => {
              const data = d.data() || {};
              return data.pointsRewarded === true && Number(data.pointsAwarded || 0) > 0;
            });
            const claimReversed = Boolean(claimSnap.exists && (claimSnap.data() || {}).reversedAt) || priorClaimsSnap.docs.some((d) => Boolean((d.data() || {}).reversedAt));
            const alreadyRewarded = claimSnap.exists || legacyRewardedClaim || legacyRewardedReview || Boolean(existingRev && existingRev.pointsRewarded === true);
            let pointsToAward = 0;
            let pointsAttempted = 0;
            let pointsCapBlocked = false;
            if (!alreadyRewarded && eligibleOrder) {
              if (rating === 5) pointsToAward = Number(rewardCfg.points5Star ?? 0);
              else if (rating === 4) pointsToAward = Number(rewardCfg.points4Star ?? 0);
              if (rating >= 4 && photos.length > 0 && Number(rewardCfg.photoBonusPoints || 0) > 0) {
                pointsToAward += Number(rewardCfg.photoBonusPoints || 0);
              }
              pointsAttempted = pointsToAward;
              if (pointsToAward > reviewSafety.maxReviewPointsPerReview) {
                pointsCapBlocked = true;
                pointsToAward = 0;
              }
            }
            const userData = userSnap.exists ? userSnap.data() || {} : {};
            const prodData = prodSnap.exists ? prodSnap.data() || {} : {};
            const displayName = String(reviewInput.name || userData.name || name || email.split("@")[0] || "Customer").trim();
            const currentPoints = Number(userData.pointsBalance || 0);
            const currentDebt = Math.max(0, Number(userData.pointsDebt || 0));
            const totalEarned = Number(userData.totalPointsEarned || 0);
            const debtPaid = Math.min(currentDebt, pointsToAward);
            const spendableAward = pointsToAward - debtPaid;
            const newPointsBalance = currentPoints + spendableAward;
            const newPointsDebt = currentDebt - debtPaid;
            const newTotalEarned = totalEarned + pointsToAward;
            const now = Date.now();
            const reviewRecord = {
              id: deterministicReviewId,
              productId,
              productName: String(prodData.name || body.productName || ""),
              userId: uid,
              userEmail: email,
              userName: displayName,
              name: displayName,
              rating,
              text,
              photos,
              hidden: existingRev ? Boolean(existingRev.hidden) : false,
              pointsRewarded: pointsToAward > 0 || alreadyRewarded && !claimReversed && Boolean(existingRev && existingRev.pointsRewarded === true),
              pointsAwarded: pointsToAward > 0 ? pointsToAward : alreadyRewarded && !claimReversed ? Number(existingRev && existingRev.pointsAwarded || (claimSnap.data() || {}).pointsAwarded || 0) : 0,
              verifiedPurchase: Boolean(eligibleOrder),
              verifiedOrderId: eligibleOrder ? eligibleOrder.id : null,
              rewardPending: !alreadyRewarded && !eligibleOrder && rating >= 4,
              createdAt: existingRev ? Number(existingRev.createdAt || now) : now,
              updatedAt: now
            };
            tx.set(reviewRef, reviewRecord, { merge: true });
            if (pointsCapBlocked) tx.set(db2.collection("financial_audit_logs").doc(`review_reward_blocked_${uid}_${productId}`), {
              eventType: "review_reward_blocked_by_cap",
              userId: uid,
              productId,
              reviewId: deterministicReviewId,
              attemptedPoints: pointsAttempted,
              allowedPoints: reviewSafety.maxReviewPointsPerReview,
              createdAt: now
            }, { merge: true });
            if (alreadyRewarded && !claimSnap.exists) {
              tx.create(rewardClaimRef, {
                id: deterministicReviewId,
                userId: uid,
                productId,
                reviewId: deterministicReviewId,
                pointsAwarded: Number(existingRev && existingRev.pointsAwarded || priorClaimsSnap.docs[0] && priorClaimsSnap.docs[0].data().pointsAwarded || priorReviewsSnap.docs.find((d) => (d.data() || {}).pointsRewarded === true)?.data().pointsAwarded || 0),
                claimedAt: Date.now(),
                ...claimReversed ? { reversedAt: Date.now(), migratedReversed: true } : {},
                migrated: true,
                rule: "one_reward_per_customer_per_product"
              });
            }
            if (pointsToAward > 0) {
              tx.set(userRef, {
                uid,
                email,
                name: displayName,
                pointsBalance: newPointsBalance,
                pointsDebt: newPointsDebt,
                totalPointsEarned: newTotalEarned,
                updatedAt: now
              }, { merge: true });
              const ledgerId = `led_rev_${uid}_${productId}`;
              const ledgerRef = db2.collection("points_ledger").doc(ledgerId);
              tx.create(rewardClaimRef, {
                id: deterministicReviewId,
                userId: uid,
                productId,
                reviewId: deterministicReviewId,
                pointsAwarded: pointsToAward,
                claimedAt: now,
                verifiedOrderId: eligibleOrder ? eligibleOrder.id : null,
                rule: "one_reward_per_customer_per_product"
              });
              tx.create(db2.collection("financial_audit_logs").doc(`review_reward_${uid}_${productId}`), {
                eventType: "review_points_issued",
                userId: uid,
                productId,
                reviewId: deterministicReviewId,
                pointsAwarded: pointsToAward,
                createdAt: now
              });
              tx.set(ledgerRef, {
                id: ledgerId,
                userId: uid,
                userEmail: email,
                userName: displayName,
                type: "review_reward",
                pointsDelta: spendableAward,
                grossPointsAwarded: pointsToAward,
                pointsDebtPaid: debtPaid,
                pointsDebtAfter: newPointsDebt,
                balanceBefore: currentPoints,
                balanceAfter: newPointsBalance,
                reason: `${rating}-Star Review (${prodData.name || productId})${photos.length ? " + Photo" : ""}`,
                referenceId: deterministicReviewId,
                productId,
                createdAt: now
              });
            }
            return {
              review: reviewRecord,
              pointsAwarded: pointsToAward,
              pointsDebtPaid: debtPaid,
              alreadyRewarded,
              rewardPending: !alreadyRewarded && !eligibleOrder && rating >= 4,
              pointsBalance: newPointsBalance
            };
          });
          await syncProductVisibleReviews(db2, productId);
          return {
            statusCode: 200,
            headers: JSON_HEADERS,
            body: JSON.stringify({
              ok: true,
              ...txResult
            })
          };
        }
        if (action === "customer_redeem_reward") {
          const { uid, email, name, db: db2 } = await verifyCustomerToken(event);
          const tierId = String(body.tierId || "").trim();
          const requestId = String(body.requestId || `req_${Date.now()}`).trim();
          if (!/^[A-Za-z0-9_-]{8,100}$/.test(requestId)) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Invalid redemption request ID." }) };
          }
          if (!tierId) {
            return {
              statusCode: 400,
              headers: JSON_HEADERS,
              body: JSON.stringify({ ok: false, error: "Missing reward tierId." })
            };
          }
          const userRef = db2.collection("users").doc(uid);
          const rewardCfgRef = db2.collection("store_config").doc("reward_settings");
          const idempotencyRef = db2.collection("points_ledger").doc(`led_redeem_${uid}_${requestId}`);
          const redeemResult = await db2.runTransaction(async (tx) => {
            const [idemSnap, userSnap, cfgSnap] = await Promise.all([
              tx.get(idempotencyRef),
              tx.get(userRef),
              tx.get(rewardCfgRef)
            ]);
            if (idemSnap.exists) {
              const prev = idemSnap.data() || {};
              return {
                alreadyProcessed: true,
                couponCode: prev.couponCode,
                discountPercent: prev.discountPercent,
                pointsBalance: prev.balanceAfter,
                pointsCost: Number(prev.pointsCost || Math.abs(Number(prev.pointsDelta || 0)))
              };
            }
            const rewardCfg = cfgSnap.exists ? getRewardSettings(cfgSnap.data()) : DEFAULT_REWARD_SETTINGS;
            if (rewardCfg.rewardCouponTiersEnabled === false) throw new Error("Admin \u1019\u103E Reward Coupon Tier \u1021\u101E\u1005\u103A\u101C\u1032\u101C\u103E\u101A\u103A\u1001\u103D\u1004\u1037\u103A\u1000\u102D\u102F \u101A\u102C\u101A\u102E\u1015\u102D\u1010\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B");
            const tiers = Array.isArray(rewardCfg.tiers) ? rewardCfg.tiers : [];
            const tier = tiers.find((t) => String(t.id) === tierId);
            if (!tier) {
              throw new Error("Selected reward tier is no longer available.");
            }
            const cost = Math.max(1, parseInt(tier.pointsCost, 10) || 100);
            const discountPercent = Math.min(90, Math.max(1, parseInt(tier.discountPercent, 10) || 5));
            const userData = userSnap.exists ? userSnap.data() || {} : {};
            const currentPoints = Number(userData.pointsBalance || 0);
            const pointsDebt = Math.max(0, Number(userData.pointsDebt || 0));
            if (pointsDebt > 0) throw new Error(`Refund \u1000\u103C\u1031\u102C\u1004\u1037\u103A \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1015\u1031\u1038\u1006\u1015\u103A\u101B\u1014\u103A Points ${pointsDebt} \u1000\u103B\u1014\u103A\u101B\u103E\u102D\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104B Points \u1021\u101E\u1005\u103A\u101B\u101B\u103E\u102D\u1015\u103C\u102E\u1038\u1019\u103E Coupon \u101C\u1032\u101C\u103E\u101A\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u1019\u100A\u103A\u104B`);
            if (currentPoints < cost) {
              throw new Error(`Points \u1019\u101C\u102F\u1036\u101C\u1031\u102C\u1000\u103A\u1015\u102B\u104B \u101C\u102D\u102F\u1021\u1015\u103A\u101E\u1031\u102C Points: ${cost} (\u101C\u1000\u103A\u101B\u103E\u102D: ${currentPoints})`);
            }
            const newBalance = currentPoints - cost;
            const randomSuffix = cryptoCompat.randomBytes(5).toString("hex").toUpperCase();
            const couponCode = `RWD${discountPercent}-${randomSuffix}`;
            const now = Date.now();
            const couponDocRef = db2.collection("redeemed_coupons").doc(couponCode);
            const tierHasValidity = tier.validityDays !== void 0 && tier.validityDays !== null && tier.validityDays !== "";
            const couponValidityDays = Math.min(3650, Math.max(0, Math.floor(Number(tierHasValidity ? tier.validityDays : rewardCfg.couponValidityDays || 0))));
            const expiresAt = couponValidityDays > 0 ? now + couponValidityDays * 864e5 : null;
            const rawProductIds = Array.isArray(tier.productIds) ? tier.productIds.map((id) => String(id).trim()).filter(Boolean).slice(0, 100) : ["all"];
            const couponProductIds = rawProductIds.includes("all") || rawProductIds.length === 0 ? ["all"] : rawProductIds.filter((id) => id !== "all");
            const couponRecord = {
              code: couponCode,
              percent: discountPercent,
              productIds: couponProductIds,
              minPurchase: Math.min(1e12, Math.max(0, Math.floor(Number(tier.minPurchase) || 0))),
              maxDiscount: Math.min(1e9, Math.max(0, Math.floor(Number(tier.maxDiscount) || 0))),
              userId: uid,
              userEmail: email,
              tierId: tier.id,
              pointsCost: cost,
              used: false,
              validityDays: couponValidityDays,
              expiresAt,
              createdAt: now
            };
            tx.set(couponDocRef, couponRecord);
            const pointsTotalUsed = Math.max(0, Number(userData.pointsTotalUsed || 0)) + cost;
            const pointsHistory = Array.isArray(userData.pointsHistory) ? userData.pointsHistory.slice() : [];
            pointsHistory.unshift({ id: idempotencyRef.id, type: "coupon_redeem", points: cost, couponCode, createdAt: now, balanceAfter: newBalance });
            tx.set(userRef, {
              pointsBalance: newBalance,
              pointsTotalUsed,
              pointsHistory: pointsHistory.slice(0, 100),
              updatedAt: now
            }, { merge: true });
            tx.create(db2.collection("financial_audit_logs").doc(`reward_redeem_${uid}_${requestId}`), {
              eventType: "reward_coupon_redeemed",
              userId: uid,
              couponCode,
              pointsCost: cost,
              discountPercent,
              createdAt: now
            });
            tx.set(idempotencyRef, {
              id: idempotencyRef.id,
              userId: uid,
              userEmail: email,
              userName: userData.name || name,
              type: "reward_redeem",
              pointsDelta: -cost,
              balanceBefore: currentPoints,
              balanceAfter: newBalance,
              couponCode,
              discountPercent,
              reason: `Redeemed ${discountPercent}% OFF Coupon (${couponCode})`,
              referenceId: couponCode,
              createdAt: now
            });
            return {
              couponCode,
              discountPercent,
              pointsCost: cost,
              pointsBalance: newBalance
            };
          });
          return {
            statusCode: 200,
            headers: JSON_HEADERS,
            body: JSON.stringify({ ok: true, ...redeemResult })
          };
        }
        if (action === "customer_reconcile_cashback") {
          const { uid, db: db2 } = await verifyCustomerToken(event);
          const userRef = db2.collection("users").doc(uid);
          const [userSnap, ordersSnap, ledgerSnap, rewardLedgerSnap, cfgSnap] = await Promise.all([
            userRef.get(),
            db2.collection("orders").where("userId", "==", uid).get(),
            db2.collection("cashback_ledger").where("userId", "==", uid).get(),
            db2.collection("purchase_reward_ledger").where("userId", "==", uid).get(),
            db2.collection("store_config").doc("reward_settings").get()
          ]);
          const user = userSnap.exists ? userSnap.data() || {} : {};
          const eligibleOrders = ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() || {} })).filter((order) => {
            const status = String(order.status || "").toLowerCase();
            return status === "completed" && !order.refundedAt && order.refunded !== true;
          });
          const spendOf = /* @__PURE__ */ __name((order) => Math.max(0, Number(order.totalAmount || 0) - Math.max(0, Number(order.refundedAmount || order.partialRefundAmount || 0))), "spendOf");
          const lifetimeSpend = eligibleOrders.reduce((sum, order) => sum + spendOf(order), 0);
          const currentMonthKey = myanmarMonthKey(Date.now());
          const cfgRaw = cfgSnap.exists ? cfgSnap.data() || {} : {};
          const cfg = cfgSnap.exists ? getRewardSettings(cfgRaw) : DEFAULT_REWARD_SETTINGS;
          const lifetimeTierVersion = Math.max(1, Number(cfgRaw.purchaseTiersVersion || 1));
          const monthlyTierVersion = Math.max(1, Number(cfgRaw.monthlyPurchaseTiersVersion || 1));
          const lifetimeActivatedAt = Math.max(0, Number(cfgRaw.purchaseTiersActivatedAt || 0));
          const monthlyActivatedAt = Math.max(0, Number(cfgRaw.monthlyPurchaseTiersActivatedAt || 0));
          const monthlyActivationMonthKey = String(cfgRaw.monthlyPurchaseTiersActivationMonthKey || "");
          const tierStamp = /* @__PURE__ */ __name((order) => Number(order.completedAt || order.createdAt || 0), "tierStamp");
          const isLifetimeTierOrder = /* @__PURE__ */ __name((order) => !lifetimeActivatedAt || tierStamp(order) >= lifetimeActivatedAt, "isLifetimeTierOrder");
          const isMonthlyTierOrder = /* @__PURE__ */ __name((order) => !monthlyActivatedAt || monthlyActivationMonthKey !== currentMonthKey || tierStamp(order) >= monthlyActivatedAt, "isMonthlyTierOrder");
          const lifetimeTierSpend = eligibleOrders.filter(isLifetimeTierOrder).reduce((sum, order) => sum + spendOf(order), 0);
          const monthSpend = eligibleOrders.reduce((sum, order) => {
            const stamp = tierStamp(order);
            return stamp && myanmarMonthKey(stamp) === currentMonthKey ? sum + spendOf(order) : sum;
          }, 0);
          const currentMonthTierSpend = eligibleOrders.filter((order) => {
            const stamp = tierStamp(order);
            return stamp && myanmarMonthKey(stamp) === currentMonthKey && isMonthlyTierOrder(order);
          }).reduce((sum, order) => sum + spendOf(order), 0);
          const chronologicalEligibleOrders = eligibleOrders.slice().sort((a, b) => tierStamp(a) - tierStamp(b));
          const findThresholdOrderId = /* @__PURE__ */ __name((threshold, monthKey = null, programType = "lifetime") => {
            let runningSpend = 0;
            for (const order of chronologicalEligibleOrders) {
              const stamp = tierStamp(order);
              if (programType === "lifetime" && !isLifetimeTierOrder(order)) continue;
              if (programType === "monthly" && (!stamp || myanmarMonthKey(stamp) !== monthKey || !isMonthlyTierOrder(order))) continue;
              if (monthKey && programType !== "monthly" && (!stamp || myanmarMonthKey(stamp) !== monthKey)) continue;
              runningSpend += spendOf(order);
              if (runningSpend >= Number(threshold)) return String(order.id || "");
            }
            return null;
          }, "findThresholdOrderId");
          const lifetimeTiers = cfg.lifetimeCashbackTiersEnabled === false ? [] : (Array.isArray(cfg.purchaseTiers) ? cfg.purchaseTiers : []).filter((t) => t && t.rewardType === "cashback" && Number(t.threshold) > 0 && Number(t.rewardValue) > 0);
          const monthlyTiers = cfg.monthlyCashbackTiersEnabled === false ? [] : (Array.isArray(cfg.monthlyPurchaseTiers) ? cfg.monthlyPurchaseTiers : []).filter((t) => t && Number(t.threshold) > 0 && Number(t.rewardValue) > 0);
          const ledgerRows = ledgerSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() || {} }));
          const rewardRows = rewardLedgerSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() || {} }));
          const lifetimeClaimKey = /* @__PURE__ */ __name((tierId) => lifetimeTierVersion > 1 ? `${lifetimeTierVersion}:${tierId}` : String(tierId), "lifetimeClaimKey");
          const monthlyClaimKey = /* @__PURE__ */ __name((monthKey, tierId) => monthlyTierVersion > 1 ? `${monthKey}:${monthlyTierVersion}:${tierId}` : `${monthKey}:${tierId}`, "monthlyClaimKey");
          const claimedLifetime = new Set((Array.isArray(user.purchaseRewardTierIds) ? user.purchaseRewardTierIds : []).map(String));
          const claimedMonthly = new Set((Array.isArray(user.monthlyPurchaseRewardTierKeys) ? user.monthlyPurchaseRewardTierKeys : []).map(String));
          (Array.isArray(user.purchaseRewardHistory) ? user.purchaseRewardHistory : []).forEach((row) => {
            if (!row || row.rewardType !== "cashback") return;
            if (row.programType === "monthly" && row.monthKey && Number(row.tierVersion || 1) === monthlyTierVersion) claimedMonthly.add(monthlyClaimKey(String(row.monthKey), String(row.id || row.tierId || "")));
            else if (row.programType === "lifetime" && Number(row.tierVersion || 1) === lifetimeTierVersion) claimedLifetime.add(lifetimeClaimKey(String(row.id || row.tierId || "")));
          });
          ledgerRows.filter((x) => x.type === "earned").forEach((x) => {
            if (x.programType === "monthly" && Number(x.tierVersion || 1) === monthlyTierVersion) claimedMonthly.add(monthlyClaimKey(String(x.monthKey || ""), String(x.tierId || "")));
            else if (x.programType === "lifetime" && Number(x.tierVersion || 1) === lifetimeTierVersion) claimedLifetime.add(lifetimeClaimKey(String(x.tierId || "")));
          });
          rewardRows.filter((x) => x.rewardType === "cashback").forEach((x) => {
            if (x.programType === "monthly" && Number(x.tierVersion || 1) === monthlyTierVersion) claimedMonthly.add(monthlyClaimKey(String(x.monthKey || ""), String(x.tierId || "")));
            else if (x.programType === "lifetime" && Number(x.tierVersion || 1) === lifetimeTierVersion) claimedLifetime.add(lifetimeClaimKey(String(x.tierId || "")));
          });
          const pending = [];
          for (const tier of lifetimeTiers) {
            if (lifetimeTierSpend >= Number(tier.threshold) && !claimedLifetime.has(lifetimeClaimKey(String(tier.id)))) pending.push({ tier, programType: "lifetime", monthKey: null, tierVersion: lifetimeTierVersion, orderId: findThresholdOrderId(tier.threshold, null, "lifetime") });
          }
          const monthBuckets = /* @__PURE__ */ new Map();
          eligibleOrders.forEach((order) => {
            const stamp = Number(order.completedAt || order.createdAt || 0);
            if (!stamp) return;
            const key = myanmarMonthKey(stamp);
            monthBuckets.set(key, (monthBuckets.get(key) || 0) + spendOf(order));
          });
          const currentMonthSpendForTiers = currentMonthTierSpend;
          for (const tier of monthlyTiers) {
            const claimKey = monthlyClaimKey(currentMonthKey, String(tier.id));
            if (currentMonthSpendForTiers >= Number(tier.threshold) && !claimedMonthly.has(claimKey)) pending.push({ tier, programType: "monthly", monthKey: currentMonthKey, tierVersion: monthlyTierVersion, orderId: findThresholdOrderId(tier.threshold, currentMonthKey, "monthly") });
          }
          const approved = pending;
          const now = Date.now();
          const claimRefs = approved.map((item) => {
            const tierId = String(item.tier.id);
            const safeTierId = tierId.replace(/[^A-Za-z0-9_-]/g, "_");
            const cashbackId = item.programType === "monthly" ? `reconcile_monthly_${uid}_${item.monthKey}_${safeTierId}` : `reconcile_lifetime_${uid}_${safeTierId}`;
            const rewardId = item.programType === "monthly" ? `reconcile_purchase_monthly_${uid}_${item.monthKey}_${safeTierId}` : `reconcile_purchase_lifetime_${uid}_${safeTierId}`;
            const claimId = item.programType === "monthly" ? `${uid}_monthly_${item.monthKey}_${safeTierId}${item.tierVersion > 1 ? `_v${item.tierVersion}` : ""}` : `${uid}_lifetime_${safeTierId}${item.tierVersion > 1 ? `_v${item.tierVersion}` : ""}`;
            return {
              ...item,
              tierId,
              cashbackRef: db2.collection("cashback_ledger").doc(cashbackId),
              rewardRef: db2.collection("purchase_reward_ledger").doc(rewardId),
              claimRef: db2.collection("cashback_reward_claims").doc(claimId),
              orderMarkerRef: item.orderId ? db2.collection("purchase_order_rewards").doc(`${uid}_${item.orderId}`) : null,
              sourceOrder: item.orderId ? eligibleOrders.find((order) => String(order.id) === String(item.orderId)) || null : null
            };
          });
          const earnedFromLedger = ledgerRows.reduce((sum, row) => sum + (row.type === "earned" ? Math.max(0, Number(row.amount || 0)) : row.type === "refund_reversal" ? -Math.max(0, Number(row.amount || 0)) : 0), 0);
          const usedFromLedger = ledgerRows.reduce((sum, row) => sum + (row.type === "used" ? Math.max(0, Number(row.amount || 0)) : ["refund_restore", "cancel_restore"].includes(row.type) ? -Math.max(0, Number(row.amount || 0)) : 0), 0);
          const orderedLedgerRows = ledgerRows.slice().sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
          let ledgerBalance = null;
          let ledgerBalanceIndex = -1;
          orderedLedgerRows.forEach((row, index) => {
            if (row.balanceAfter !== void 0 && Number.isFinite(Number(row.balanceAfter))) {
              ledgerBalance = Math.max(0, Number(row.balanceAfter));
              ledgerBalanceIndex = index;
            }
          });
          if (ledgerBalanceIndex >= 0) {
            for (const row of orderedLedgerRows.slice(ledgerBalanceIndex + 1)) {
              if (row.type === "earned") ledgerBalance += Math.max(0, Number(row.creditedAmount ?? row.amount ?? 0));
              else if (row.type === "used" || row.type === "refund_reversal") ledgerBalance = Math.max(0, ledgerBalance - Math.max(0, Number(row.amount || 0)));
              else if (row.type === "refund_restore" || row.type === "cancel_restore") ledgerBalance += Math.max(0, Number(row.amount || 0));
            }
          }
          let reconciled = { credited: 0, earned: 0, used: 0, count: 0 };
          await db2.runTransaction(async (tx) => {
            const freshUserSnap = await tx.get(userRef);
            const freshUser = freshUserSnap.exists ? freshUserSnap.data() || {} : {};
            const markerRefsById = new Map(claimRefs.filter((item) => item.orderMarkerRef).map((item) => [item.orderMarkerRef.id, item.orderMarkerRef]));
            const markerRefs = [...markerRefsById.values()];
            const [claimSnaps, rewardClaimSnaps, freshLedgerSnap, markerSnaps] = await Promise.all([
              Promise.all(claimRefs.map((item) => tx.get(item.cashbackRef))),
              Promise.all(claimRefs.map((item) => tx.get(item.claimRef))),
              tx.get(db2.collection("cashback_ledger").where("userId", "==", uid)),
              Promise.all(markerRefs.map((ref2) => tx.get(ref2)))
            ]);
            const markerDataById = new Map(markerRefs.map((ref2, index) => [ref2.id, markerSnaps[index].exists ? markerSnaps[index].data() || {} : {}]));
            const markerUpdates = /* @__PURE__ */ new Map();
            const freshLedgerRows = freshLedgerSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() || {} }));
            const freshEarnedFromLedger = freshLedgerRows.reduce((sum, row) => sum + (row.type === "earned" ? Math.max(0, Number(row.amount || 0)) : row.type === "refund_reversal" ? -Math.max(0, Number(row.amount || 0)) : 0), 0);
            const freshUsedFromLedger = freshLedgerRows.reduce((sum, row) => sum + (row.type === "used" ? Math.max(0, Number(row.amount || 0)) : ["refund_restore", "cancel_restore"].includes(row.type) ? -Math.max(0, Number(row.amount || 0)) : 0), 0);
            const freshOrderedLedgerRows = freshLedgerRows.slice().sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
            let freshLedgerBalance = null;
            let freshLedgerBalanceIndex = -1;
            freshOrderedLedgerRows.forEach((row, index) => {
              if (row.balanceAfter !== void 0 && Number.isFinite(Number(row.balanceAfter))) {
                freshLedgerBalance = Math.max(0, Number(row.balanceAfter));
                freshLedgerBalanceIndex = index;
              }
            });
            if (freshLedgerBalanceIndex >= 0) {
              for (const row of freshOrderedLedgerRows.slice(freshLedgerBalanceIndex + 1)) {
                if (row.type === "earned") freshLedgerBalance += Math.max(0, Number(row.creditedAmount ?? row.amount ?? 0));
                else if (row.type === "used" || row.type === "refund_reversal") freshLedgerBalance = Math.max(0, freshLedgerBalance - Math.max(0, Number(row.amount || 0)));
                else if (row.type === "refund_restore" || row.type === "cancel_restore") freshLedgerBalance += Math.max(0, Number(row.amount || 0));
              }
            }
            const freshBalance = freshLedgerBalance === null ? Math.max(0, Number(freshUser.cashbackBalance || 0)) : freshLedgerBalance;
            let balance = freshBalance;
            let debt = Math.max(0, Number(freshUser.cashbackDebt || 0));
            let creditedNow = 0;
            let newlyClaimedCount = 0;
            const newLifetimeIds = [];
            const newMonthlyKeys = [];
            const newHistory = Array.isArray(freshUser.purchaseRewardHistory) ? freshUser.purchaseRewardHistory.slice() : [];
            const newCashbackHistory = Array.isArray(freshUser.cashbackHistory) ? freshUser.cashbackHistory.slice() : [];
            for (let i = 0; i < claimRefs.length; i++) {
              const item = claimRefs[i];
              const rewardKey = item.programType === "monthly" ? `monthly:${item.monthKey}:${item.tierVersion}:${item.tierId}` : `lifetime:${item.tierVersion}:${item.tierId}`;
              const markerId = item.orderMarkerRef ? item.orderMarkerRef.id : "";
              const markerExisting = markerId ? markerUpdates.get(markerId)?.data || markerDataById.get(markerId) || {} : {};
              const markerAlreadyHasReward = (Array.isArray(markerExisting.earnedRewards) ? markerExisting.earnedRewards : []).some((row) => String(row.rewardKey || "") === rewardKey);
              if (claimSnaps[i].exists || rewardClaimSnaps[i].exists || markerAlreadyHasReward) continue;
              const value = Math.max(0, Math.floor(Number(item.tier.rewardValue || 0)));
              const debtPaid = Math.min(debt, value);
              debt -= debtPaid;
              balance += value - debtPaid;
              creditedNow += value;
              newlyClaimedCount += 1;
              const historyEntry = { id: item.tierId, programType: item.programType, monthKey: item.monthKey, tierVersion: item.tierVersion, threshold: Number(item.tier.threshold), rewardType: "cashback", rewardValue: value, orderId: item.orderId || null, earnedAt: now, status: "credited", cashbackDebtPaid: debtPaid, reconciled: true };
              newHistory.unshift(historyEntry);
              newCashbackHistory.unshift({ id: item.cashbackRef.id, type: "earned", amount: value, creditedAmount: value - debtPaid, debtPaid, orderId: item.orderId || null, programType: item.programType, monthKey: item.monthKey, createdAt: now, balanceAfter: balance, reconciled: true });
              tx.create(item.cashbackRef, { id: item.cashbackRef.id, userId: uid, orderId: item.orderId || null, tierId: item.tierId, tierVersion: item.tierVersion, programType: item.programType, monthKey: item.monthKey, type: "earned", amount: value, creditedAmount: value - debtPaid, debtPaid, balanceAfter: balance, source: "completed_order_reconciliation", threshold: Number(item.tier.threshold), createdAt: now });
              tx.create(item.rewardRef, { id: item.rewardRef.id, tierId: item.tierId, tierVersion: item.tierVersion, programType: item.programType, monthKey: item.monthKey, userId: uid, userEmail: freshUser.email || "", userName: freshUser.name || "", orderId: item.orderId || null, threshold: Number(item.tier.threshold), rewardType: "cashback", rewardValue: value, source: "completed_order_reconciliation", createdAt: now });
              tx.create(item.claimRef, { id: item.claimRef.id, userId: uid, tierId: item.tierId, tierVersion: item.tierVersion, programType: item.programType, monthKey: item.monthKey, orderId: item.orderId || null, threshold: Number(item.tier.threshold), rewardValue: value, source: "completed_order_reconciliation", createdAt: now });
              if (item.programType === "monthly") newMonthlyKeys.push(monthlyClaimKey(item.monthKey, item.tierId));
              else newLifetimeIds.push(lifetimeClaimKey(item.tierId));
              if (item.orderMarkerRef && item.sourceOrder) {
                const markerId2 = item.orderMarkerRef.id;
                const base = markerUpdates.get(markerId2)?.data || markerDataById.get(markerId2) || {};
                const sourceOrder = item.sourceOrder;
                const sourceMonthKey = myanmarMonthKey(sourceOrder.completedAt || sourceOrder.createdAt || 0);
                const earnedRewards = Array.isArray(base.earnedRewards) ? base.earnedRewards.slice() : [];
                earnedRewards.push({ id: item.tierId, tierId: item.tierId, tierVersion: item.tierVersion, programType: item.programType, monthKey: item.monthKey, threshold: Number(item.tier.threshold), rewardType: "cashback", rewardValue: value, couponCode: null, rewardKey });
                markerUpdates.set(markerId2, {
                  ref: item.orderMarkerRef,
                  data: {
                    userId: uid,
                    orderId: item.orderId,
                    totalAmount: Number(sourceOrder.totalAmount || 0),
                    monthKey: sourceMonthKey,
                    monthlyTotalSpent: monthBuckets.get(sourceMonthKey) || 0,
                    earnedTierIds: [.../* @__PURE__ */ new Set([...Array.isArray(base.earnedTierIds) ? base.earnedTierIds.map(String) : [], ...item.programType === "lifetime" ? [item.tierId] : []])],
                    monthlyEarnedTierKeys: [.../* @__PURE__ */ new Set([...Array.isArray(base.monthlyEarnedTierKeys) ? base.monthlyEarnedTierKeys.map(String) : [], ...item.programType === "monthly" ? [`${item.monthKey}:${item.tierId}`] : []])],
                    cashbackCredited: Math.max(0, Number(base.cashbackCredited || 0)) + value,
                    earnedRewards,
                    issuedCoupons: Array.isArray(base.issuedCoupons) ? base.issuedCoupons : [],
                    creditedAt: now,
                    reconciled: true
                  }
                });
              }
            }
            for (const markerUpdate of markerUpdates.values()) tx.set(markerUpdate.ref, markerUpdate.data, { merge: true });
            const earnedTotal = Math.max(0, freshLedgerRows.length ? freshEarnedFromLedger + creditedNow : Number(freshUser.cashbackTotalEarned || 0) + creditedNow);
            const usedTotal = Math.max(0, freshLedgerRows.length ? freshUsedFromLedger : Number(freshUser.cashbackTotalUsed || 0));
            tx.set(userRef, {
              purchaseTotalSpent: lifetimeSpend,
              purchaseOrderCount: eligibleOrders.length,
              monthlyPurchaseMonthKey: currentMonthKey,
              monthlyPurchaseTotalSpent: monthSpend,
              cashbackBalance: balance,
              cashbackDebt: debt,
              cashbackTotalEarned: earnedTotal,
              cashbackTotalUsed: usedTotal,
              purchaseRewardTierIds: [.../* @__PURE__ */ new Set([...Array.isArray(freshUser.purchaseRewardTierIds) ? freshUser.purchaseRewardTierIds.map(String) : [], ...newLifetimeIds])],
              monthlyPurchaseRewardTierKeys: [.../* @__PURE__ */ new Set([...Array.isArray(freshUser.monthlyPurchaseRewardTierKeys) ? freshUser.monthlyPurchaseRewardTierKeys.map(String) : [], ...newMonthlyKeys])],
              purchaseRewardHistory: newHistory.slice(0, 100),
              cashbackHistory: newCashbackHistory.slice(0, 100),
              updatedAt: now
            }, { merge: true });
            reconciled = { credited: creditedNow, earned: earnedTotal, used: usedTotal, count: newlyClaimedCount };
          });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, lifetimeSpend, monthSpend, currentMonthKey, eligibleOrderCount: eligibleOrders.length, newlyCredited: reconciled.credited, reconciledTierCount: reconciled.count, cashbackTotalEarned: reconciled.earned, cashbackTotalUsed: reconciled.used }) };
        }
        if (action === "validate_coupon") {
          const { uid, db: db2 } = await verifyCustomerToken(event);
          const code = String(body.code || "").trim().toUpperCase();
          if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Coupon Code \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B" }) };
          const [rSnap, rewardCfgSnap] = await Promise.all([
            db2.collection("redeemed_coupons").doc(code).get(),
            db2.collection("store_config").doc("reward_settings").get()
          ]);
          if (rSnap.exists) {
            const rewardCfg = rewardCfgSnap.exists ? rewardCfgSnap.data() || {} : {};
            if (rewardCfg.rewardCouponsEnabled === false) return { statusCode: 403, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Admin \u1019\u103E Reward Coupon \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1001\u103D\u1004\u1037\u103A\u1000\u102D\u102F \u101A\u102C\u101A\u102E\u1015\u102D\u1010\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B" }) };
            const rData = rSnap.data() || {};
            if (String(rData.userId || "") !== uid) return { statusCode: 403, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "\u1024 Reward Coupon \u101E\u100A\u103A \u101E\u1004\u1037\u103A\u1021\u1000\u1031\u102C\u1004\u1037\u103A\u1021\u1010\u103D\u1000\u103A \u1019\u101F\u102F\u1010\u103A\u1015\u102B\u104B" }) };
            if (rData.revoked === true || rData.revokedBySourceRefund === true) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "\u1024 Reward Coupon \u1000\u102D\u102F Refund \u1000\u103C\u1031\u102C\u1004\u1037\u103A \u1015\u101A\u103A\u1016\u103B\u1000\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B" }) };
            if (rData.used === true) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "\u1024 Reward Coupon \u1000\u102D\u102F \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1015\u103C\u102E\u1038\u101E\u102C\u1038 \u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B" }) };
            if (Number(rData.expiresAt || 0) > 0 && Number(rData.expiresAt) <= Date.now()) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "\u1024 Reward Coupon \u101E\u1000\u103A\u1010\u1019\u103A\u1038\u1000\u102F\u1014\u103A\u1006\u102F\u1036\u1038\u101E\u103D\u102C\u1038\u1015\u102B\u1015\u103C\u102E\u104B" }) };
            return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, coupon: { code: rData.code, percent: rData.percent, productIds: rData.productIds || ["all"], minPurchase: Math.max(0, Number(rData.minPurchase || 0)), maxDiscount: Math.max(0, Number(rData.maxDiscount || 0)), userId: rData.userId, expiresAt: rData.expiresAt || null, isRewardCoupon: true } }) };
          }
          const cfgSnap = await db2.collection("store_config").doc("coupons").get();
          const promoItems = cfgSnap.exists && Array.isArray((cfgSnap.data() || {}).items) ? (cfgSnap.data() || {}).items : [];
          const promo = promoItems.find((item) => String(item.code || "").trim().toUpperCase() === code && item.isRewardCoupon !== true);
          if (!promo || promo.disabled === true) return { statusCode: 404, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Coupon \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B" }) };
          if (Number(promo.expiresAt || 0) > 0 && Number(promo.expiresAt) <= Date.now()) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "\u1024 Coupon \u101E\u1000\u103A\u1010\u1019\u103A\u1038\u1000\u102F\u1014\u103A\u1006\u102F\u1036\u1038\u101E\u103D\u102C\u1038\u1015\u102B\u1015\u103C\u102E\u104B" }) };
          const promoCounter = await ensurePromoCouponCounter(db2, code);
          const userUsage = await ensurePromoUserUsage(db2, code, uid);
          const userUsageCount = userUsage.usageCount;
          try {
            assertPromoUsageAllowed(promo, promoCounter.usageCount, userUsageCount);
          } catch (usageError) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: usageError.message }) };
          }
          const usageLimits = getPromoUsageLimits(promo);
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, coupon: { code: String(promo.code).toUpperCase(), percent: Math.min(90, Math.max(1, Number(promo.percent) || 0)), productIds: Array.isArray(promo.productIds) ? promo.productIds : ["all"], maxDiscount: Math.max(0, Number(promo.maxDiscount || 0)), totalUsageLimit: usageLimits.total, perUserUsageLimit: usageLimits.perUser, usageCount: promoCounter.usageCount, expiresAt: promo.expiresAt || null, isRewardCoupon: false } }) };
        }
        const { uid: adminUid, email: adminEmail, role: adminRole, db } = await verifyAdminRequest(event);
        if (action === "admin_query_audit_records") {
          const auditType = String(body.auditType || "").trim();
          const allowedSources = {
            points: ["points_ledger"],
            rewards: ["cashback_ledger", "purchase_reward_ledger", "financial_audit_logs"],
            financial: ["financial_audit_logs", "points_audit_logs", "cashback_ledger", "purchase_reward_ledger"]
          };
          if (!allowedSources[auditType]) throw new Error("Invalid audit center.");
          const pageSize = Math.max(10, Math.min(100, Math.floor(Number(body.pageSize) || 25)));
          const filters = body.filters && typeof body.filters === "object" ? body.filters : {};
          const search = String(filters.search || "").trim().toLowerCase().slice(0, 120);
          const userId = String(filters.userId || "").trim().slice(0, 128);
          const dateFrom = Number.isFinite(Number(filters.dateFrom)) && Number(filters.dateFrom) > 0 ? Number(filters.dateFrom) : null;
          const dateTo = Number.isFinite(Number(filters.dateTo)) && Number(filters.dateTo) > 0 ? Number(filters.dateTo) : null;
          const activity = String(filters.activity || "all").trim().toLowerCase();
          const status = String(filters.status || "all").trim().toLowerCase();
          let cursor = body.cursor && typeof body.cursor === "object" ? body.cursor : {};
          const cursorSources = cursor.sources && typeof cursor.sources === "object" ? cursor.sources : {};
          const maxScanPerSource = 600;
          const batchSize = 100;
          const fieldPath = admin.firestore.FieldPath.documentId();
          const isMatch = /* @__PURE__ */ __name((item, source) => {
            const createdAt = Number(item.createdAt || 0);
            if (dateFrom !== null && createdAt < dateFrom) return false;
            if (dateTo !== null && createdAt > dateTo) return false;
            if (userId && ![item.userId, item.targetUserId].some((v) => String(v || "") === userId)) return false;
            if (auditType === "rewards" && source === "financial_audit_logs" && !(/* @__PURE__ */ new Set(["purchase_reward_issued", "purchase_reward_blocked_by_cap", "reward_coupon_redeemed", "promotion_coupon_used", "promotion_coupon_usage_restored", "checkout_discount_applied"])).has(String(item.eventType || ""))) return false;
            if (activity !== "all" && !String(item.eventType || item.type || item.rewardType || item.action || "").toLowerCase().includes(activity)) return false;
            const statusText = `${item.status || ""} ${item.type || ""} ${item.eventType || ""}`.toLowerCase();
            if (status !== "all") {
              const patterns = { success: /issued|earned|success|completed|recorded|admin_add|admin_adjustment/, used: /used|redeemed|checkout_redemption/, reversed: /revers|refund|restore/, blocked: /blocked|cap|denied|suspend/, failed: /failed|error/ };
              if (patterns[status] && !patterns[status].test(statusText)) return false;
              if (status === "success" && /refund|revers|cancel|blocked|failed|error/.test(statusText)) return false;
            }
            if (search) {
              const searchable = [item.id, item.userId, item.targetUserId, item.userEmail, item.targetUserEmail, item.userName, item.targetUserName, item.orderId, item.refundOrderId, item.referenceId, item.productId, item.couponCode, item.code, item.eventType, item.type, item.rewardType, item.programType, item.tierId, item.tierVersion, item.reason, item.adminEmail, item.adminUid, item.status].map((v) => String(v || "")).join(" ").toLowerCase();
              if (!searchable.includes(search)) return false;
            }
            return true;
          }, "isMatch");
          const sourceResults = await Promise.all(allowedSources[auditType].map(async (source) => {
            const initial = cursorSources[source] && typeof cursorSources[source] === "object" ? cursorSources[source] : null;
            let scanCursor = initial;
            let scanned = 0;
            let hasMoreSource = false;
            const matches = [];
            while (scanned < maxScanPerSource && matches.length <= pageSize) {
              let query = db.collection(source);
              if (dateFrom !== null) query = query.where("createdAt", ">=", dateFrom);
              if (dateTo !== null) query = query.where("createdAt", "<=", dateTo);
              query = query.orderBy("createdAt", "desc").orderBy(fieldPath, "desc");
              if (scanCursor && Number.isFinite(Number(scanCursor.createdAt)) && scanCursor.id) query = query.startAfter(Number(scanCursor.createdAt), String(scanCursor.id));
              const take = Math.min(batchSize, maxScanPerSource - scanned);
              const snap = await query.limit(take).get();
              if (snap.empty) {
                hasMoreSource = false;
                break;
              }
              snap.docs.forEach((doc) => {
                const data = doc.data() || {};
                const item = { ...data, id: String(data.id || doc.id), _docId: doc.id, _sourceCollection: source };
                if (isMatch(item, source)) matches.push(item);
              });
              scanned += snap.size;
              const last = snap.docs[snap.docs.length - 1];
              scanCursor = { createdAt: Number((last.data() || {}).createdAt || 0), id: last.id };
              hasMoreSource = snap.size === take;
              if (!hasMoreSource || matches.length > pageSize) break;
            }
            matches.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0) || String(b._docId || b.id).localeCompare(String(a._docId || a.id)));
            return { source, initial, scanCursor, scanned, hasMoreSource, matches };
          }));
          const merged = sourceResults.flatMap((result) => result.matches).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0) || String(a._sourceCollection).localeCompare(String(b._sourceCollection)) || String(b._docId || b.id).localeCompare(String(a._docId || a.id)));
          const rows = merged.slice(0, pageSize);
          const nextSources = {};
          for (const result of sourceResults) {
            const selected = rows.filter((item) => item._sourceCollection === result.source);
            const sourceHasUnreturnedMatches = result.matches.length > selected.length;
            if (sourceHasUnreturnedMatches) {
              if (selected.length) {
                const lastSelected = selected[selected.length - 1];
                nextSources[result.source] = { createdAt: Number(lastSelected.createdAt || 0), id: String(lastSelected._docId || lastSelected.id) };
              } else if (result.initial) nextSources[result.source] = result.initial;
            } else if (result.scanCursor) {
              nextSources[result.source] = result.scanCursor;
            }
          }
          const hasMore = merged.length > pageSize || sourceResults.some((result) => result.hasMoreSource || result.matches.length > rows.filter((item) => item._sourceCollection === result.source).length);
          const nextCursor = hasMore ? { sources: nextSources } : null;
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, auditType, rows, nextCursor, hasMore, scanned: sourceResults.reduce((sum, result) => sum + result.scanned, 0), pageSize }) };
        }
        if (action === "admin_imagekit_orphan_preview" || action === "admin_imagekit_orphan_delete" || action === "admin_product_maintenance_counts") {
          const privateKey = String(process.env.IMAGEKIT_PRIVATE_KEY || "").trim();
          if (!privateKey) throw new Error("IMAGEKIT_PRIVATE_KEY \u1019\u101B\u103E\u102D\u1015\u102B\u104B");
          const auth = `Basic ${BufferCompat.from(`${privateKey}:`).toString("base64")}`;
          const referencedUrls = /* @__PURE__ */ new Set(), referencedIds = /* @__PURE__ */ new Set();
          const scanValue = /* @__PURE__ */ __name((value) => {
            if (typeof value === "string") {
              if (/^https:\/\//i.test(value)) {
                try {
                  const u = new URL(value);
                  if (u.hostname === "ik.imagekit.io" || u.hostname.endsWith(".imagekit.io")) referencedUrls.add(u.href.split("?")[0]);
                } catch (_) {
                }
              }
            } else if (Array.isArray(value)) value.forEach(scanValue);
            else if (value && typeof value === "object") {
              if (value.fileId) referencedIds.add(String(value.fileId));
              Object.values(value).forEach(scanValue);
            }
          }, "scanValue");
          const scanCollection = /* @__PURE__ */ __name(async (col, depth = 0) => {
            if (depth > 3) return;
            const snap = await col.get();
            for (const doc of snap.docs) {
              scanValue(doc.data() || {});
              if (depth < 3) {
                const nested = await doc.ref.listCollections();
                for (const sub of nested) await scanCollection(sub, depth + 1);
              }
            }
          }, "scanCollection");
          const roots = await db.listCollections();
          for (const col of roots) await scanCollection(col);
          const files = [];
          let skip = 0;
          while (true) {
            const endpoint = new URL("https://api.imagekit.io/v1/files");
            endpoint.searchParams.set("path", "/production/products/");
            endpoint.searchParams.set("limit", "1000");
            endpoint.searchParams.set("skip", String(skip));
            const response = await fetch(endpoint, { headers: { Authorization: auth, Accept: "application/json" } });
            if (!response.ok) throw new Error(`ImageKit \u1005\u102C\u101B\u1004\u103A\u1038\u1016\u1010\u103A\u1019\u101B\u1015\u102B (${response.status})`);
            const page = await response.json();
            if (!Array.isArray(page)) throw new Error("ImageKit file list \u1019\u1019\u103E\u1014\u103A\u1015\u102B\u104B");
            files.push(...page.filter((f) => String(f.filePath || "").startsWith("/production/products/")));
            if (page.length < 1e3 || skip >= 2e4) break;
            skip += page.length;
          }
          const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1e3;
          const candidates = files.filter((f) => {
            const created = typeof f.createdAt === "number" ? f.createdAt : Date.parse(f.createdAt || "");
            return f.fileId && f.url && !referencedIds.has(String(f.fileId)) && !referencedUrls.has(String(f.url).split("?")[0]) && Number.isFinite(created) && created < cutoff;
          });
          if (action === "admin_imagekit_orphan_preview") return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, candidates: candidates.map((f) => ({ fileId: f.fileId, name: f.name, filePath: f.filePath, url: f.url, createdAt: f.createdAt })), scanned: files.length, graceDays: 7 }) };
          if (action === "admin_product_maintenance_counts") {
            const pending = await db.collection("products").where("deleteRetryRequired", "==", true).limit(501).get();
            return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, retryDeleteCount: pending.size, unusedImageCount: candidates.length, scannedImages: files.length, graceDays: 7, checkedAt: Date.now() }) };
          }
          const requested = Array.isArray(body.fileIds) ? body.fileIds.map(String).slice(0, 100) : [];
          const eligible = candidates.filter((f) => requested.includes(String(f.fileId)));
          let deleted = 0;
          for (const file of eligible) {
            const r = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(file.fileId)}`, { method: "DELETE", headers: { Authorization: auth, Accept: "application/json" } });
            if (!r.ok && r.status !== 404) throw new Error(`ImageKit \u1015\u102F\u1036\u1016\u103B\u1000\u103A\u1019\u101B\u1015\u102B (${r.status})`);
            deleted++;
          }
          await db.collection("product_delete_audit").doc(`orphan_cleanup_${Date.now()}`).set({ eventType: "orphan_image_cleanup", deleted, requested: requested.length, deletedBy: adminEmail, createdAt: Date.now() });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, deleted, skipped: requested.length - eligible.length }) };
        }
        if (action === "admin_export_product_backup") {
          const [productsSnap, costsSnap] = await Promise.all([
            db.collection("products").get(),
            db.collection("product_costs").get()
          ]);
          const products = productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() || {} }));
          const costs = {};
          costsSnap.forEach((doc) => {
            costs[doc.id] = Math.max(0, Number((doc.data() || {}).costPrice || 0));
          });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, backup: { schemaVersion: 1, projectId: process.env.FIREBASE_PROJECT_ID || "", exportedAt: (/* @__PURE__ */ new Date()).toISOString(), products, costs } }) };
        }
        if (action === "admin_restore_product_backup") {
          const backup = body.backup || {};
          if (backup.schemaVersion !== 1 || !Array.isArray(backup.products) || backup.products.length > 5e3) throw new Error("Product Backup \u1016\u102D\u102F\u1004\u103A\u1015\u102F\u1036\u1005\u1036 \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const currentIds = new Set((await db.collection("products").get()).docs.map((d) => d.id));
          const tombstoneIds = new Set((await db.collection("deleted_products").get()).docs.map((d) => d.id));
          let batch = db.batch(), writes = 0, restored = 0, skipped = 0;
          for (const item of backup.products) {
            if (!item || !/^[A-Za-z0-9_-]{1,120}$/.test(String(item.id || "")) || !String(item.name || "").trim() || !Number.isFinite(Number(item.price)) || Number(item.price) < 0) {
              skipped++;
              continue;
            }
            const id = String(item.id);
            if (currentIds.has(id) || tombstoneIds.has(id) || item.deleting === true || item.deleted === true) {
              skipped++;
              continue;
            }
            const { costPrice, ...publicProduct } = item;
            batch.create(db.collection("products").doc(id), { ...publicProduct, id, restoredFromBackupAt: Date.now(), restoredBy: adminEmail });
            if (backup.costs && Number.isFinite(Number(backup.costs[id]))) batch.set(db.collection("product_costs").doc(id), { productId: id, costPrice: Math.max(0, Math.floor(Number(backup.costs[id]))), updatedAt: Date.now(), updatedBy: adminEmail });
            writes += backup.costs && Number.isFinite(Number(backup.costs[id])) ? 2 : 1;
            restored++;
            if (writes >= 400) {
              await batch.commit();
              batch = db.batch();
              writes = 0;
            }
          }
          if (writes) await batch.commit();
          await db.collection("product_delete_audit").doc(`backup_restore_${Date.now()}`).set({ eventType: "product_backup_restore", restored, skipped, restoredBy: adminEmail, createdAt: Date.now() });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, restored, skipped }) };
        }
        if (action === "admin_retry_product_deletes") {
          const pendingSnap = await db.collection("products").where("deleteRetryRequired", "==", true).limit(25).get();
          let completed = 0, failed = 0;
          for (const doc of pendingSnap.docs) {
            const product = doc.data() || {};
            try {
              const imageCleanup = await deleteProductImageKitAssets(product);
              const batch = db.batch();
              batch.delete(doc.ref);
              batch.delete(db.collection("product_costs").doc(doc.id));
              batch.set(db.collection("deleted_products").doc(doc.id), { productId: doc.id, name: String(product.name || ""), deletedAt: Date.now(), deletedBy: adminEmail, imageCleanup }, { merge: true });
              batch.set(db.collection("product_delete_audit").doc(`${doc.id}_retry_${Date.now()}`), { productId: doc.id, deletedBy: adminEmail, deletedAt: Date.now(), imageCleanup, retry: true }, { merge: true });
              await batch.commit();
              completed++;
            } catch (err) {
              failed++;
              await doc.ref.set({ deleteError: String(err.message || err).slice(0, 500), deleteRetryRequired: true, deleteUpdatedAt: Date.now() }, { merge: true });
            }
          }
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, checked: pendingSnap.size, completed, failed }) };
        }
        if (action === "admin_save_coupon") {
          const code = String(body.coupon && body.coupon.code || "").trim().toUpperCase();
          const percent = Math.floor(Number(body.coupon && body.coupon.percent) || 0);
          const rawIds = body.coupon && Array.isArray(body.coupon.productIds) ? body.coupon.productIds : ["all"];
          const expiresAt = body.coupon && body.coupon.expiresAt != null ? Number(body.coupon.expiresAt) : null;
          const totalUsageRaw = Number(body.coupon?.totalUsageLimit ?? DEFAULT_PROMO_TOTAL_USAGE_LIMIT);
          const perUserUsageRaw = Number(body.coupon?.perUserUsageLimit ?? 1);
          const maxDiscountRaw = Number(body.coupon?.maxDiscount ?? 0);
          if (![totalUsageRaw, perUserUsageRaw, maxDiscountRaw].every(Number.isFinite) || totalUsageRaw < 0 || perUserUsageRaw < 1 || maxDiscountRaw < 0) throw new Error("Coupon Usage Limit / Max Discount \u1010\u1014\u103A\u1016\u102D\u102F\u1038 \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const totalUsageLimit = Math.min(1e7, Math.floor(totalUsageRaw));
          const perUserUsageLimit = Math.min(1e3, Math.floor(perUserUsageRaw));
          const maxDiscount = Math.min(1e9, Math.floor(maxDiscountRaw));
          if (expiresAt != null && (!Number.isFinite(expiresAt) || expiresAt <= Date.now())) throw new Error("Coupon Expired Date \u101E\u100A\u103A \u1021\u1014\u102C\u1002\u1010\u103A\u101B\u1000\u103A \u1016\u103C\u1005\u103A\u101B\u1015\u102B\u1019\u100A\u103A\u104B");
          const productIds = rawIds.map((id) => String(id).trim()).filter(Boolean).slice(0, 100);
          if (!/^[A-Z0-9_-]{3,40}$/.test(code) || code.startsWith("RWD") || code.startsWith("MS")) throw new Error("Coupon Code \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B RWD/MS \u1016\u103C\u1004\u1037\u103A\u1005\u101E\u1031\u102C Code \u1019\u101E\u102F\u1036\u1038\u1015\u102B\u1014\u103E\u1004\u1037\u103A\u104B");
          if (percent < 1 || percent > 90) throw new Error("Coupon Discount \u101E\u100A\u103A 1% \u1019\u103E 90% \u1021\u1010\u103D\u1004\u103A\u1038 \u1016\u103C\u1005\u103A\u101B\u1015\u102B\u1019\u100A\u103A\u104B");
          if (!productIds.length || productIds.includes("all") && productIds.length > 1) throw new Error("Coupon Product Scope \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const cfgRef = db.collection("store_config").doc("coupons");
          const promoCounter = await ensurePromoCouponCounter(db, code);
          await db.runTransaction(async (tx) => {
            const [snap, counterSnap] = await Promise.all([tx.get(cfgRef), tx.get(promoCounter.ref)]);
            const items = snap.exists && Array.isArray((snap.data() || {}).items) ? (snap.data() || {}).items.slice() : [];
            const previous = items.find((item) => String(item.code || "").toUpperCase() === code && item.isRewardCoupon !== true) || {};
            const counterUsageCount = counterSnap && counterSnap.exists ? safeFinancialCount((counterSnap.data() || {}).usageCount) : promoCounter.usageCount;
            const usageCount = Math.max(0, safeFinancialCount(previous.usageCount), counterUsageCount);
            const filtered = items.filter((item) => String(item.code || "").toUpperCase() !== code || item.isRewardCoupon === true);
            filtered.unshift({ code, percent, productIds, expiresAt, maxDiscount, totalUsageLimit, perUserUsageLimit, usageCount, isRewardCoupon: false, createdAt: previous.createdAt || Date.now(), updatedAt: Date.now(), updatedBy: adminEmail });
            tx.set(cfgRef, { items: filtered.slice(0, 500), updatedAt: Date.now() }, { merge: true });
            tx.set(promoCounter.ref, { code, active: true, updatedAt: Date.now() }, { merge: true });
          });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, code, percent, productIds, expiresAt, maxDiscount, totalUsageLimit, perUserUsageLimit, usageCount: promoCounter.usageCount }) };
        }
        if (action === "admin_delete_coupon") {
          const code = String(body.code || "").trim().toUpperCase();
          if (!code) throw new Error("Coupon Code \u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
          const cfgRef = db.collection("store_config").doc("coupons");
          const counterRef = db.collection("promo_coupon_counters").doc(code);
          await db.runTransaction(async (tx) => {
            const [snap, counterSnap] = await Promise.all([tx.get(cfgRef), tx.get(counterRef)]);
            const items = snap.exists && Array.isArray((snap.data() || {}).items) ? (snap.data() || {}).items : [];
            tx.set(cfgRef, { items: items.filter((item) => String(item.code || "").toUpperCase() !== code || item.isRewardCoupon === true), updatedAt: Date.now() }, { merge: true });
            if (counterSnap.exists) tx.set(counterRef, { active: false, updatedAt: Date.now(), deactivatedAt: Date.now() }, { merge: true });
          });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, code }) };
        }
        if (action === "admin_moderate_review") {
          const reviewId = String(body.reviewId || "").trim();
          const modAction = String(body.modAction || "").trim();
          const productId = String(body.productId || "").trim();
          if (!reviewId) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Missing reviewId." }) };
          }
          if (!["delete", "toggle_hide"].includes(modAction)) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Invalid modAction." }) };
          }
          const revRef = db.collection("reviews").doc(reviewId);
          const moderationResult = await db.runTransaction(async (tx) => {
            const revSnap = await tx.get(revRef);
            if (!revSnap.exists) return { notFound: true, targetProdId: productId || "" };
            const oldReview = revSnap.data() || {};
            const targetProdId = productId || String(oldReview.productId || "");
            const ownerUid = String(oldReview.userId || "").trim();
            const ownerRef = ownerUid ? db.collection("users").doc(ownerUid) : null;
            const canonicalClaimRef = ownerUid && oldReview.productId ? db.collection("review_reward_claims").doc(`rev_${ownerUid}_${String(oldReview.productId)}`) : null;
            const legacyClaimsQuery = ownerUid && oldReview.productId ? db.collection("review_reward_claims").where("userId", "==", ownerUid).where("productId", "==", String(oldReview.productId)) : null;
            const [ownerSnap, canonicalClaimSnap, legacyClaimsSnap] = await Promise.all([
              ownerRef ? tx.get(ownerRef) : Promise.resolve(null),
              canonicalClaimRef ? tx.get(canonicalClaimRef) : Promise.resolve(null),
              legacyClaimsQuery ? tx.get(legacyClaimsQuery) : Promise.resolve(null)
            ]);
            const shouldReverse = modAction === "delete" || Boolean(body.hidden);
            const canonicalClaim = canonicalClaimSnap && canonicalClaimSnap.exists ? canonicalClaimSnap.data() || {} : {};
            const legacyClaimDocs = legacyClaimsSnap ? legacyClaimsSnap.docs : [];
            const legacyReversal = legacyClaimDocs.map((doc) => doc.data() || {}).find((data) => data.reversedAt);
            const alreadyReversed = Boolean(oldReview.pointsReversedAt || canonicalClaim.reversedAt || legacyReversal);
            const priorReversalAt = Number(oldReview.pointsReversedAt || canonicalClaim.reversedAt || legacyReversal && legacyReversal.reversedAt || 0) || null;
            const reviewAward = oldReview.pointsRewarded === true ? Math.max(0, Number(oldReview.pointsAwarded || 0)) : 0;
            const claimAward = Math.max(0, Number(canonicalClaim.pointsAwarded || 0), ...legacyClaimDocs.map((doc) => Math.max(0, Number((doc.data() || {}).pointsAwarded || 0))));
            const pointsToReverse = Math.max(reviewAward, claimAward);
            let pointsBalanceAfter = ownerSnap && ownerSnap.exists ? Math.max(0, Number((ownerSnap.data() || {}).pointsBalance || 0)) : 0;
            let pointsDebtAfter = ownerSnap && ownerSnap.exists ? Math.max(0, Number((ownerSnap.data() || {}).pointsDebt || 0)) : 0;
            let pointsReversed = 0;
            let debtAdded = 0;
            const now = Date.now();
            if (shouldReverse && pointsToReverse > 0 && !alreadyReversed) {
              const userData = ownerSnap && ownerSnap.exists ? ownerSnap.data() || {} : {};
              const balanceBefore = Math.max(0, Number(userData.pointsBalance || 0));
              const balanceUsed = Math.min(balanceBefore, pointsToReverse);
              debtAdded = pointsToReverse - balanceUsed;
              pointsBalanceAfter = balanceBefore - balanceUsed;
              pointsDebtAfter = Math.max(0, Number(userData.pointsDebt || 0)) + debtAdded;
              pointsReversed = pointsToReverse;
              if (ownerRef && ownerSnap && ownerSnap.exists) {
                tx.set(ownerRef, { pointsBalance: pointsBalanceAfter, pointsDebt: pointsDebtAfter, updatedAt: now }, { merge: true });
              }
              const reversalId = `review_moderation_${ownerUid}_${String(oldReview.productId || "")}`;
              tx.set(db.collection("points_ledger").doc(reversalId), {
                id: reversalId,
                userId: ownerUid,
                type: "review_reward_moderation_reversal",
                pointsDelta: -balanceUsed,
                pointsReversed,
                debtAdded,
                balanceBefore,
                balanceAfter: pointsBalanceAfter,
                pointsDebtAfter,
                productId: String(oldReview.productId || ""),
                reviewId,
                reason: modAction === "delete" ? "Review deleted by Admin" : "Review hidden by Admin",
                adminUid,
                adminEmail,
                createdAt: now
              }, { merge: false });
              tx.set(db.collection("financial_audit_logs").doc(reversalId), {
                eventType: "review_points_reversed_by_moderation",
                userId: ownerUid,
                productId: String(oldReview.productId || ""),
                reviewId,
                pointsReversed,
                debtAdded,
                adminUid,
                adminEmail,
                createdAt: now
              }, { merge: true });
            }
            if (canonicalClaimRef && (pointsToReverse > 0 || canonicalClaimSnap?.exists || legacyClaimDocs.length)) {
              tx.set(canonicalClaimRef, {
                id: `rev_${ownerUid}_${String(oldReview.productId || "")}`,
                userId: ownerUid,
                productId: String(oldReview.productId || ""),
                reviewId,
                pointsAwarded: Math.max(pointsToReverse, Number(canonicalClaim.pointsAwarded || 0)),
                claimedAt: Number(canonicalClaim.claimedAt || oldReview.rewardGrantedAt || oldReview.updatedAt || oldReview.createdAt || now),
                ...shouldReverse && pointsToReverse > 0 ? {
                  reversedAt: priorReversalAt || now,
                  reversedBy: canonicalClaim.reversedBy || adminUid,
                  reversalReason: canonicalClaim.reversalReason || (modAction === "delete" ? "review_deleted" : "review_hidden"),
                  pointsReversed: Math.max(pointsToReverse, Number(canonicalClaim.pointsReversed || 0))
                } : {},
                rule: "one_reward_per_customer_per_product"
              }, { merge: true });
            }
            for (const legacyDoc of legacyClaimDocs) {
              const legacy = legacyDoc.data() || {};
              if (shouldReverse && pointsToReverse > 0 && !legacy.reversedAt && legacyDoc.id !== canonicalClaimRef?.id) {
                tx.set(legacyDoc.ref, {
                  reversedAt: priorReversalAt || now,
                  reversedBy: adminUid,
                  reversalReason: modAction === "delete" ? "review_deleted" : "review_hidden",
                  pointsReversed: Number(legacy.pointsAwarded || 0)
                }, { merge: true });
              }
            }
            if (modAction === "delete") {
              tx.delete(revRef);
            } else {
              tx.set(revRef, {
                hidden: Boolean(body.hidden),
                ...shouldReverse && pointsToReverse > 0 ? {
                  pointsRewarded: false,
                  pointsAwarded: 0,
                  pointsReversedAt: priorReversalAt || now,
                  moderationPointsReversed: true
                } : {},
                moderatedBy: adminEmail,
                moderatedAt: now,
                updatedAt: now
              }, { merge: true });
            }
            return { targetProdId, pointsReversed, debtAdded, pointsBalanceAfter, pointsDebtAfter };
          });
          if (moderationResult.targetProdId) {
            const pRef = db.collection("products").doc(String(moderationResult.targetProdId));
            if (modAction === "delete") {
              const pSnap = await pRef.get();
              if (pSnap.exists) {
                const revs = Array.isArray(pSnap.data().reviews) ? pSnap.data().reviews : [];
                const filtered = revs.filter((r) => String(r.id || r.time) !== reviewId);
                await pRef.set({ reviews: filtered, updatedAt: Date.now() }, { merge: true });
              }
            }
            await syncProductVisibleReviews(db, moderationResult.targetProdId);
          }
          if (moderationResult.notFound) {
            return { statusCode: 404, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Review not found." }) };
          }
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({
            ok: true,
            ...modAction === "delete" ? { deleted: reviewId } : { reviewId, hidden: Boolean(body.hidden) },
            pointsReversed: moderationResult.pointsReversed || 0,
            debtAdded: moderationResult.debtAdded || 0,
            pointsBalance: moderationResult.pointsBalanceAfter,
            pointsDebt: moderationResult.pointsDebtAfter
          }) };
        }
        if (action === "admin_adjust_user_points") {
          const targetUserId = String(body.targetUserId || "").trim();
          const pointsDelta = parseInt(body.pointsDelta, 10);
          const reason = String(body.reason || "").trim();
          if (!targetUserId || !Number.isFinite(pointsDelta) || pointsDelta === 0 || !reason) {
            return {
              statusCode: 400,
              headers: JSON_HEADERS,
              body: JSON.stringify({ ok: false, error: "Target User, non-zero Points amount, and Reason are required." })
            };
          }
          const userRef = db.collection("users").doc(targetUserId);
          const now = Date.now();
          const auditId = `aud_${now}_${Math.random().toString(36).slice(2, 7)}`;
          const ledgerId = `led_adj_${now}_${Math.random().toString(36).slice(2, 7)}`;
          const adjResult = await db.runTransaction(async (tx) => {
            const uSnap = await tx.get(userRef);
            if (!uSnap.exists) {
              throw new Error("Target customer account not found in Firestore.");
            }
            const uData = uSnap.data() || {};
            const prevBalance = Number(uData.pointsBalance || 0);
            const prevDebt = Math.max(0, Number(uData.pointsDebt || 0));
            const requestedDelta = pointsDelta;
            const debtPaid = requestedDelta > 0 ? Math.min(prevDebt, requestedDelta) : 0;
            const nextDebt = prevDebt - debtPaid;
            const spendableDelta = requestedDelta > 0 ? requestedDelta - debtPaid : requestedDelta;
            const nextBalance = Math.max(0, prevBalance + spendableDelta);
            const actualDelta = nextBalance - prevBalance;
            const prevTotalEarned = Number(uData.totalPointsEarned || 0);
            const nextTotalEarned = requestedDelta > 0 ? prevTotalEarned + requestedDelta : prevTotalEarned;
            tx.set(userRef, {
              pointsBalance: nextBalance,
              pointsDebt: nextDebt,
              totalPointsEarned: nextTotalEarned,
              updatedAt: now
            }, { merge: true });
            const ledgerEntry = {
              id: ledgerId,
              userId: targetUserId,
              userEmail: uData.email || "",
              userName: uData.name || "",
              type: actualDelta >= 0 ? "admin_add" : "admin_deduct",
              pointsDelta: actualDelta,
              grossPointsAdjustment: requestedDelta,
              pointsDebtPaid: debtPaid,
              pointsDebtAfter: nextDebt,
              balanceBefore: prevBalance,
              balanceAfter: nextBalance,
              reason: `Admin Adjustment: ${reason}`,
              adminUid,
              adminEmail,
              createdAt: now
            };
            tx.set(db.collection("points_ledger").doc(ledgerId), ledgerEntry);
            const auditEntry = {
              id: auditId,
              targetUserId,
              targetUserEmail: uData.email || "",
              targetUserName: uData.name || "",
              pointsDelta: actualDelta,
              pointsDebtPaid: debtPaid,
              pointsDebtAfter: nextDebt,
              balanceBefore: prevBalance,
              balanceAfter: nextBalance,
              reason,
              adminUid,
              adminEmail,
              adminRole,
              createdAt: now
            };
            tx.set(db.collection("points_audit_logs").doc(auditId), auditEntry);
            return {
              targetUserId,
              balanceBefore: prevBalance,
              pointsBalance: nextBalance,
              actualDelta,
              pointsDebtPaid: debtPaid,
              pointsDebt: nextDebt,
              auditEntry
            };
          });
          return {
            statusCode: 200,
            headers: JSON_HEADERS,
            body: JSON.stringify({ ok: true, ...adjResult })
          };
        }
        if (action === "admin_adjust_user_cashback") {
          const targetUserId = String(body.targetUserId || "").trim();
          const cashbackDelta = Number(body.cashbackDelta);
          const reason = String(body.reason || "").trim();
          if (!targetUserId || !Number.isSafeInteger(cashbackDelta) || cashbackDelta === 0 || Math.abs(cashbackDelta) > 1e9 || !reason || reason.length > 300) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Target User, valid non-zero Cashback amount, and Reason are required." }) };
          }
          const userRef = db.collection("users").doc(targetUserId);
          const now = Date.now();
          const ledgerId = `admin_cashback_${now}_${Math.random().toString(36).slice(2, 8)}`;
          const adjResult = await db.runTransaction(async (tx) => {
            const snap = await tx.get(userRef);
            if (!snap.exists) throw new Error("Target customer account not found in Firestore.");
            const u = snap.data() || {};
            const before = Math.max(0, Number(u.cashbackBalance || 0));
            const oldDebt = Math.max(0, Number(u.cashbackDebt || 0));
            let debtPaid = 0, nextBalance = before, nextDebt = oldDebt;
            if (cashbackDelta > 0) {
              debtPaid = Math.min(oldDebt, cashbackDelta);
              nextDebt = oldDebt - debtPaid;
              nextBalance = before + cashbackDelta - debtPaid;
            } else {
              const deduction = Math.abs(cashbackDelta);
              const fromBalance = Math.min(before, deduction);
              nextBalance = before - fromBalance;
              nextDebt = oldDebt + deduction - fromBalance;
            }
            const actualDelta = nextBalance - before;
            const entry = { id: ledgerId, userId: targetUserId, userEmail: u.email || "", userName: u.name || "", type: "admin_adjustment", amount: Math.abs(cashbackDelta), requestedDelta: cashbackDelta, actualDelta, debtPaid, balanceBefore: before, balanceAfter: nextBalance, debtBefore: oldDebt, debtAfter: nextDebt, reason: `Admin Adjustment: ${reason}`, adminUid, adminEmail, adminRole, createdAt: now };
            const history = Array.isArray(u.cashbackHistory) ? u.cashbackHistory.slice() : [];
            history.unshift(entry);
            tx.set(userRef, { cashbackBalance: nextBalance, cashbackDebt: nextDebt, cashbackTotalEarned: Math.max(0, Number(u.cashbackTotalEarned || 0)) + Math.max(0, cashbackDelta), cashbackHistory: history.slice(0, 100), updatedAt: now }, { merge: true });
            tx.create(db.collection("cashback_ledger").doc(ledgerId), entry);
            return { balanceBefore: before, cashbackBalance: nextBalance, actualDelta, cashbackDebtPaid: debtPaid, cashbackDebt: nextDebt, ledgerEntry: entry };
          });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, ...adjResult }) };
        }
        if (action === "admin_save_reward_settings") {
          const settings = body.settings || {};
          const rawPurchaseTiers = Array.isArray(settings.purchaseTiers) ? settings.purchaseTiers : [];
          const rawRedeemTiers = Array.isArray(settings.tiers) ? settings.tiers : [];
          if (rawRedeemTiers.some((t) => Number(t.pointsCost) < 1 || Number(t.discountPercent) < 1 || Number(t.discountPercent) > 90 || Number(t.maxDiscount || 0) > 1e6)) throw new Error("Reward Coupon Tier Points Cost / Discount / Max Discount \u1010\u1014\u103A\u1016\u102D\u102F\u1038 \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const sanitized = {
            points4Star: Math.max(0, Math.floor(Number.isFinite(Number(settings.points4Star)) ? Number(settings.points4Star) : 0)),
            points5Star: Math.max(0, Math.floor(Number.isFinite(Number(settings.points5Star)) ? Number(settings.points5Star) : 0)),
            photoBonusPoints: Math.max(0, Math.floor(Number.isFinite(Number(settings.photoBonusPoints)) ? Number(settings.photoBonusPoints) : 0)),
            couponValidityDays: Math.min(3650, Math.max(0, Math.floor(Number(settings.couponValidityDays || 0)))),
            rewardCouponsEnabled: settings.rewardCouponsEnabled !== false,
            rewardCouponTiersEnabled: settings.rewardCouponTiersEnabled !== false,
            lifetimeCashbackTiersEnabled: settings.lifetimeCashbackTiersEnabled !== false,
            monthlyCashbackTiersEnabled: settings.monthlyCashbackTiersEnabled !== false,
            minPayableAmount: Math.min(1e9, Math.max(1, Math.floor(Number(settings.minPayableAmount ?? 1e3)))),
            checkoutPointsEnabled: settings.checkoutPointsEnabled === true,
            pointsPer1000Ks: Math.min(1e6, Math.max(1, Math.floor(Number(settings.pointsPer1000Ks || 100)))),
            reverseReviewPointsOnRefund: settings.reverseReviewPointsOnRefund !== false,
            keepReviewAfterRefund: settings.keepReviewAfterRefund !== false,
            ...normalizeFinancialSafety(settings),
            tiers: Array.isArray(settings.tiers) ? settings.tiers.slice(0, 50).map((t, idx) => ({
              id: String(t.id || `tier_${idx + 1}`).slice(0, 80),
              pointsCost: Math.max(1, Math.floor(Number(t.pointsCost) || 100)),
              discountPercent: Math.min(90, Math.max(1, Math.floor(Number(t.discountPercent) || 5))),
              productIds: (Array.isArray(t.productIds) && t.productIds.length ? t.productIds.map((id) => String(id).trim()).filter(Boolean).slice(0, 100) : ["all"]).includes("all") ? ["all"] : Array.isArray(t.productIds) ? t.productIds.map((id) => String(id).trim()).filter((id) => id && id !== "all").slice(0, 100) : ["all"],
              minPurchase: Math.min(1e12, Math.max(0, Math.floor(Number(t.minPurchase) || 0))),
              maxDiscount: Math.min(1e9, Math.max(0, Math.floor(Number(t.maxDiscount) || 0))),
              validityDays: Math.min(3650, Math.max(0, Math.floor(Number(t.validityDays ?? settings.couponValidityDays ?? 0)))),
              label: String(t.label || `${t.discountPercent}% OFF (${t.pointsCost} Pts)`).trim().slice(0, 100)
            })) : [],
            purchaseTiers: Array.isArray(settings.purchaseTiers) ? settings.purchaseTiers.slice(0, 50).map((t, idx) => ({
              id: String(t.id || `purchase_tier_${idx + 1}`).slice(0, 80),
              threshold: Math.min(1e12, Math.max(1, Math.floor(Number(t.threshold) || 1))),
              rewardType: "cashback",
              rewardValue: Math.min(1e9, Math.max(0, Math.floor(Number(t.rewardValue) || 0))),
              label: String(t.label || "").slice(0, 100)
            })).sort((a, b) => a.threshold - b.threshold) : [],
            monthlyPurchaseTiers: Array.isArray(settings.monthlyPurchaseTiers) ? settings.monthlyPurchaseTiers.slice(0, 50).map((t, idx) => ({
              id: String(t.id || `monthly_purchase_tier_${idx + 1}`).slice(0, 80),
              threshold: Math.min(1e12, Math.max(1, Math.floor(Number(t.threshold) || 1))),
              rewardType: "cashback",
              rewardValue: Math.min(1e9, Math.max(0, Math.floor(Number(t.rewardValue) || 0))),
              label: String(t.label || "").slice(0, 100)
            })).sort((a, b) => a.threshold - b.threshold) : DEFAULT_REWARD_SETTINGS.monthlyPurchaseTiers,
            adminConfigVersion: 2,
            updatedBy: adminEmail,
            updatedAt: Date.now()
          };
          Object.assign(sanitized, validateRewardCaps({ ...sanitized, ...settings }));
          if (sanitized.tiers.some((t) => t.discountPercent < 1 || t.discountPercent > 90 || t.pointsCost < 1 || t.maxDiscount > 1e6)) throw new Error("Reward Coupon Tier \u1010\u1014\u103A\u1016\u102D\u102F\u1038\u1019\u103B\u102C\u1038 \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const tierIds = sanitized.tiers.map((t) => t.id);
          const purchaseTierIds = sanitized.purchaseTiers.map((t) => t.id);
          const monthlyPurchaseTierIds = sanitized.monthlyPurchaseTiers.map((t) => t.id);
          if (new Set(tierIds).size !== tierIds.length || new Set(purchaseTierIds).size !== purchaseTierIds.length || new Set(monthlyPurchaseTierIds).size !== monthlyPurchaseTierIds.length) {
            throw new Error("Reward tier ID \u1019\u103B\u102C\u1038 \u1011\u1015\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104B");
          }
          if (sanitized.purchaseTiers.some((t, i, a) => i > 0 && t.threshold === a[i - 1].threshold) || sanitized.monthlyPurchaseTiers.some((t, i, a) => i > 0 && t.threshold === a[i - 1].threshold)) {
            throw new Error("Purchase reward threshold \u1010\u1014\u103A\u1016\u102D\u102F\u1038\u1019\u103B\u102C\u1038 \u1019\u1010\u1030\u100A\u102E\u101B\u1015\u102B\u104B");
          }
          const rewardSettingsRef = db.collection("store_config").doc("reward_settings");
          const previousSettingsSnap = await rewardSettingsRef.get();
          const previousSettings = previousSettingsSnap.exists ? previousSettingsSnap.data() || {} : {};
          const tierSignature = /* @__PURE__ */ __name((rows) => JSON.stringify((Array.isArray(rows) ? rows : []).map((t) => ({
            id: String(t.id || ""),
            threshold: Number(t.threshold || 0),
            rewardType: String(t.rewardType || "cashback"),
            rewardValue: Number(t.rewardValue || 0)
          })).sort((a, b) => a.threshold - b.threshold || a.id.localeCompare(b.id))), "tierSignature");
          const now = Date.now();
          const lifetimeTiersChanged = tierSignature(previousSettings.purchaseTiers) !== tierSignature(sanitized.purchaseTiers);
          const monthlyTiersChanged = tierSignature(previousSettings.monthlyPurchaseTiers) !== tierSignature(sanitized.monthlyPurchaseTiers);
          const lifetimeReenabled = previousSettings.lifetimeCashbackTiersEnabled === false && sanitized.lifetimeCashbackTiersEnabled === true;
          const monthlyReenabled = previousSettings.monthlyCashbackTiersEnabled === false && sanitized.monthlyCashbackTiersEnabled === true;
          sanitized.purchaseTiersVersion = Math.max(1, Number(previousSettings.purchaseTiersVersion || 0) + (lifetimeTiersChanged ? 1 : 0));
          sanitized.monthlyPurchaseTiersVersion = Math.max(1, Number(previousSettings.monthlyPurchaseTiersVersion || 0) + (monthlyTiersChanged ? 1 : 0));
          sanitized.purchaseTiersActivatedAt = lifetimeTiersChanged || lifetimeReenabled ? now : Math.max(0, Number(previousSettings.purchaseTiersActivatedAt || 0));
          sanitized.monthlyPurchaseTiersActivatedAt = monthlyTiersChanged || monthlyReenabled ? now : Math.max(0, Number(previousSettings.monthlyPurchaseTiersActivatedAt || 0));
          sanitized.monthlyPurchaseTiersActivationMonthKey = monthlyTiersChanged || monthlyReenabled ? myanmarMonthKey(now) : String(previousSettings.monthlyPurchaseTiersActivationMonthKey || "");
          await rewardSettingsRef.set(sanitized, { merge: true });
          return {
            statusCode: 200,
            headers: JSON_HEADERS,
            body: JSON.stringify({ ok: true, settings: sanitized })
          };
        }
        if (action === "admin_get_product_costs") {
          const productsSnap = await db.collection("products").get();
          let batch = db.batch(), writes = 0;
          for (const doc of productsSnap.docs) {
            const data = doc.data() || {};
            if (data.costPrice !== void 0 && Number.isFinite(Number(data.costPrice))) {
              batch.set(db.collection("product_costs").doc(doc.id), { productId: doc.id, costPrice: Math.max(0, Math.floor(Number(data.costPrice))), updatedAt: Date.now(), migratedFromPublicProduct: true }, { merge: true });
              batch.update(doc.ref, { costPrice: admin.firestore.FieldValue.delete(), updatedAt: Date.now() });
              writes += 2;
              if (writes >= 450) {
                await batch.commit();
                batch = db.batch();
                writes = 0;
              }
            }
          }
          if (writes > 0) await batch.commit();
          const costsSnap = await db.collection("product_costs").get();
          const costs = {};
          costsSnap.forEach((doc) => {
            costs[doc.id] = Math.max(0, Number((doc.data() || {}).costPrice || 0));
          });
          const ordersSnap = await db.collection("orders").get();
          batch = db.batch();
          writes = 0;
          for (const doc of ordersSnap.docs) {
            const d = doc.data() || {};
            if (!Array.isArray(d.items)) continue;
            let changed = false;
            const clean = d.items.map((item) => {
              if (Object.prototype.hasOwnProperty.call(item || {}, "costPrice")) {
                changed = true;
                const { costPrice, ...rest } = item;
                return rest;
              }
              return item;
            });
            if (changed) {
              batch.update(doc.ref, { items: clean });
              writes++;
              if (writes >= 450) {
                await batch.commit();
                batch = db.batch();
                writes = 0;
              }
            }
          }
          if (writes > 0) await batch.commit();
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, costs, migrated: true }) };
        }
        if (action === "save_product") {
          const product = body.product;
          if (!product || !product.id) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Missing product data or product.id." }) };
          }
          const docId = String(product.id);
          const { costPrice, ...publicProduct } = product;
          if (!/^[A-Za-z0-9_-]{1,120}$/.test(docId)) throw new Error("Product ID \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const productRef = db.collection("products").doc(docId);
          const [tombstone, existing] = await Promise.all([
            db.collection("deleted_products").doc(docId).get(),
            productRef.get()
          ]);
          if (tombstone.exists) throw new Error("\u1016\u103B\u1000\u103A\u1015\u103C\u102E\u1038\u101E\u102C\u1038 Product ID \u1000\u102D\u102F \u1015\u103C\u1014\u103A\u1021\u101E\u102F\u1036\u1038\u1019\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u104B Product \u1021\u101E\u1005\u103A\u1016\u1014\u103A\u1010\u102E\u1038\u1015\u102B\u104B");
          if (existing.exists && (existing.data() || {}).deleting === true) throw new Error("\u1024 Product \u1000\u102D\u102F \u1016\u103B\u1000\u103A\u1014\u1031\u1006\u1032\u1016\u103C\u1005\u103A\u101E\u1031\u102C\u1000\u103C\u1031\u102C\u1004\u1037\u103A \u1015\u103C\u1004\u103A\u1006\u1004\u103A\u104D\u1019\u101B\u1015\u102B\u104B");
          const cleanName = String(publicProduct.name || "").trim();
          if (!cleanName || cleanName.length > 180) throw new Error("Product \u1021\u1019\u100A\u103A \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const price = Number(publicProduct.price);
          if (!Number.isFinite(price) || price < 0 || price > 1e9) throw new Error("Product \u1008\u1031\u1038\u1014\u103E\u102F\u1014\u103A\u1038 \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          if (publicProduct.stock !== void 0 && (!Number.isFinite(Number(publicProduct.stock)) || Number(publicProduct.stock) < 0)) throw new Error("Product Stock \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const assets = Array.isArray(publicProduct.imageKitAssets) ? publicProduct.imageKitAssets : [];
          for (const asset of assets) {
            if (!asset || !isTrustedImageKitUrl(String(asset.url || "")) || asset.fileId != null && String(asset.fileId).length > 200) throw new Error("Product \u1015\u102F\u1036 URL / ImageKit File ID \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          }
          const batch = db.batch();
          batch.set(productRef, { ...publicProduct, name: cleanName, id: docId, updatedAt: Date.now(), deleting: false }, { merge: true });
          if (costPrice !== void 0 && Number.isFinite(Number(costPrice))) batch.set(db.collection("product_costs").doc(docId), { productId: docId, costPrice: Math.max(0, Math.floor(Number(costPrice))), updatedAt: Date.now(), updatedBy: adminEmail }, { merge: true });
          await batch.commit();
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId }) };
        }
        if (action === "delete_product") {
          const docId = String(body.id || "");
          if (!docId) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Missing product id." }) };
          }
          if (!/^[A-Za-z0-9_-]{1,120}$/.test(docId)) throw new Error("Product ID \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B");
          const productRef = db.collection("products").doc(docId);
          const productSnap = await productRef.get();
          if (!productSnap.exists) return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId, alreadyMissing: true }) };
          const productData = productSnap.data() || {};
          await productRef.set({ deleting: true, deleteRequestedAt: Date.now(), deleteRequestedBy: adminEmail }, { merge: true });
          try {
            const imageCleanup = await deleteProductImageKitAssets(productData);
            const batch = db.batch();
            batch.delete(productRef);
            batch.delete(db.collection("product_costs").doc(docId));
            batch.set(db.collection("deleted_products").doc(docId), { productId: docId, name: String(productData.name || ""), deletedAt: Date.now(), deletedBy: adminEmail, imageCleanup }, { merge: true });
            batch.set(db.collection("product_delete_audit").doc(`${docId}_${Date.now()}`), { productId: docId, deletedBy: adminEmail, deletedAt: Date.now(), imageCleanup }, { merge: true });
            await batch.commit();
            return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId, imageCleanup }) };
          } catch (cleanupError) {
            await productRef.set({ deleting: true, deleteError: String(cleanupError.message || cleanupError).slice(0, 500), deleteRetryRequired: true, deleteUpdatedAt: Date.now() }, { merge: true });
            throw new Error(`Product \u1000\u102D\u102F Order \u1010\u1004\u103A\u104D\u1019\u101B\u1021\u1031\u102C\u1004\u103A \u1015\u102D\u1010\u103A\u1011\u102C\u1038\u1015\u103C\u102E\u1038\u1015\u102B\u1015\u103C\u102E\u104B ImageKit/Database cleanup \u1019\u1015\u103C\u102E\u1038\u101E\u1031\u1038\u1015\u102B\u104B \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1005\u1019\u103A\u1038\u101E\u1015\u103A\u101B\u1014\u103A\u101C\u102D\u102F\u101E\u100A\u103A\u104B ${cleanupError.message || cleanupError}`);
          }
        }
        if (action === "sync_local_products") {
          const items = Array.isArray(body.products) ? body.products : [];
          let batch = db.batch(), count3 = 0, writes = 0;
          for (const p of items) {
            if (p && p.id) {
              const docId = String(p.id);
              if (!/^[A-Za-z0-9_-]{1,120}$/.test(docId)) continue;
              const [deletedSnap, existingSnap] = await Promise.all([
                db.collection("deleted_products").doc(docId).get(),
                db.collection("products").doc(docId).get()
              ]);
              if (deletedSnap.exists || existingSnap.exists || p.deleting === true || p.deleted === true) continue;
              const { costPrice, ...publicProduct } = p;
              if (!String(publicProduct.name || "").trim() || !Number.isFinite(Number(publicProduct.price)) || Number(publicProduct.price) < 0) continue;
              batch.create(db.collection("products").doc(docId), { ...publicProduct, id: docId, createdAt: Date.now(), updatedAt: Date.now(), migratedFromLocal: true });
              writes++;
              if (costPrice !== void 0 && Number.isFinite(Number(costPrice))) {
                batch.set(db.collection("product_costs").doc(docId), { productId: docId, costPrice: Math.max(0, Math.floor(Number(costPrice))), updatedAt: Date.now(), updatedBy: adminEmail }, { merge: true });
                writes++;
              }
              count3++;
              if (writes >= 450) {
                await batch.commit();
                batch = db.batch();
                writes = 0;
              }
            }
          }
          if (writes > 0) await batch.commit();
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, syncedCount: count3 }) };
        }
        if (action === "save_order") {
          const order = body.order;
          if (!order || !order.id) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Missing order data." }) };
          }
          const docId = String(order.id);
          const orderRef = db.collection("orders").doc(docId);
          const nextOrder = { ...order, id: docId, updatedAt: Date.now() };
          let purchaseReward = null;
          let orderWasCompleted = false;
          let completedOrderForRewards = nextOrder;
          await db.runTransaction(async (tx) => {
            const oldSnap = await tx.get(orderRef);
            const oldOrder = oldSnap.exists ? oldSnap.data() || {} : {};
            const oldStatus = String(oldOrder.status || "").toLowerCase();
            if (oldStatus === "refunded" && String(nextOrder.status || "").toLowerCase() !== "refunded") {
              throw new Error("Refund \u1015\u103C\u102F\u101C\u102F\u1015\u103A\u1015\u103C\u102E\u1038\u101E\u1031\u102C order \u1000\u102D\u102F \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1021\u101E\u1000\u103A\u101E\u103D\u1004\u103A\u1038\u104D\u1019\u101B\u1015\u102B\u104B");
            }
            if (oldStatus === "cancelled" && String(nextOrder.status || "").toLowerCase() !== "cancelled") {
              throw new Error("Cancel \u1015\u103C\u102F\u101C\u102F\u1015\u103A\u1015\u103C\u102E\u1038\u101E\u1031\u102C Order \u1000\u102D\u102F \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1021\u101E\u1000\u103A\u101E\u103D\u1004\u103A\u1038\u104D\u1019\u101B\u1015\u102B\u104B Order \u1021\u101E\u1005\u103A\u1010\u1004\u103A\u101B\u1014\u103A\u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
            }
            const wasCompleted = oldStatus === "completed";
            if (["pending", "processing", "shipped", "failed"].includes(oldStatus) && ["cancelled", "canceled"].includes(String(nextOrder.status || "").toLowerCase())) {
              throw new Error("Pending Order \u1000\u102D\u102F Cancel \u101C\u102F\u1015\u103A\u101B\u1014\u103A Admin Order List \u101B\u103E\u102D Cancel/Delete action \u1000\u102D\u102F \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1015\u102B\u104B Stock, Coupon, Points \u1014\u103E\u1004\u1037\u103A Cashback \u1000\u102D\u102F \u1021\u101C\u102D\u102F\u1021\u101C\u103B\u1031\u102C\u1000\u103A \u1015\u103C\u1014\u103A\u1021\u1019\u103A\u1038\u1015\u1031\u1038\u1015\u102B\u1019\u100A\u103A\u104B");
            }
            orderWasCompleted = wasCompleted;
            const isCompleted = String(nextOrder.status || "").toLowerCase() === "completed";
            if (wasCompleted && !isCompleted) {
              throw new Error("Completed order \u1000\u102D\u102F \u1015\u103C\u1014\u103A\u101C\u100A\u103A Pending/Cancelled \u1015\u103C\u1031\u102C\u1004\u103A\u1038\u104D\u1019\u101B\u1015\u102B\u104B Refund \u101C\u102F\u1015\u103A\u1004\u1014\u103A\u1038\u1005\u1009\u103A\u1000\u102D\u102F \u101E\u102E\u1038\u1001\u103C\u102C\u1038\u1006\u1031\u102C\u1004\u103A\u101B\u103D\u1000\u103A\u1015\u102B\u104B");
            }
            if (wasCompleted && (Number(nextOrder.totalAmount) !== Number(oldOrder.totalAmount) || String(nextOrder.userId || oldOrder.userId || "") !== String(oldOrder.userId || ""))) {
              throw new Error("Completed order \u104F Customer \u1014\u103E\u1004\u1037\u103A Amount \u1000\u102D\u102F \u1015\u103C\u1004\u103A\u1006\u1004\u103A\u104D\u1019\u101B\u1015\u102B\u104B");
            }
            const completionTimestamp = isCompleted ? Number(oldOrder.completedAt || nextOrder.completedAt || Date.now()) : Number(nextOrder.completedAt || 0);
            completedOrderForRewards = oldSnap.exists && isCompleted ? { ...nextOrder, userId: oldOrder.userId, totalAmount: oldOrder.totalAmount, subtotal: oldOrder.subtotal, items: oldOrder.items, couponCode: oldOrder.couponCode || null, discountAmount: oldOrder.discountAmount || 0, completedAt: completionTimestamp } : isCompleted ? { ...nextOrder, completedAt: completionTimestamp } : nextOrder;
            const userId = String(oldSnap.exists ? oldOrder.userId || "" : nextOrder.userId || "").trim();
            let userRef = null, userSnap = null, cfgSnap = null, rewardMarkerSnap = null;
            const rewardMarkerRef = userId ? db.collection("purchase_order_rewards").doc(`${userId}_${docId}`) : null;
            if (isCompleted && userId && !userId.startsWith("guest_")) {
              userRef = db.collection("users").doc(userId);
              [userSnap, cfgSnap, rewardMarkerSnap] = await Promise.all([
                tx.get(userRef),
                tx.get(db.collection("store_config").doc("reward_settings")),
                tx.get(rewardMarkerRef)
              ]);
            }
            let priorCustomerOrdersSnap = null;
            if (!wasCompleted && isCompleted && userRef && userSnap && !(rewardMarkerSnap && rewardMarkerSnap.exists)) {
              priorCustomerOrdersSnap = await tx.get(db.collection("orders").where("userId", "==", userId));
            }
            if (!wasCompleted && isCompleted && userRef && userSnap && !(rewardMarkerSnap && rewardMarkerSnap.exists)) {
              const u = userSnap.exists ? userSnap.data() || {} : {
                uid: userId,
                email: nextOrder.customerEmail || "",
                name: nextOrder.customerName || "Customer"
              };
              const cfgRaw = cfgSnap && cfgSnap.exists ? cfgSnap.data() || {} : {};
              const cfg = cfgSnap && cfgSnap.exists ? getRewardSettings(cfgRaw) : DEFAULT_REWARD_SETTINGS;
              const tiers = cfg.lifetimeCashbackTiersEnabled === false ? [] : Array.isArray(cfg.purchaseTiers) ? cfg.purchaseTiers : [];
              const monthlyTiers = cfg.monthlyCashbackTiersEnabled === false ? [] : Array.isArray(cfg.monthlyPurchaseTiers) ? cfg.monthlyPurchaseTiers : [];
              const lifetimeTierVersion = Math.max(1, Number(cfgRaw.purchaseTiersVersion || 1));
              const monthlyTierVersion = Math.max(1, Number(cfgRaw.monthlyPurchaseTiersVersion || 1));
              const lifetimeActivatedAt = Math.max(0, Number(cfgRaw.purchaseTiersActivatedAt || 0));
              const monthlyActivatedAt = Math.max(0, Number(cfgRaw.monthlyPurchaseTiersActivatedAt || 0));
              const monthlyActivationMonthKey = String(cfgRaw.monthlyPurchaseTiersActivationMonthKey || "");
              const spend = Math.max(0, Number(completedOrderForRewards.totalAmount || 0) - Math.max(0, Number(completedOrderForRewards.refundedAmount || completedOrderForRewards.partialRefundAmount || 0)));
              const completedAtForRewards = Number(completedOrderForRewards.completedAt || Date.now());
              const currentMonthKey = myanmarMonthKey(completedAtForRewards);
              const isLifetimeTierOrder = /* @__PURE__ */ __name((order2) => !lifetimeActivatedAt || (order2 === completedOrderForRewards ? completedAtForRewards : Number(order2.completedAt || order2.createdAt || 0)) >= lifetimeActivatedAt, "isLifetimeTierOrder");
              const isMonthlyTierOrder = /* @__PURE__ */ __name((order2) => !monthlyActivatedAt || monthlyActivationMonthKey !== currentMonthKey || (order2 === completedOrderForRewards ? completedAtForRewards : Number(order2.completedAt || order2.createdAt || 0)) >= monthlyActivatedAt, "isMonthlyTierOrder");
              const priorOrders = priorCustomerOrdersSnap ? priorCustomerOrdersSnap.docs : [];
              const eligiblePriorOrders = priorOrders.filter((orderDoc) => {
                if (orderDoc.id === docId) return false;
                const order2 = orderDoc.data() || {};
                const status = String(order2.status || "").toLowerCase();
                return status === "completed" && !order2.refundedAt && order2.refunded !== true;
              });
              const priorLifetimeSpend = eligiblePriorOrders.reduce((sum, orderDoc) => {
                const order2 = orderDoc.data() || {};
                const amount = Math.max(0, Number(order2.totalAmount || 0) - Math.max(0, Number(order2.refundedAmount || order2.partialRefundAmount || 0)));
                return sum + amount;
              }, 0);
              const totalSpend = priorLifetimeSpend + spend;
              const lifetimeTierSpend = eligiblePriorOrders.reduce((sum, orderDoc) => {
                const order2 = orderDoc.data() || {};
                if (!isLifetimeTierOrder(order2)) return sum;
                return sum + Math.max(0, Number(order2.totalAmount || 0) - Math.max(0, Number(order2.refundedAmount || order2.partialRefundAmount || 0)));
              }, 0) + (isLifetimeTierOrder(completedOrderForRewards) ? spend : 0);
              const lifetimeClaimKey = /* @__PURE__ */ __name((tierId) => lifetimeTierVersion > 1 ? `${lifetimeTierVersion}:${tierId}` : String(tierId), "lifetimeClaimKey");
              const monthlyClaimKey = /* @__PURE__ */ __name((monthKey, tierId) => monthlyTierVersion > 1 ? `${monthKey}:${monthlyTierVersion}:${tierId}` : `${monthKey}:${tierId}`, "monthlyClaimKey");
              const earnedIds = Array.isArray(u.purchaseRewardTierIds) ? u.purchaseRewardTierIds.map(String) : [];
              const newlyEarned = tiers.filter((t) => Number(t.threshold || 0) > 0 && lifetimeTierSpend >= Number(t.threshold) && !earnedIds.includes(lifetimeClaimKey(String(t.id))));
              const monthlyTotalSpend = eligiblePriorOrders.reduce((sum, orderDoc) => {
                const order2 = orderDoc.data() || {};
                const stamp = Number(order2.completedAt || order2.createdAt || 0);
                if (!stamp || myanmarMonthKey(stamp) !== currentMonthKey) return sum;
                return sum + Math.max(0, Number(order2.totalAmount || 0) - Math.max(0, Number(order2.refundedAmount || order2.partialRefundAmount || 0)));
              }, 0) + spend;
              const monthlyTierSpend = eligiblePriorOrders.reduce((sum, orderDoc) => {
                const order2 = orderDoc.data() || {};
                const stamp = Number(order2.completedAt || order2.createdAt || 0);
                if (!stamp || myanmarMonthKey(stamp) !== currentMonthKey || !isMonthlyTierOrder(order2)) return sum;
                return sum + Math.max(0, Number(order2.totalAmount || 0) - Math.max(0, Number(order2.refundedAmount || order2.partialRefundAmount || 0)));
              }, 0) + (isMonthlyTierOrder(completedOrderForRewards) ? spend : 0);
              const existingMonthlyEarnedKeys = Array.isArray(u.monthlyPurchaseRewardTierKeys) ? u.monthlyPurchaseRewardTierKeys.map(String) : [];
              const newlyMonthlyEarned = monthlyTiers.filter((t) => Number(t.threshold || 0) > 0 && monthlyTierSpend >= Number(t.threshold) && !existingMonthlyEarnedKeys.includes(monthlyClaimKey(currentMonthKey, String(t.id))));
              const cashbackTiersForOrder = [...newlyEarned.filter((t) => t.rewardType === "cashback"), ...newlyMonthlyEarned];
              const cashbackClaimRefs = cashbackTiersForOrder.map((tier) => {
                const safeTierId = String(tier.id).replace(/[^A-Za-z0-9_-]/g, "_");
                const programType = newlyMonthlyEarned.includes(tier) ? "monthly" : "lifetime";
                const tierVersion = programType === "monthly" ? monthlyTierVersion : lifetimeTierVersion;
                const claimId = programType === "monthly" ? `${userId}_monthly_${currentMonthKey}_${safeTierId}${tierVersion > 1 ? `_v${tierVersion}` : ""}` : `${userId}_lifetime_${safeTierId}${tierVersion > 1 ? `_v${tierVersion}` : ""}`;
                return { tier, programType, tierVersion, claimRef: db.collection("cashback_reward_claims").doc(claimId) };
              });
              const cashbackClaimSnaps = await Promise.all(cashbackClaimRefs.map((item) => tx.get(item.claimRef)));
              const claimedCashbackKeys = new Set(cashbackClaimRefs.filter((item, index) => cashbackClaimSnaps[index].exists).map((item) => `${item.programType}:${String(item.tier.id)}`));
              const cashbackCapExceeded = false;
              const cashbackSafeNewlyEarned = newlyEarned.filter((t) => t.rewardType !== "cashback" || !claimedCashbackKeys.has(`lifetime:${String(t.id)}`));
              const cashbackSafeMonthlyEarned = newlyMonthlyEarned.filter((t) => !claimedCashbackKeys.has(`monthly:${String(t.id)}`));
              let cashbackBalance = Math.max(0, Number(u.cashbackBalance || 0));
              let cashbackDebt = Math.max(0, Number(u.cashbackDebt || 0));
              let cashbackTotalEarned = Math.max(0, Number(u.cashbackTotalEarned || 0));
              const cashbackHistory = Array.isArray(u.cashbackHistory) ? u.cashbackHistory.slice() : [];
              const rewardHistory = Array.isArray(u.purchaseRewardHistory) ? u.purchaseRewardHistory.slice() : [];
              const issuedCoupons = [];
              const issuedCouponsByTier = {};
              const earnedRewards = [];
              let cashbackCredited = 0;
              const creditCashbackTier = /* @__PURE__ */ __name((t, programType, monthKey = null) => {
                const value = Math.max(0, Number(t.rewardValue || 0));
                const debtPaid = Math.min(cashbackDebt, value);
                cashbackDebt -= debtPaid;
                cashbackBalance += value - debtPaid;
                cashbackCredited += value;
                cashbackTotalEarned += value;
                const tierId = String(t.id);
                const ledgerPrefix = programType === "monthly" ? "earn_monthly" : "earn";
                const rewardKey = programType === "monthly" ? `monthly:${monthKey}:${tierId}` : `lifetime:${tierId}`;
                const tierVersion = programType === "monthly" ? monthlyTierVersion : lifetimeTierVersion;
                const historyEntry = { id: tierId, programType, monthKey, tierVersion, threshold: Number(t.threshold), rewardType: "cashback", rewardValue: value, orderId: docId, earnedAt: Date.now(), status: "credited", cashbackDebtPaid: debtPaid };
                cashbackHistory.unshift({ id: `${ledgerPrefix}_${docId}_${tierId}`, type: "earned", amount: value, creditedAmount: value - debtPaid, debtPaid, orderId: docId, programType, monthKey, createdAt: Date.now(), balanceAfter: cashbackBalance });
                const safeTierId = tierId.replace(/[^A-Za-z0-9_-]/g, "_");
                tx.set(db.collection("cashback_ledger").doc(`${ledgerPrefix}_${userId}_${docId}_${safeTierId}`), { userId, orderId: docId, tierId, tierVersion, programType, monthKey, type: "earned", amount: value, creditedAmount: value - debtPaid, debtPaid, balanceAfter: cashbackBalance, createdAt: Date.now() });
                const claimId = programType === "monthly" ? `${userId}_monthly_${monthKey}_${safeTierId}${tierVersion > 1 ? `_v${tierVersion}` : ""}` : `${userId}_lifetime_${safeTierId}${tierVersion > 1 ? `_v${tierVersion}` : ""}`;
                tx.create(db.collection("cashback_reward_claims").doc(claimId), {
                  id: claimId,
                  userId,
                  tierId,
                  tierVersion,
                  programType,
                  monthKey,
                  orderId: docId,
                  threshold: Number(t.threshold),
                  rewardValue: value,
                  createdAt: Date.now(),
                  source: "order_completion"
                });
                rewardHistory.unshift(historyEntry);
                earnedRewards.push({ id: tierId, programType, monthKey, threshold: Number(t.threshold), rewardType: "cashback", rewardValue: value, couponCode: null, rewardKey });
              }, "creditCashbackTier");
              cashbackSafeNewlyEarned.forEach((t) => creditCashbackTier(t, "lifetime"));
              cashbackSafeMonthlyEarned.forEach((t) => creditCashbackTier(t, "monthly", currentMonthKey));
              const lifetimeEarnedIds = cashbackSafeNewlyEarned.map((t) => lifetimeClaimKey(String(t.id)));
              const newlyMonthlyEarnedKeys = cashbackSafeMonthlyEarned.map((t) => monthlyClaimKey(currentMonthKey, String(t.id)));
              tx.create(rewardMarkerRef, {
                userId,
                orderId: docId,
                totalAmount: spend,
                monthKey: currentMonthKey,
                monthlyTotalSpent: monthlyTotalSpend,
                earnedTierIds: lifetimeEarnedIds,
                monthlyEarnedTierKeys: newlyMonthlyEarnedKeys,
                cashbackCredited,
                issuedCoupons,
                earnedRewards,
                creditedAt: Date.now()
              });
              tx.create(db.collection("financial_audit_logs").doc(`purchase_reward_${cryptoCompat.createHash("sha256").update(`${userId}:${docId}`).digest("hex")}`), {
                eventType: "purchase_reward_issued",
                userId,
                orderId: docId,
                totalAmount: spend,
                cashbackCredited,
                issuedCoupons,
                lifetimeTierIds: cashbackSafeNewlyEarned.map((t) => String(t.id)),
                blockedCashbackTierIds: cashbackCapExceeded ? cashbackTiersForOrder.map((t) => String(t.id)) : [],
                monthlyTierKeys: cashbackSafeMonthlyEarned.map((t) => `${currentMonthKey}:${String(t.id)}`),
                createdAt: Date.now()
              });
              tx.set(userRef, {
                purchaseTotalSpent: totalSpend,
                purchaseOrderCount: Number(u.purchaseOrderCount || 0) + 1,
                monthlyPurchaseMonthKey: currentMonthKey,
                monthlyPurchaseTotalSpent: monthlyTotalSpend,
                cashbackBalance,
                cashbackDebt,
                cashbackTotalEarned,
                cashbackHistory: cashbackHistory.slice(0, 100),
                purchaseRewardTierIds: [...earnedIds, ...lifetimeEarnedIds],
                monthlyPurchaseRewardTierKeys: [.../* @__PURE__ */ new Set([...Array.isArray(u.monthlyPurchaseRewardTierKeys) ? u.monthlyPurchaseRewardTierKeys : [], ...newlyMonthlyEarnedKeys])],
                purchaseRewardHistory: rewardHistory.slice(0, 100),
                updatedAt: Date.now()
              }, { merge: true });
              purchaseReward = { totalSpent: totalSpend, lifetimeTierSpend, monthlyTotalSpent: monthlyTotalSpend, monthlyTierSpend, newlyEarned: cashbackSafeNewlyEarned, newlyMonthlyEarned: cashbackSafeMonthlyEarned, blockedCashbackTierIds: cashbackCapExceeded ? cashbackTiersForOrder.map((t) => String(t.id)) : [], issuedCoupons };
              cashbackSafeNewlyEarned.forEach((t) => {
                const lid = `purchase_${userId}_${String(t.id).replace(/[^a-zA-Z0-9_-]/g, "_")}_${docId}`;
                tx.set(db.collection("purchase_reward_ledger").doc(lid), {
                  id: lid,
                  tierId: String(t.id),
                  tierVersion: lifetimeTierVersion,
                  programType: "lifetime",
                  userId,
                  userEmail: u.email || "",
                  userName: u.name || "",
                  orderId: docId,
                  threshold: Number(t.threshold),
                  rewardType: t.rewardType === "cashback" ? "cashback" : "discount",
                  rewardValue: Number(t.rewardValue || 0),
                  couponCode: issuedCouponsByTier[String(t.id)] || null,
                  createdAt: Date.now()
                }, { merge: true });
              });
              cashbackSafeMonthlyEarned.forEach((t) => {
                const safeTierId = String(t.id).replace(/[^a-zA-Z0-9_-]/g, "_");
                const lid = `monthly_purchase_${userId}_${currentMonthKey}_${safeTierId}_${docId}`;
                tx.set(db.collection("purchase_reward_ledger").doc(lid), {
                  id: lid,
                  tierId: String(t.id),
                  tierVersion: monthlyTierVersion,
                  programType: "monthly",
                  monthKey: currentMonthKey,
                  userId,
                  userEmail: u.email || "",
                  userName: u.name || "",
                  orderId: docId,
                  threshold: Number(t.threshold),
                  rewardType: "cashback",
                  rewardValue: Number(t.rewardValue || 0),
                  couponCode: null,
                  createdAt: Date.now()
                }, { merge: true });
              });
            }
            tx.set(orderRef, completedOrderForRewards, { merge: true });
          });
          if (!orderWasCompleted && String(nextOrder.status || "").toLowerCase() === "completed") {
            const completedUserId = String(completedOrderForRewards.userId || "").trim();
            const completedProductIds = [...new Set((Array.isArray(completedOrderForRewards.items) ? completedOrderForRewards.items : []).map((item) => String(item.id || item.productId || "").trim()).filter(Boolean))];
            if (completedUserId && !completedUserId.startsWith("guest_") && completedProductIds.length) {
              const reviewQuery = await db.collection("reviews").where("userId", "==", completedUserId).get();
              for (const reviewDoc of reviewQuery.docs) {
                const review = reviewDoc.data() || {};
                const productId = String(review.productId || "").trim();
                if (!completedProductIds.includes(productId) || review.hidden === true) continue;
                const rating = Math.min(5, Math.max(1, Number(review.rating) || 0));
                if (rating < 4 || review.pointsRewarded === true) continue;
                const claimRef = db.collection("review_reward_claims").doc(`rev_${completedUserId}_${productId}`);
                const reviewRef = reviewDoc.ref;
                const rewardUserRef = db.collection("users").doc(completedUserId);
                const cfgRef = db.collection("store_config").doc("reward_settings");
                await db.runTransaction(async (tx) => {
                  const [orderCheck, freshReview, claim, rewardUser, cfg] = await Promise.all([
                    tx.get(orderRef),
                    tx.get(reviewRef),
                    tx.get(claimRef),
                    tx.get(rewardUserRef),
                    tx.get(cfgRef)
                  ]);
                  if (!orderCheck.exists || String((orderCheck.data() || {}).status || "").toLowerCase() !== "completed") return;
                  const fresh = freshReview.data() || {};
                  if (!freshReview.exists || fresh.hidden === true || fresh.pointsRewarded === true || claim.exists) return;
                  if (String(fresh.userId || "") !== completedUserId || String(fresh.productId || "") !== productId) return;
                  const orderNow = orderCheck.data() || {};
                  if (isOrderRefunded(orderNow) || !Array.isArray(orderNow.items) || !orderNow.items.some((i) => String(i.id || i.productId || "") === productId && Number(i.qty || 0) > 0)) return;
                  const config2 = cfg.exists ? getRewardSettings(cfg.data()) : DEFAULT_REWARD_SETTINGS;
                  const stars = Number(fresh.rating) || 0;
                  let points = stars === 5 ? Number(config2.points5Star ?? 0) : stars === 4 ? Number(config2.points4Star ?? 0) : 0;
                  const verifiedPhotos = Array.isArray(fresh.photos) ? fresh.photos.filter((url) => isCustomerReviewImageUrl(url, completedUserId, productId)) : [];
                  if (stars >= 4 && verifiedPhotos.length && Number(config2.photoBonusPoints || 0) > 0) points += Number(config2.photoBonusPoints || 0);
                  const reviewSafety = normalizeFinancialSafety(config2);
                  if (points > reviewSafety.maxReviewPointsPerReview) {
                    tx.set(db.collection("financial_audit_logs").doc(`review_reward_blocked_${completedUserId}_${productId}`), {
                      eventType: "review_reward_blocked_by_cap",
                      userId: completedUserId,
                      productId,
                      reviewId: reviewDoc.id,
                      attemptedPoints: points,
                      allowedPoints: reviewSafety.maxReviewPointsPerReview,
                      verifiedOrderId: docId,
                      createdAt: Date.now()
                    }, { merge: true });
                    return;
                  }
                  if (!(points > 0)) return;
                  const u = rewardUser.exists ? rewardUser.data() || {} : {};
                  const before = Number(u.pointsBalance || 0), debtBefore = Math.max(0, Number(u.pointsDebt || 0));
                  const debtPaid = Math.min(debtBefore, points), spendablePoints = points - debtPaid;
                  const after = before + spendablePoints, debtAfter = debtBefore - debtPaid, now = Date.now();
                  const ledgerId = `led_rev_${completedUserId}_${productId}`;
                  tx.create(claimRef, { id: `rev_${completedUserId}_${productId}`, userId: completedUserId, productId, reviewId: reviewDoc.id, pointsAwarded: points, claimedAt: now, verifiedOrderId: docId, rule: "one_reward_per_customer_per_product" });
                  tx.set(rewardUserRef, { pointsBalance: after, pointsDebt: debtAfter, totalPointsEarned: Number(u.totalPointsEarned || 0) + points, updatedAt: now }, { merge: true });
                  tx.create(db.collection("financial_audit_logs").doc(`review_reward_${completedUserId}_${productId}`), {
                    eventType: "review_points_issued",
                    userId: completedUserId,
                    productId,
                    reviewId: reviewDoc.id,
                    pointsAwarded: points,
                    verifiedOrderId: docId,
                    createdAt: now
                  });
                  tx.set(db.collection("points_ledger").doc(ledgerId), { id: ledgerId, userId: completedUserId, type: "review_reward", pointsDelta: spendablePoints, grossPointsAwarded: points, pointsDebtPaid: debtPaid, pointsDebtAfter: debtAfter, balanceBefore: before, balanceAfter: after, reason: `${stars}-Star Review (${fresh.productName || productId})${verifiedPhotos.length ? " + Photo" : ""}`, referenceId: reviewDoc.id, productId, verifiedOrderId: docId, createdAt: now });
                  tx.set(reviewRef, { pointsRewarded: true, pointsAwarded: points, verifiedPurchase: true, verifiedOrderId: docId, rewardPending: false, rewardGrantedAt: now, updatedAt: now }, { merge: true });
                });
              }
            }
          }
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId, purchaseReward }) };
        }
        if (action === "admin_refund_completed_order") {
          const orderId = String(body.orderId || "").trim();
          const reason = String(body.reason || "").trim().slice(0, 500);
          if (!orderId || !reason) throw new Error("Order ID \u1014\u103E\u1004\u1037\u103A Refund reason \u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
          const orderRef = db.collection("orders").doc(orderId);
          const refundResult = await db.runTransaction(async (tx) => {
            const orderSnap = await tx.get(orderRef);
            if (!orderSnap.exists) throw new Error("Order \u1019\u1010\u103D\u1031\u1037\u1015\u102B\u104B");
            const order = orderSnap.data() || {};
            if (String(order.status || "").toLowerCase() === "refunded") return { alreadyRefunded: true };
            if (String(order.status || "").toLowerCase() !== "completed") throw new Error("Completed order \u1019\u101F\u102F\u1010\u103A\u101E\u1031\u102C\u1000\u103C\u1031\u102C\u1004\u1037\u103A Refund \u1019\u101C\u102F\u1015\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u104B");
            const userId = String(order.userId || "").trim();
            const userRef = userId && !userId.startsWith("guest_") ? db.collection("users").doc(userId) : null;
            const markerRef = userRef ? db.collection("purchase_order_rewards").doc(`${userId}_${orderId}`) : null;
            const claimQuery = userId && !userId.startsWith("guest_") ? db.collection("review_reward_claims").where("verifiedOrderId", "==", orderId) : null;
            const reviewQuery = userId && !userId.startsWith("guest_") ? db.collection("reviews").where("verifiedOrderId", "==", orderId) : null;
            const otherOrdersQuery = userId && !userId.startsWith("guest_") ? db.collection("orders").where("userId", "==", userId) : null;
            const purchaseLedgerQuery = userId && !userId.startsWith("guest_") ? db.collection("purchase_reward_ledger").where("userId", "==", userId) : null;
            const orderCouponCode = String(order.couponCode || "").trim().toUpperCase();
            const orderCouponRef = orderCouponCode ? db.collection("redeemed_coupons").doc(orderCouponCode) : null;
            const promoCounterRef = orderCouponCode && !/^(RWD|MS)/.test(orderCouponCode) ? db.collection("promo_coupon_counters").doc(orderCouponCode) : null;
            const promoUsageRef = promoCounterRef && userId && !userId.startsWith("guest_") ? db.collection("promo_coupon_usage").doc(cryptoCompat.createHash("sha256").update(`${orderCouponCode}:${userId}`).digest("hex")) : null;
            const [markerSnap, userSnap, claimSnap, reviewSnap, otherOrdersSnap, purchaseLedgerSnap, orderCouponSnap, cfgSnap, promoCounterSnap, promoUsageSnap] = await Promise.all([
              markerRef ? tx.get(markerRef) : Promise.resolve(null),
              userRef ? tx.get(userRef) : Promise.resolve(null),
              claimQuery ? tx.get(claimQuery) : Promise.resolve(null),
              reviewQuery ? tx.get(reviewQuery) : Promise.resolve(null),
              otherOrdersQuery ? tx.get(otherOrdersQuery) : Promise.resolve(null),
              purchaseLedgerQuery ? tx.get(purchaseLedgerQuery) : Promise.resolve(null),
              orderCouponRef ? tx.get(orderCouponRef) : Promise.resolve(null),
              tx.get(db.collection("store_config").doc("reward_settings")),
              promoCounterRef ? tx.get(promoCounterRef) : Promise.resolve(null),
              promoUsageRef ? tx.get(promoUsageRef) : Promise.resolve(null)
            ]);
            let sourceRefundLedgerRef = null, sourceRefundLedgerSnap = null;
            const orderCouponData = orderCouponSnap && orderCouponSnap.exists ? orderCouponSnap.data() || {} : null;
            const couponWasUsedOnThisOrder = Boolean(orderCouponData && orderCouponData.used === true && String(orderCouponData.usedOrderId || "") === orderId);
            const couponUsageDiscount = couponWasUsedOnThisOrder ? Math.max(0, Number(orderCouponData.usedDiscountAmount || order.discountAmount || 0)) : 0;
            if (couponWasUsedOnThisOrder && orderCouponData.revokedBySourceRefund === true && orderCouponData.sourceRefundOrderId && userId) {
              sourceRefundLedgerRef = db.collection("purchase_reward_ledger").doc(`purchase_refund_${userId}_${String(orderCouponData.sourceRefundOrderId)}`);
              sourceRefundLedgerSnap = await tx.get(sourceRefundLedgerRef);
            }
            const cfg = cfgSnap.exists ? getRewardSettings(cfgSnap.data()) : DEFAULT_REWARD_SETTINGS;
            const u = userSnap && userSnap.exists ? userSnap.data() || {} : {};
            let cashbackReversed = 0, tierIdsReversed = [], reviewPointsReversed = 0, reviewCountAffected = 0;
            let cashbackUpdate = null;
            if (markerSnap && markerSnap.exists) {
              const marker = markerSnap.data() || {};
              if (marker.reversedAt) throw new Error("\u1024 Order \u104F Purchase Rewards \u1000\u102D\u102F \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101B\u102F\u1015\u103A\u101E\u102D\u1019\u103A\u1038\u1015\u103C\u102E\u1038\u101E\u102C\u1038\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
              const refundedSpend = Math.max(0, Number(marker.totalAmount || order.totalAmount || 0));
              const netSpendAfterRefund = Math.max(0, Number(u.purchaseTotalSpent || 0) - refundedSpend);
              const refundedMonthKey = myanmarMonthKey(order.completedAt || order.createdAt || 0);
              const monthlySpendAfterRefund = (otherOrdersSnap ? otherOrdersSnap.docs : []).reduce((sum, orderDoc) => {
                if (orderDoc.id === orderId) return sum;
                const other = orderDoc.data() || {};
                if (String(other.status || "").toLowerCase() !== "completed" || other.refundedAt || other.refunded === true) return sum;
                if (myanmarMonthKey(other.completedAt || other.createdAt || 0) !== refundedMonthKey) return sum;
                return sum + Math.max(0, Number(other.totalAmount || 0) - Math.max(0, Number(other.refundedAmount || other.partialRefundAmount || 0)));
              }, 0);
              const purchaseLedgerDocs = purchaseLedgerSnap ? purchaseLedgerSnap.docs : [];
              const activeRewardDocs = purchaseLedgerDocs.filter((doc) => {
                const reward = doc.data() || {};
                if (reward.type === "refund_reversal" || reward.reversedAt) return false;
                const stillQualifies = reward.programType === "monthly" ? String(reward.monthKey || "") !== refundedMonthKey || monthlySpendAfterRefund >= Number(reward.threshold || 0) : netSpendAfterRefund >= Number(reward.threshold || 0);
                return !stillQualifies;
              });
              const legacyLedgerAvailable = purchaseLedgerDocs.some((doc) => (doc.data() || {}).type !== "refund_reversal");
              const rewardsToReverse = legacyLedgerAvailable ? activeRewardDocs.map((doc) => ({ ref: doc.ref, ...doc.data() || {} })) : Array.isArray(marker.earnedRewards) && marker.earnedRewards.length ? marker.earnedRewards.filter((reward) => reward.programType === "monthly" ? monthlySpendAfterRefund < Number(reward.threshold || 0) : netSpendAfterRefund < Number(reward.threshold || 0)) : Array.isArray(marker.earnedTierIds) ? marker.earnedTierIds.map((id) => ({ id: String(id), programType: "lifetime", rewardType: "cashback", rewardValue: 0, couponCode: null })) : [];
              tierIdsReversed = rewardsToReverse.map((reward) => reward.programType === "monthly" ? `monthly:${String(reward.monthKey || refundedMonthKey)}:${String(reward.tierId || reward.id || "")}` : String(reward.tierId || reward.id || ""));
              cashbackReversed = legacyLedgerAvailable ? rewardsToReverse.reduce((sum, reward) => sum + (reward.rewardType === "cashback" ? Math.max(0, Number(reward.rewardValue || 0)) : 0), 0) : Math.max(0, Number(marker.cashbackCredited || 0));
              const currentCashback = Math.max(0, Number(u.cashbackBalance || 0));
              const cashbackBalanceUsed = Math.min(currentCashback, cashbackReversed);
              const cashbackDebtAdded2 = cashbackReversed - cashbackBalanceUsed;
              const nextCashbackDebt = Math.max(0, Number(u.cashbackDebt || 0)) + cashbackDebtAdded2;
              const couponCodes = legacyLedgerAvailable ? rewardsToReverse.map((reward) => String(reward.couponCode || "")).filter(Boolean) : Array.isArray(marker.issuedCoupons) ? marker.issuedCoupons.map(String) : [];
              const couponRefs = couponCodes.map((code) => db.collection("redeemed_coupons").doc(code));
              const couponSnaps = await Promise.all(couponRefs.map((ref2) => tx.get(ref2)));
              const usedOrderIds = couponSnaps.map((snap) => snap.exists && (snap.data() || {}).used === true ? String((snap.data() || {}).usedOrderId || "") : "").filter(Boolean);
              const uniqueUsedOrderIds = [...new Set(usedOrderIds)];
              const usedOrderSnaps = await Promise.all(uniqueUsedOrderIds.map((id) => tx.get(db.collection("orders").doc(id))));
              const usedOrderRefundedById = new Map(uniqueUsedOrderIds.map((id, idx) => [id, Boolean(usedOrderSnaps[idx].exists && String((usedOrderSnaps[idx].data() || {}).status || "").toLowerCase() === "refunded")]));
              const couponReversals = [];
              couponSnaps.forEach((couponSnap, idx) => {
                if (!couponSnap.exists) return;
                const coupon = couponSnap.data() || {};
                const couponCode = couponCodes[idx];
                if (coupon.used === true) {
                  const usedOrderId = String(coupon.usedOrderId || "");
                  const usedOrderRefunded = Boolean(usedOrderRefundedById.get(usedOrderId));
                  const usedDiscount = usedOrderRefunded ? 0 : Math.max(0, Number(coupon.usedDiscountAmount || 0));
                  couponReversals.push({ code: couponCode, used: true, usedOrderId: coupon.usedOrderId || null, usedOrderRefunded, debtAdded: usedDiscount });
                  tx.set(couponRefs[idx], { revokedBySourceRefund: true, sourceRefundedAt: Date.now(), sourceRefundOrderId: orderId }, { merge: true });
                } else {
                  tx.set(couponRefs[idx], { revoked: true, revokedAt: Date.now(), revokedReason: `Source order ${orderId} refunded` }, { merge: true });
                  couponReversals.push({ code: couponCode, used: false, debtAdded: 0 });
                }
              });
              const couponDebtAdded2 = couponReversals.reduce((sum, c) => sum + Number(c.debtAdded || 0), 0);
              const currentTierIds = Array.isArray(u.purchaseRewardTierIds) ? u.purchaseRewardTierIds.map(String) : [];
              const currentMonthlyKeys = Array.isArray(u.monthlyPurchaseRewardTierKeys) ? u.monthlyPurchaseRewardTierKeys.map(String) : [];
              const reversedLifetimeIds = new Set(rewardsToReverse.filter((r) => r.programType !== "monthly").map((r) => String(r.tierId || r.id || "")));
              const reversedMonthlyKeys = new Set(rewardsToReverse.filter((r) => r.programType === "monthly").map((r) => `${String(r.monthKey || refundedMonthKey)}:${String(r.tierId || r.id || "")}`));
              const history = Array.isArray(u.purchaseRewardHistory) ? u.purchaseRewardHistory.map((item) => {
                const isMonthly = item.programType === "monthly";
                const key = isMonthly ? `${String(item.monthKey || "")}:${String(item.id || "")}` : String(item.id || "");
                return (isMonthly ? reversedMonthlyKeys.has(key) : reversedLifetimeIds.has(key)) ? { ...item, status: "reversed", reversedAt: Date.now(), reversalReason: reason } : item;
              }) : [];
              for (const reward of rewardsToReverse) {
                if (reward.ref) tx.set(reward.ref, { reversedAt: Date.now(), reversedBy: adminUid, reversalOrderId: orderId, reversalReason: reason }, { merge: true });
              }
              const cashbackHistory = Array.isArray(u.cashbackHistory) ? u.cashbackHistory.slice() : [];
              const cashbackReversalEntries = rewardsToReverse.filter((reward) => reward.rewardType === "cashback").map((reward) => {
                const amount = Math.max(0, Number(reward.rewardValue || 0));
                const tierId = String(reward.tierId || reward.id || "");
                const programType = reward.programType === "monthly" ? "monthly" : "lifetime";
                const monthKey = programType === "monthly" ? String(reward.monthKey || refundedMonthKey) : null;
                const sourceOrderId = String(reward.orderId || orderId);
                const safeTierId = tierId.replace(/[^A-Za-z0-9_-]/g, "_");
                const reversalId2 = `refund_${orderId}_${programType}_${sourceOrderId}_${safeTierId}`;
                tx.set(db.collection("cashback_ledger").doc(reversalId2), {
                  id: reversalId2,
                  userId,
                  orderId: sourceOrderId,
                  refundOrderId: orderId,
                  tierId,
                  programType,
                  monthKey,
                  type: "refund_reversal",
                  amount,
                  balanceAfter: Math.max(0, currentCashback - cashbackBalanceUsed),
                  debtAfter: nextCashbackDebt,
                  createdAt: Date.now(),
                  reason,
                  reversalOf: `${programType === "monthly" ? "earn_monthly" : "earn"}_${userId}_${sourceOrderId}_${safeTierId}`
                });
                return { id: reversalId2, type: "refund_reversal", amount, orderId: sourceOrderId, refundOrderId: orderId, programType, monthKey, createdAt: Date.now(), reason };
              });
              cashbackHistory.unshift(...cashbackReversalEntries);
              cashbackUpdate = {
                purchaseTotalSpent: netSpendAfterRefund,
                purchaseOrderCount: Math.max(0, Number(u.purchaseOrderCount || 0) - 1),
                cashbackBalance: currentCashback - cashbackBalanceUsed,
                cashbackDebt: nextCashbackDebt + couponDebtAdded2,
                cashbackTotalEarned: Math.max(0, Math.max(Number(u.cashbackTotalEarned || 0), Array.isArray(u.purchaseRewardHistory) ? u.purchaseRewardHistory.filter((item) => item.rewardType === "cashback" && item.status !== "reversed").reduce((sum, item) => sum + Math.max(0, Number(item.rewardValue || 0)), 0) : 0) - cashbackReversed),
                cashbackHistory: cashbackHistory.slice(0, 100),
                purchaseRewardTierIds: currentTierIds.filter((id) => !reversedLifetimeIds.has(id)),
                monthlyPurchaseRewardTierKeys: currentMonthlyKeys.filter((key) => !reversedMonthlyKeys.has(key)),
                ...String(u.monthlyPurchaseMonthKey || "") === refundedMonthKey ? { monthlyPurchaseTotalSpent: monthlySpendAfterRefund } : {},
                purchaseRewardHistory: history
              };
              tx.set(markerRef, { reversedAt: Date.now(), reversedBy: adminUid, reversalReason: reason }, { merge: true });
              const reversalId = `purchase_refund_${userId}_${orderId}`;
              tx.set(db.collection("purchase_reward_ledger").doc(reversalId), {
                id: reversalId,
                userId,
                orderId,
                type: "refund_reversal",
                cashbackReversed,
                cashbackDebtAdded: cashbackDebtAdded2,
                couponDebtAdded: couponDebtAdded2,
                couponReversals,
                tierIdsReversed,
                reason,
                adminUid,
                adminEmail,
                createdAt: Date.now()
              });
            }
            const pointsUsedOnOrder = Math.max(0, Number(order.pointsUsed || 0));
            if (pointsUsedOnOrder > 0 && userRef && !order.pointsRestoredAt) {
              const currentPoints = Math.max(0, Number(u.pointsBalance || 0));
              const restoredPoints = currentPoints + pointsUsedOnOrder;
              const history = Array.isArray(u.pointsHistory) ? u.pointsHistory.slice() : [];
              history.unshift({ id: `refund_restore_${orderId}`, type: "refund_restore", points: pointsUsedOnOrder, orderId, createdAt: Date.now(), balanceAfter: restoredPoints });
              cashbackUpdate = { ...cashbackUpdate || {}, pointsBalance: restoredPoints, pointsTotalUsed: Math.max(0, Number(u.pointsTotalUsed || 0) - pointsUsedOnOrder), pointsHistory: history.slice(0, 100) };
              tx.set(db.collection("points_ledger").doc(`refund_restore_${orderId}`), { id: `refund_restore_${orderId}`, userId, orderId, type: "checkout_refund_restore", pointsDelta: pointsUsedOnOrder, balanceBefore: currentPoints, balanceAfter: restoredPoints, reason: "Refund Order \u1021\u1010\u103D\u1000\u103A Checkout Points \u1015\u103C\u1014\u103A\u1021\u1019\u103A\u1038", createdAt: Date.now() });
            }
            const cashbackUsedOnOrder = Math.max(0, Number(order.cashbackUsed || 0));
            if (cashbackUsedOnOrder > 0 && userRef && !order.cashbackRestoredAt) {
              const baseBalance = cashbackUpdate ? Math.max(0, Number(cashbackUpdate.cashbackBalance || 0)) : Math.max(0, Number(u.cashbackBalance || 0));
              const restoredBalance = baseBalance + cashbackUsedOnOrder;
              const baseUsedTotal = cashbackUpdate ? Math.max(0, Number(u.cashbackTotalUsed || 0)) : Math.max(0, Number(u.cashbackTotalUsed || 0));
              const history = Array.isArray(u.cashbackHistory) ? u.cashbackHistory.slice() : [];
              history.unshift({ id: `refund_restore_${orderId}`, type: "refund_restore", amount: cashbackUsedOnOrder, orderId, createdAt: Date.now(), balanceAfter: restoredBalance });
              cashbackUpdate = { ...cashbackUpdate || {}, cashbackBalance: restoredBalance, cashbackTotalUsed: Math.max(0, baseUsedTotal - cashbackUsedOnOrder), cashbackHistory: history.slice(0, 100) };
              tx.set(db.collection("cashback_ledger").doc(`refund_restore_${orderId}`), { id: `refund_restore_${orderId}`, userId, orderId, type: "refund_restore", amount: cashbackUsedOnOrder, balanceBefore: baseBalance, balanceAfter: restoredBalance, createdAt: Date.now() });
            }
            let couponDebtReversed = 0;
            if (couponWasUsedOnThisOrder && orderCouponRef) {
              if (orderCouponData.revokedBySourceRefund === true) {
                const currentDebt = Math.max(0, Number(u.cashbackDebt || 0));
                const alreadyReversed = Boolean(orderCouponData.sourceRefundDebtReversedAt);
                if (!alreadyReversed && sourceRefundLedgerSnap && sourceRefundLedgerSnap.exists) {
                  couponDebtReversed = Math.min(currentDebt, couponUsageDiscount);
                  tx.set(orderCouponRef, { sourceRefundDebtReversedAt: Date.now(), usedOrderRefundedAt: Date.now() }, { merge: true });
                  const sourceLedger = sourceRefundLedgerSnap.data() || {};
                  const updatedCouponReversals = Array.isArray(sourceLedger.couponReversals) ? sourceLedger.couponReversals.map(
                    (entry) => String(entry.code || "") === orderCouponCode ? { ...entry, debtAdded: 0, usedOrderRefunded: true, debtReversedAt: Date.now() } : entry
                  ) : [];
                  tx.set(sourceRefundLedgerRef, {
                    couponDebtAdded: Math.max(0, Number(sourceLedger.couponDebtAdded || 0) - couponDebtReversed),
                    couponUseRefundedOrderAt: Date.now(),
                    couponReversals: updatedCouponReversals
                  }, { merge: true });
                }
              } else {
                tx.set(orderCouponRef, { used: false, usedAt: null, usedOrderId: null, usedDiscountAmount: 0, usageRestoredAt: Date.now(), usageRestoredReason: `Order ${orderId} refunded` }, { merge: true });
              }
            }
            if (couponDebtReversed > 0 && userRef) {
              const nextDebt = Math.max(0, Number(u.cashbackDebt || 0) - couponDebtReversed);
              if (cashbackUpdate) cashbackUpdate.cashbackDebt = Math.max(0, Number(cashbackUpdate.cashbackDebt || 0) - couponDebtReversed);
              else tx.set(userRef, { cashbackDebt: nextDebt, updatedAt: Date.now() }, { merge: true });
            }
            const claimDocs = claimSnap ? claimSnap.docs : [];
            const reviewDocs = reviewSnap ? reviewSnap.docs : [];
            const remainingPurchaseByProduct = /* @__PURE__ */ new Map();
            for (const otherDoc of otherOrdersSnap ? otherOrdersSnap.docs : []) {
              if (otherDoc.id === orderId) continue;
              const other = otherDoc.data() || {};
              if (String(other.status || "").toLowerCase() !== "completed" || isOrderRefunded(other)) continue;
              for (const item of Array.isArray(other.items) ? other.items : []) {
                const pid2 = String(item.id || item.productId || "").trim();
                if (pid2 && Number(item.qty || 0) > 0 && !remainingPurchaseByProduct.has(pid2)) remainingPurchaseByProduct.set(pid2, otherDoc.id);
              }
            }
            const reviewByProduct = /* @__PURE__ */ new Map();
            for (const d of reviewDocs) {
              const r = d.data() || {};
              reviewByProduct.set(String(r.productId || ""), { reviewRef: d.ref, reviewId: d.id, review: r });
            }
            const claimsToReverse = [];
            for (const d of claimDocs) {
              const c = d.data() || {};
              const productId = String(c.productId || "");
              if (c.reversedAt || !(Number(c.pointsAwarded || 0) > 0) || remainingPurchaseByProduct.has(productId)) continue;
              claimsToReverse.push({ ref: d.ref, claim: c, productId });
            }
            if (cfg.reverseReviewPointsOnRefund !== false) {
              for (const [productId, item] of reviewByProduct.entries()) {
                if (!remainingPurchaseByProduct.has(productId) && item.review.pointsRewarded === true && Number(item.review.pointsAwarded || 0) > 0 && !item.review.pointsReversedAt && !claimsToReverse.some((x) => x.productId === productId)) {
                  claimsToReverse.push({ ref: db.collection("review_reward_claims").doc(`rev_${userId}_${productId}`), claim: { pointsAwarded: Number(item.review.pointsAwarded || 0), userId, productId, reviewId: item.reviewId, verifiedOrderId: orderId }, productId, legacyReview: item });
                }
              }
              reviewPointsReversed = claimsToReverse.reduce((sum, x) => sum + Math.max(0, Number(x.claim.pointsAwarded || 0)), 0);
            }
            let pointsBalanceAfter = Number(u.pointsBalance || 0);
            let pointsDebtAfter = Math.max(0, Number(u.pointsDebt || 0));
            if (reviewPointsReversed > 0 && userRef) {
              const currentBalance = Math.max(0, Number(u.pointsBalance || 0)) + (pointsUsedOnOrder > 0 && !order.pointsRestoredAt ? pointsUsedOnOrder : 0);
              const balanceUsed = Math.min(currentBalance, reviewPointsReversed);
              const debtAdded = reviewPointsReversed - balanceUsed;
              pointsBalanceAfter = currentBalance - balanceUsed;
              pointsDebtAfter += debtAdded;
              const now = Date.now();
              tx.set(userRef, { ...cashbackUpdate || {}, pointsBalance: pointsBalanceAfter, pointsDebt: pointsDebtAfter, updatedAt: now }, { merge: true });
              const reversalId = `review_refund_${userId}_${orderId}`;
              tx.set(db.collection("points_ledger").doc(reversalId), {
                id: reversalId,
                userId,
                type: "review_reward_refund",
                pointsDelta: -balanceUsed,
                pointsReversed: reviewPointsReversed,
                debtAdded,
                balanceBefore: currentBalance,
                balanceAfter: pointsBalanceAfter,
                pointsDebtAfter,
                orderId,
                reason: `Refund reversal: ${reason}`,
                adminUid,
                adminEmail,
                createdAt: now
              });
              for (const entry of claimsToReverse) {
                tx.set(entry.ref, { reversedAt: now, reversedBy: adminUid, reversalOrderId: orderId, reversalReason: reason, pointsReversed: Number(entry.claim.pointsAwarded || 0) }, { merge: true });
              }
            } else if (cashbackUpdate && userRef) {
              tx.set(userRef, { ...cashbackUpdate, updatedAt: Date.now() }, { merge: true });
            }
            const keepReviews = cfg.keepReviewAfterRefund !== false;
            const reversedProductIds = new Set(claimsToReverse.map((x) => x.productId));
            const reviewProductIdsAffected = [];
            for (const [productId, item] of reviewByProduct.entries()) {
              reviewCountAffected++;
              reviewProductIdsAffected.push(productId);
              const alternateOrderId = remainingPurchaseByProduct.get(productId) || null;
              const wasReversed = !alternateOrderId && cfg.reverseReviewPointsOnRefund !== false && reversedProductIds.has(productId);
              tx.set(item.reviewRef, {
                ...wasReversed ? { pointsRewarded: false, pointsAwarded: 0, pointsReversedAt: Date.now() } : {},
                verifiedPurchase: Boolean(alternateOrderId),
                verifiedOrderId: alternateOrderId,
                rewardPending: false,
                hidden: alternateOrderId ? Boolean(item.review.hidden) : keepReviews ? Boolean(item.review.hidden) : true,
                refundReviewAction: alternateOrderId ? "verified_by_another_completed_order" : wasReversed ? keepReviews ? "kept_unverified" : "hidden_after_refund" : keepReviews ? "kept_unverified_points_retained" : "hidden_points_retained",
                updatedAt: Date.now()
              }, { merge: true });
            }
            const promoUsageRestored = restorePromoCouponUsageInTransaction(tx, db, orderCouponCode, userId, orderId, promoCounterSnap, promoUsageSnap, promoCounterRef, promoUsageRef);
            tx.create(db.collection("financial_audit_logs").doc(`refund_${orderId}`), {
              eventType: "completed_order_refunded",
              userId,
              orderId,
              reason,
              adminUid,
              adminEmail,
              cashbackReversed,
              reviewPointsReversed,
              couponCode: orderCouponCode || null,
              couponUsageDiscount: couponWasUsedOnThisOrder ? couponUsageDiscount : 0,
              promoUsageRestored,
              createdAt: Date.now()
            });
            tx.set(orderRef, { status: "refunded", refundedAt: Date.now(), refundReason: reason, refundedBy: adminUid, ...cashbackUsedOnOrder > 0 ? { cashbackRestoredAt: Date.now() } : {}, ...pointsUsedOnOrder > 0 ? { pointsRestoredAt: Date.now() } : {}, updatedAt: Date.now() }, { merge: true });
            return {
              alreadyRefunded: false,
              reviewProductIdsAffected,
              reversal: { promoUsageRestored, cashbackReversed, cashbackDebtAdded: Math.max(0, Number(u.cashbackDebt || 0)) + cashbackDebtAdded, couponDebtAdded, couponDebtReversed, couponUsageRestored: couponWasUsedOnThisOrder && orderCouponData.revokedBySourceRefund !== true, tierIdsReversed, reviewPointsReversed, reviewCountAffected, pointsBalanceAfter, pointsDebtAfter }
            };
          });
          if (!refundResult.alreadyRefunded && Array.isArray(refundResult.reviewProductIdsAffected)) {
            for (const productId of refundResult.reviewProductIdsAffected) await syncProductVisibleReviews(db, productId);
          }
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, orderId, ...refundResult }) };
        }
        if (action === "admin_cancel_pending_order" || action === "delete_order") {
          const docId = String(body.orderId || body.id || "").trim();
          if (!docId) throw new Error("Order ID \u101C\u102D\u102F\u1021\u1015\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
          const orderRef = db.collection("orders").doc(docId);
          const cancelResult = await db.runTransaction(async (tx) => {
            const orderSnap = await tx.get(orderRef);
            if (!orderSnap.exists) throw new Error("Order \u1019\u1010\u103D\u1031\u1037\u1015\u102B\u104B");
            const order = orderSnap.data() || {};
            const status = String(order.status || "").toLowerCase();
            if (status === "cancelled" || status === "canceled") return { alreadyCancelled: true };
            if (!["pending", "processing", "shipped", "failed"].includes(status)) throw new Error("\u1024 Order \u1021\u1001\u103C\u1031\u1021\u1014\u1031\u1000\u102D\u102F Cancel \u1019\u101C\u102F\u1015\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u104B Completed Order \u1021\u1010\u103D\u1000\u103A Refund \u1000\u102D\u102F \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1015\u102B\u104B");
            const items = Array.isArray(order.items) ? order.items : [];
            const productRefs = [...new Set(items.map((x) => String(x.id || "")).filter(Boolean))].map((id) => db.collection("products").doc(id));
            const userId = String(order.userId || "");
            const userRef = userId && !userId.startsWith("guest_") ? db.collection("users").doc(userId) : null;
            const couponCode = String(order.couponCode || "").trim().toUpperCase();
            const couponRef = couponCode ? db.collection("redeemed_coupons").doc(couponCode) : null;
            const promoCounterRef = couponCode && !/^(RWD|MS)/.test(couponCode) ? db.collection("promo_coupon_counters").doc(couponCode) : null;
            const promoUsageRef = promoCounterRef && userId && !userId.startsWith("guest_") ? db.collection("promo_coupon_usage").doc(cryptoCompat.createHash("sha256").update(`${couponCode}:${userId}`).digest("hex")) : null;
            const [productSnaps, userSnap, couponSnap, promoCounterSnap, promoUsageSnap] = await Promise.all([
              Promise.all(productRefs.map((ref2) => tx.get(ref2))),
              userRef ? tx.get(userRef) : Promise.resolve(null),
              couponRef ? tx.get(couponRef) : Promise.resolve(null),
              promoCounterRef ? tx.get(promoCounterRef) : Promise.resolve(null),
              promoUsageRef ? tx.get(promoUsageRef) : Promise.resolve(null)
            ]);
            const now = Date.now();
            productSnaps.forEach((snap, idx) => {
              if (!snap.exists) return;
              const id = productRefs[idx].id;
              const qty = items.filter((x) => String(x.id || "") === id).reduce((n, x) => n + Math.max(0, Math.floor(Number(x.qty || 0))), 0);
              if (qty > 0) tx.update(productRefs[idx], { stock: Math.max(0, Number((snap.data() || {}).stock || 0)) + qty, updatedAt: now });
            });
            let cashbackRestored = 0, pointsRestored = 0;
            if (userRef && userSnap && userSnap.exists) {
              const u = userSnap.data() || {};
              const cashbackUsed = Math.max(0, Number(order.cashbackUsed || 0));
              const pointsUsed = Math.max(0, Number(order.pointsUsed || 0));
              const nextCashback = Math.max(0, Number(u.cashbackBalance || 0)) + cashbackUsed;
              const nextPoints = Math.max(0, Number(u.pointsBalance || 0)) + pointsUsed;
              cashbackRestored = cashbackUsed;
              pointsRestored = pointsUsed;
              const updates = { updatedAt: now };
              if (cashbackUsed > 0) {
                updates.cashbackBalance = nextCashback;
                updates.cashbackTotalUsed = Math.max(0, Number(u.cashbackTotalUsed || 0) - cashbackUsed);
                const h = Array.isArray(u.cashbackHistory) ? u.cashbackHistory.slice() : [];
                h.unshift({ id: `cancel_restore_${docId}`, type: "cancel_restore", amount: cashbackUsed, orderId: docId, createdAt: now, balanceAfter: nextCashback });
                updates.cashbackHistory = h.slice(0, 100);
                tx.create(db.collection("cashback_ledger").doc(`cancel_restore_${docId}`), { id: `cancel_restore_${docId}`, userId, orderId: docId, type: "cancel_restore", amount: cashbackUsed, balanceAfter: nextCashback, createdAt: now });
              }
              if (pointsUsed > 0) {
                updates.pointsBalance = nextPoints;
                updates.pointsTotalUsed = Math.max(0, Number(u.pointsTotalUsed || 0) - pointsUsed);
                tx.create(db.collection("points_ledger").doc(`cancel_restore_${docId}`), { id: `cancel_restore_${docId}`, userId, orderId: docId, type: "checkout_cancel_restore", pointsDelta: pointsUsed, balanceBefore: Number(u.pointsBalance || 0), balanceAfter: nextPoints, reason: "Cancelled Order \u1021\u1010\u103D\u1000\u103A Points \u1015\u103C\u1014\u103A\u1021\u1019\u103A\u1038", createdAt: now });
              }
              tx.set(userRef, updates, { merge: true });
            }
            if (couponRef && couponSnap && couponSnap.exists) {
              const c = couponSnap.data() || {};
              if (c.used === true && String(c.usedOrderId || "") === docId) tx.set(couponRef, { used: false, usedAt: null, usedOrderId: null, usedDiscountAmount: 0, usageRestoredAt: now, usageRestoredReason: "Order cancelled" }, { merge: true });
            }
            const promoUsageRestored = restorePromoCouponUsageInTransaction(tx, db, couponCode, userId, docId, promoCounterSnap, promoUsageSnap, promoCounterRef, promoUsageRef);
            tx.create(db.collection("financial_audit_logs").doc(`cancel_${docId}`), {
              eventType: "pending_order_cancelled",
              userId,
              orderId: docId,
              adminUid,
              adminEmail,
              cashbackRestored,
              pointsRestored,
              promoUsageRestored,
              stockRestored: true,
              createdAt: now
            });
            tx.set(orderRef, { status: "cancelled", cancelledAt: now, cancelledBy: adminUid, cancellationReason: String(body.reason || "Admin cancelled pending order").slice(0, 300), cashbackRestoredAt: cashbackRestored ? now : null, pointsRestoredAt: pointsRestored ? now : null, stockRestoredAt: now, updatedAt: now }, { merge: true });
            return { alreadyCancelled: false, cashbackRestored, pointsRestored, promoUsageRestored, stockRestored: true };
          });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId, ...cancelResult }) };
        }
        if (action === "save_promo") {
          const promo = body.promo;
          if (!promo || !promo.id) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Missing promo data." }) };
          }
          const docId = String(promo.id);
          await db.collection("promos").doc(docId).set({ ...promo, id: docId, updatedAt: Date.now() }, { merge: true });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId }) };
        }
        if (action === "delete_promo") {
          const docId = String(body.id || "");
          if (docId) await db.collection("promos").doc(docId).delete();
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, id: docId }) };
        }
        if (action === "save_store_config") {
          const docId = String(body.docId || "");
          const payload = body.data || {};
          if (!docId) {
            return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: "Missing docId." }) };
          }
          await db.collection("store_config").doc(docId).set({ ...payload, updatedAt: Date.now() }, { merge: true });
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, docId }) };
        }
        return {
          statusCode: 400,
          headers: JSON_HEADERS,
          body: JSON.stringify({ ok: false, error: `Unknown action: ${action}` })
        };
      } catch (err) {
        console.error("store-data error:", err.message);
        return {
          statusCode: 403,
          headers: JSON_HEADERS,
          body: JSON.stringify({
            ok: false,
            error: err.message || "Server store-data operation failed."
          })
        };
      }
    };
    __name(onRequest5, "onRequest");
  }
});

// api/user-session.js
function getBearerToken(request, body) {
  const header = request.headers.get("Authorization") || "";
  return (header.startsWith("Bearer ") ? header.slice(7).trim() : "") || String(body.idToken || "").trim();
}
async function onRequest6(context2) {
  const { request, env: env2 } = context2;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  } });
  if (request.method !== "POST") return jsonResponse(405, { ok: false, error: "Method Not Allowed" });
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (_) {
      body = {};
    }
    const idToken = getBearerToken(request, body);
    if (!idToken) return jsonResponse(401, { ok: false, error: "Missing Firebase ID token." });
    const decoded = await verifyFirebaseIdToken(idToken, env2);
    const uid = decoded.sub;
    const email = normalizeEmail(decoded.email);
    if (!email || !uid) return jsonResponse(401, { ok: false, error: "Firebase account email is unavailable." });
    const role = resolveServerRole(email, env2);
    if (decoded.role !== role && env2.FIREBASE_WEB_API_KEY) {
      await updateFirebaseUser(env2, { localId: uid, customAttributes: JSON.stringify({ role }) }).catch(() => {
      });
    }
    const emailKey = await sha256Hex(email);
    const mapId = emailKey;
    const [mapSnap, userSnap] = await Promise.all([
      getFirestoreDocument(env2, "email_uid_map", mapId),
      getFirestoreDocument(env2, "users", uid)
    ]);
    if (mapSnap.exists && mapSnap.data.uid !== uid) {
      return jsonResponse(409, { ok: false, error: "\u1024 Email \u101E\u100A\u103A \u1021\u1001\u103C\u102C\u1038 UID \u1014\u103E\u1004\u1037\u103A \u1001\u103B\u102D\u1010\u103A\u1006\u1000\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B Support \u1000\u102D\u102F \u1006\u1000\u103A\u101E\u103D\u101A\u103A\u1015\u102B\u104B" });
    }
    const existingEmail = normalizeEmail(userSnap.data.email);
    if (userSnap.exists && existingEmail && existingEmail !== email) {
      return jsonResponse(409, { ok: false, error: "\u1024 UID \u101E\u100A\u103A \u1021\u1001\u103C\u102C\u1038 Email \u1014\u103E\u1004\u1037\u103A \u1001\u103B\u102D\u1010\u103A\u1006\u1000\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B Support \u1000\u102D\u102F \u1006\u1000\u103A\u101E\u103D\u101A\u103A\u1015\u102B\u104B" });
    }
    const now = Date.now();
    const writes = [];
    if (!mapSnap.exists) {
      writes.push(firestoreUpdateWrite("email_uid_map", mapId, {
        email,
        uid,
        createdAt: now,
        migrated: true
      }, { projectId: env2.FIREBASE_PROJECT_ID, exists: false }));
    }
    let profile3 = userSnap.data || {};
    if (body.action === "update_profile") {
      const updatedFields = {
        uid,
        email,
        role,
        name: String(body.name || profile3.name || "").trim(),
        phone: String(body.phone || profile3.phone || "").trim(),
        address: String(body.address || profile3.address || "").trim(),
        updatedAt: now
      };
      writes.push(firestoreUpdateWrite("users", uid, updatedFields, {
        projectId: env2.FIREBASE_PROJECT_ID,
        exists: userSnap.exists,
        fieldPaths: Object.keys(updatedFields)
      }));
      profile3 = { ...profile3, ...updatedFields };
    } else if (!userSnap.exists) {
      const initProfile = {
        uid,
        email,
        emailKey,
        role,
        name: decoded.name || (role === "admin_master" ? "Master Admin" : role === "admin_staff" ? "Staff Member" : email.split("@")[0]),
        emailVerified: !!decoded.email_verified,
        pointsBalance: 0,
        totalPointsEarned: 0,
        createdAt: now,
        updatedAt: now
      };
      writes.push(firestoreUpdateWrite("users", uid, initProfile, {
        projectId: env2.FIREBASE_PROJECT_ID,
        exists: false
      }));
      profile3 = initProfile;
    } else {
      const updates = { uid, email, emailKey, updatedAt: now };
      if (profile3.role !== role) updates.role = role;
      writes.push(firestoreUpdateWrite("users", uid, updates, {
        projectId: env2.FIREBASE_PROJECT_ID,
        exists: true,
        fieldPaths: Object.keys(updates)
      }));
      profile3 = { ...profile3, ...updates };
    }
    if (writes.length) {
      try {
        await commitFirestoreWrites(env2, writes);
      } catch (writeError) {
        if (!mapSnap.exists) {
          const freshMap = await getFirestoreDocument(env2, "email_uid_map", mapId);
          if (!freshMap.exists || freshMap.data.uid !== uid) throw writeError;
          if (writes.length > 1) {
            const remainingWrites = writes.slice(1);
            await commitFirestoreWrites(env2, remainingWrites);
          }
        } else {
          throw writeError;
        }
      }
    }
    return jsonResponse(200, {
      ok: true,
      uid,
      email,
      role,
      name: profile3.name || email.split("@")[0],
      phone: profile3.phone || "",
      address: profile3.address || "",
      pointsBalance: Number(profile3.pointsBalance || 0),
      totalPointsEarned: Number(profile3.totalPointsEarned || 0)
    });
  } catch (error5) {
    console.error("Cloudflare user-session error:", error5);
    return jsonResponse(401, { ok: false, error: error5.message || "Invalid or expired session token." });
  }
}
var init_user_session = __esm({
  "api/user-session.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_firebase_rest();
    __name(getBearerToken, "getBearerToken");
    __name(onRequest6, "onRequest");
  }
});

// api/verify-otp.js
function error4(status, payload) {
  return jsonResponse(status, { ok: false, ...payload });
}
async function onRequest7({ request, env: env2 }) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  } });
  if (request.method !== "POST") return error4(405, { error: "Method Not Allowed" });
  try {
    let body;
    try {
      body = await request.json();
    } catch (_) {
      return error4(400, { error: "Invalid JSON request body." });
    }
    const email = normalizeEmail(body.email);
    const otp = String(body.otp || "").trim();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");
    const purpose = ["reset", "login"].includes(body.purpose) ? body.purpose : "register";
    const action = body.action || (purpose === "register" ? "create_account" : "verify_only");
    if (!isValidEmail(email)) return error4(400, { error: "\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u101E\u1031\u102C Email \u101C\u102D\u1015\u103A\u1005\u102C \u1011\u100A\u1037\u103A\u101E\u103D\u1004\u103A\u1038\u1015\u1031\u1038\u1015\u102B\u101B\u1014\u103A\u104B" });
    if (!/^[0-9]{6}$/.test(otp)) return error4(400, { error: "\u1002\u100F\u1014\u103A\u1038 (\u1046) \u101C\u102F\u1036\u1038\u1015\u102B\u101D\u1004\u103A\u101E\u1031\u102C OTP \u1000\u102F\u1012\u103A\u1000\u102D\u102F \u1021\u1010\u102D\u1021\u1000\u103B \u101B\u102D\u102F\u1000\u103A\u1011\u100A\u1037\u103A\u1015\u1031\u1038\u1015\u102B\u104B" });
    if (purpose === "register" && password !== confirmPassword) return error4(400, { error: "Password \u1014\u103E\u1004\u1037\u103A Confirm Password \u1019\u1010\u1030\u100A\u102E\u1015\u102B\u104B" });
    if ((purpose === "register" || action === "reset_password") && password.length < 6) return error4(400, { error: "Password \u101E\u100A\u103A \u1021\u1014\u100A\u103A\u1038\u1006\u102F\u1036\u1038 (\u1046) \u101C\u102F\u1036\u1038 \u101B\u103E\u102D\u101B\u1015\u102B\u1019\u100A\u103A\u104B" });
    if (!["create_account", "verify_only", "reset_password", "direct_login"].includes(action)) return error4(400, { error: "Invalid OTP action." });
    if (purpose === "register" && action !== "create_account" || purpose === "login" && action !== "verify_only" || purpose === "reset" && !["verify_only", "reset_password", "direct_login"].includes(action)) return error4(400, { error: "OTP purpose and action do not match." });
    const emailKey = otpChallengeId(purpose, await sha256Hex(email));
    const now = Date.now();
    const verification = await runFirestoreTransaction(env2, [{ collection: "otp_challenges", id: emailKey }], async ([snap]) => {
      if (!snap.exists) return { writes: [], result: { error: "not_found" } };
      const challenge2 = snap.data || {};
      if (!challenge2.expiresAt || now > Number(challenge2.expiresAt)) {
        return { writes: [firestoreDeleteWrite("otp_challenges", emailKey, env2.FIREBASE_PROJECT_ID)], result: { error: "expired" } };
      }
      if (challenge2.consumedAt || challenge2.status === "consumed" || challenge2.status === "processing") return { writes: [], result: { error: "consumed" } };
      const currentAttempts = Number(challenge2.attempts || 0);
      const maxAttempts = Number(challenge2.maxAttempts || MAX_OTP_ATTEMPTS);
      if (currentAttempts >= maxAttempts) {
        return { writes: [firestoreDeleteWrite("otp_challenges", emailKey, env2.FIREBASE_PROJECT_ID)], result: { error: "max_attempts" } };
      }
      const computedHash = await hashOtpWithSalt(otp, challenge2.salt, env2);
      if (!constantTimeEqualHex(computedHash, challenge2.otpHash)) {
        const nextAttempts = currentAttempts + 1;
        if (nextAttempts >= maxAttempts) {
          return { writes: [firestoreDeleteWrite("otp_challenges", emailKey, env2.FIREBASE_PROJECT_ID)], result: { error: "max_attempts", remainingAttempts: 0 } };
        }
        return { writes: [firestoreUpdateWrite("otp_challenges", emailKey, { attempts: nextAttempts, lastAttemptAt: now }, { projectId: env2.FIREBASE_PROJECT_ID, fieldPaths: ["attempts", "lastAttemptAt"] })], result: { error: "invalid", remainingAttempts: maxAttempts - nextAttempts } };
      }
      if (purpose === "reset" && action === "verify_only") {
        return { writes: [firestoreUpdateWrite("otp_challenges", emailKey, { verified: true, verifiedAt: now, status: "verified" }, { projectId: env2.FIREBASE_PROJECT_ID, fieldPaths: ["verified", "verifiedAt", "status"] })], result: { ok: true, challenge: challenge2 } };
      }
      if (purpose === "reset" && (action === "reset_password" || action === "direct_login") && challenge2.verified !== true) {
        return { writes: [], result: { error: "not_verified" } };
      }
      return { writes: [firestoreUpdateWrite("otp_challenges", emailKey, { status: "processing", consumedAt: now, consumedBy: "verify-otp" }, { projectId: env2.FIREBASE_PROJECT_ID, fieldPaths: ["status", "consumedAt", "consumedBy"] })], result: { ok: true, challenge: challenge2 } };
    });
    if (verification.error === "not_found" || verification.error === "consumed") return error4(400, { code: "OTP_NOT_FOUND", error: "OTP \u1000\u102F\u1012\u103A \u1019\u1010\u103D\u1031\u1037\u101B\u103E\u102D\u1015\u102B \u101E\u102D\u102F\u1037\u1019\u101F\u102F\u1010\u103A \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1015\u103C\u102E\u1038\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B \u1000\u102F\u1012\u103A\u1021\u101E\u1005\u103A \u1015\u103C\u1014\u103A\u1010\u1031\u102C\u1004\u103A\u1038\u1015\u102B\u104B" });
    if (verification.error === "expired") return error4(400, { code: "OTP_EXPIRED", error: "OTP \u1000\u102F\u1012\u103A \u101E\u1000\u103A\u1010\u1019\u103A\u1038 (\u1041\u1045 \u1019\u102D\u1014\u1005\u103A) \u1000\u102F\u1014\u103A\u1006\u102F\u1036\u1038\u101E\u103D\u102C\u1038\u1015\u102B\u1015\u103C\u102E\u104B \u1000\u102F\u1012\u103A\u1021\u101E\u1005\u103A \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1010\u1031\u102C\u1004\u103A\u1038\u1006\u102D\u102F\u1015\u102B\u104B" });
    if (verification.error === "max_attempts") return error4(429, { code: "MAX_ATTEMPTS_EXCEEDED", remainingAttempts: 0, error: "OTP \u1000\u102F\u1012\u103A \u1019\u103E\u102C\u1038\u101A\u103D\u1004\u103A\u1038\u1019\u103E\u102F (\u1045) \u1000\u103C\u102D\u1019\u103A \u1015\u103C\u100A\u1037\u103A\u101E\u103D\u102C\u1038\u1015\u102B\u1015\u103C\u102E\u104B \u101C\u102F\u1036\u1001\u103C\u102F\u1036\u101B\u1031\u1038\u1021\u101B \u1000\u102F\u1012\u103A\u1021\u101E\u1005\u103A \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1010\u1031\u102C\u1004\u103A\u1038\u1006\u102D\u102F\u1015\u102B\u104B" });
    if (verification.error === "invalid") return error4(400, { code: "INVALID_OTP", remainingAttempts: verification.remainingAttempts, error: `\u1011\u100A\u1037\u103A\u101E\u103D\u1004\u103A\u1038\u1011\u102C\u1038\u101E\u1031\u102C OTP \u1000\u102F\u1012\u103A \u1019\u103E\u102C\u1038\u101A\u103D\u1004\u103A\u1038\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104B (\u1011\u1015\u103A\u1019\u1036\u1000\u103C\u102D\u102F\u1038\u1005\u102C\u1038\u1001\u103D\u1004\u1037\u103A ${verification.remainingAttempts} \u1000\u103C\u102D\u1019\u103A \u1000\u103B\u1014\u103A\u1015\u102B\u101E\u100A\u103A)` });
    if (verification.error === "not_verified") return error4(400, { code: "OTP_NOT_VERIFIED", error: "Password \u1015\u103C\u1031\u102C\u1004\u103A\u1038\u101B\u1014\u103A OTP \u1000\u102D\u102F \u1021\u101B\u1004\u103A\u1021\u1010\u100A\u103A\u1015\u103C\u102F\u1015\u1031\u1038\u1015\u102B\u104B" });
    const challenge = verification.challenge || {};
    if (purpose === "login") {
      const user = await lookupFirebaseUserByEmail(env2, email);
      if (!user) {
        await deleteChallenge(env2, emailKey);
        return error4(404, { code: "USER_NOT_FOUND", error: "\u1024 Email \u1016\u103C\u1004\u1037\u103A \u1021\u1000\u1031\u102C\u1004\u1037\u103A\u1019\u1010\u103D\u1031\u1037\u1015\u102B\u104B" });
      }
      await deleteChallenge(env2, emailKey);
      return jsonResponse(200, { ok: true, verified: true, email, uid: user.localId, message: "Email OTP \u1021\u1010\u100A\u103A\u1015\u103C\u102F\u1001\u103C\u1004\u103A\u1038 \u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B Password \u1006\u1000\u103A\u101C\u1000\u103A\u1011\u100A\u1037\u103A\u101E\u103D\u1004\u103A\u1038\u1015\u102B\u104B" });
    }
    if (purpose === "reset" && action === "verify_only") {
      return jsonResponse(200, { ok: true, verified: true, email, message: "OTP \u1000\u102F\u1012\u103A \u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u101E\u100A\u103A! Password \u1021\u101E\u1005\u103A\u1015\u1031\u1038\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u1015\u103C\u102E\u104B" });
    }
    if (purpose === "reset") {
      const user = await lookupFirebaseUserByEmail(env2, email);
      if (!user) {
        await deleteChallenge(env2, emailKey);
        return error4(404, { code: "USER_NOT_FOUND", error: "\u1024 Email \u1016\u103C\u1004\u1037\u103A \u1021\u1000\u1031\u102C\u1004\u1037\u103A\u1019\u1010\u103D\u1031\u1037\u1015\u102B\u104B" });
      }
      const role2 = resolveServerRole(email, env2);
      if (action === "reset_password") {
        await updateFirebaseUser(env2, { localId: user.localId, password, emailVerified: true, customAttributes: JSON.stringify({ role: role2 }) });
      } else {
        await updateFirebaseUser(env2, { localId: user.localId, emailVerified: true, customAttributes: JSON.stringify({ role: role2 }) });
      }
      await upsertUserProfile(env2, user.localId, email, role2, now, user.displayName || email.split("@")[0]);
      await deleteChallenge(env2, emailKey);
      const customToken2 = await createFirebaseCustomToken(env2, user.localId, { role: role2 });
      return jsonResponse(200, {
        ok: true,
        uid: user.localId,
        email,
        role: role2,
        customToken: customToken2,
        message: action === "reset_password" ? "Password \u1021\u101E\u1005\u103A\u1015\u103C\u1031\u102C\u1004\u103A\u1038\u101C\u1032\u1015\u103C\u102E\u1038 \u1021\u1000\u1031\u102C\u1004\u1037\u103A\u101D\u1004\u103A\u101B\u1031\u102C\u1000\u103A\u1015\u102B\u1015\u103C\u102E!" : "OTP \u1000\u102F\u1012\u103A\u1016\u103C\u1004\u1037\u103A \u1021\u1000\u1031\u102C\u1004\u1037\u103A\u101D\u1004\u103A\u101B\u1031\u102C\u1000\u103A\u1001\u103C\u1004\u103A\u1038 \u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u1015\u102B\u101E\u100A\u103A!"
      });
    }
    const existingUser = await lookupFirebaseUserByEmail(env2, email);
    if (existingUser) {
      await deleteChallenge(env2, emailKey);
      return error4(409, { code: "EMAIL_EXISTS", error: "\u1024 Email \u1016\u103C\u1004\u1037\u103A \u1021\u1000\u1031\u102C\u1004\u1037\u103A\u101B\u103E\u102D\u1015\u103C\u102E\u1038\u101E\u102C\u1038\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B Login \u101D\u1004\u103A\u1015\u102B\u104B" });
    }
    const role = resolveServerRole(email, env2);
    const name = role === "admin_master" ? "Master Admin" : role === "admin_staff" ? "Staff Member" : email.split("@")[0];
    const created = await createFirebaseUser(env2, {
      email,
      password,
      emailVerified: true,
      displayName: name,
      customAttributes: JSON.stringify({ role })
    });
    const uid = created.localId;
    const emailHash = await sha256Hex(email);
    try {
      await runFirestoreTransaction(env2, [
        { collection: "email_uid_map", id: emailHash },
        { collection: "users", id: uid }
      ], ([mapSnap, userSnap]) => {
        if (mapSnap.exists && mapSnap.data.uid !== uid) throw new Error("\u1024 Email \u101E\u100A\u103A \u1021\u1001\u103C\u102C\u1038 UID \u1010\u1005\u103A\u1001\u102F\u1014\u103E\u1004\u1037\u103A \u1001\u103B\u102D\u1010\u103A\u1006\u1000\u103A\u1015\u103C\u102E\u1038\u101E\u102C\u1038\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
        if (userSnap.exists && normalizeEmail(userSnap.data.email) !== email) throw new Error("\u1024 UID \u101E\u100A\u103A \u1021\u1001\u103C\u102C\u1038 Email \u1010\u1005\u103A\u1001\u102F\u1014\u103E\u1004\u1037\u103A \u1001\u103B\u102D\u1010\u103A\u1006\u1000\u103A\u1015\u103C\u102E\u1038\u101E\u102C\u1038\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B");
        const writes = [];
        if (!mapSnap.exists) writes.push(firestoreUpdateWrite("email_uid_map", emailHash, { email, uid, createdAt: now }, { projectId: env2.FIREBASE_PROJECT_ID, exists: false }));
        const profile3 = { uid, email, emailKey: emailHash, name, role, emailVerified: true, createdAt: now, updatedAt: now };
        writes.push(firestoreUpdateWrite("users", uid, profile3, { projectId: env2.FIREBASE_PROJECT_ID, exists: userSnap.exists }));
        return { writes, result: true };
      });
    } catch (mappingError) {
      await deleteFirebaseUser(env2, uid).catch((cleanupError) => console.error("Cloudflare user cleanup failed:", cleanupError));
      throw mappingError;
    }
    await deleteChallenge(env2, emailKey);
    const customToken = await createFirebaseCustomToken(env2, uid, { role });
    return jsonResponse(200, { ok: true, uid, email, name, role, customToken, message: "OTP \u1021\u1010\u100A\u103A\u1015\u103C\u102F\u1015\u103C\u102E\u1038 Firebase \u1021\u1000\u1031\u102C\u1004\u1037\u103A\u1021\u101E\u1005\u103A\u1016\u103D\u1004\u1037\u103A\u1001\u103C\u1004\u103A\u1038 \u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u1015\u102B\u101E\u100A\u103A!" });
  } catch (err) {
    console.error("Cloudflare verify-otp error:", err);
    if (err.authCode && /EMAIL_EXISTS/.test(err.authCode)) return error4(409, { code: "EMAIL_EXISTS", error: "\u1024 Email \u1016\u103C\u1004\u1037\u103A \u1021\u1000\u1031\u102C\u1004\u1037\u103A\u101B\u103E\u102D\u1015\u103C\u102E\u1038\u101E\u102C\u1038\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B Login \u101D\u1004\u103A\u1015\u102B\u104B" });
    return error4(500, { error: err.message || "OTP \u1021\u1010\u100A\u103A\u1015\u103C\u102F\u101B\u102C\u1010\u103D\u1004\u103A Server \u1021\u1019\u103E\u102C\u1038\u1021\u101A\u103D\u1004\u103A\u1038 \u1016\u103C\u1005\u103A\u1015\u1031\u102B\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104B" });
  }
}
async function deleteChallenge(env2, emailKey) {
  await runFirestoreTransaction(env2, [{ collection: "otp_challenges", id: emailKey }], ([snap]) => ({
    writes: snap.exists ? [firestoreDeleteWrite("otp_challenges", emailKey, env2.FIREBASE_PROJECT_ID)] : [],
    result: null
  }));
}
async function upsertUserProfile(env2, uid, email, role, now, name) {
  await runFirestoreTransaction(env2, [{ collection: "users", id: uid }], ([snap]) => {
    const data = { uid, email, role, emailVerified: true, updatedAt: now };
    if (!snap.exists) Object.assign(data, { name, pointsBalance: 0, totalPointsEarned: 0, createdAt: now });
    return { writes: [firestoreUpdateWrite("users", uid, data, { projectId: env2.FIREBASE_PROJECT_ID, fieldPaths: Object.keys(data), exists: snap.exists })], result: null };
  });
}
var init_verify_otp = __esm({
  "api/verify-otp.js"() {
    init_functionsRoutes_0_7049827584872329();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_firebase_rest();
    init_otp();
    __name(error4, "error");
    __name(onRequest7, "onRequest");
    __name(deleteChallenge, "deleteChallenge");
    __name(upsertUserProfile, "upsertUserProfile");
  }
});

// ../.wrangler/tmp/pages-ZHOPP3/functionsRoutes-0.7049827584872329.mjs
var routes;
var init_functionsRoutes_0_7049827584872329 = __esm({
  "../.wrangler/tmp/pages-ZHOPP3/functionsRoutes-0.7049827584872329.mjs"() {
    init_chat_data();
    init_imagekit_auth();
    init_imagekit_upload();
    init_send_otp();
    init_store_data();
    init_user_session();
    init_verify_otp();
    routes = [
      {
        routePath: "/api/chat-data",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/api/imagekit-auth",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/imagekit-upload",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/api/send-otp",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest4]
      },
      {
        routePath: "/api/store-data",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest5]
      },
      {
        routePath: "/api/user-session",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest6]
      },
      {
        routePath: "/api/verify-otp",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest7]
      }
    ];
  }
});

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_7049827584872329();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_7049827584872329();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../home/codespace/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function getOriginalPathPrefix(requestPath, normalizedPrefix) {
  let end = 0;
  for (let index = 0; index < normalizedPrefix.length; index++) {
    end++;
    if (normalizedPrefix[index] === "/") {
      while (requestPath[end] === "/") {
        end++;
      }
    }
  }
  return requestPath.slice(0, end);
}
__name(getOriginalPathPrefix, "getOriginalPathPrefix");
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  const normalizedRequestPath = requestPath.replace(/\/+/g, "/");
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath) || routeMatcher(normalizedRequestPath);
    const originalMountMatch = mountMatcher(requestPath);
    const mountMatchResult = originalMountMatch || mountMatcher(normalizedRequestPath);
    if (matchResult && mountMatchResult) {
      const path = originalMountMatch ? originalMountMatch.path : getOriginalPathPrefix(requestPath, mountMatchResult.path);
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error5) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error5;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
