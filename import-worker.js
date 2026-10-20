const LIMITS = Object.freeze({
  archiveBytes: 100 * 1024 * 1024, totalExpandedBytes: 120 * 1024 * 1024,
  jsonFileBytes: 25 * 1024 * 1024, totalJsonBytes: 80 * 1024 * 1024,
  archiveEntries: 10000, archiveFiles: 2000, manualJsonFiles: 50
});
const ARCHIVE_ENTRY_PATTERN = /(?:^|\/)(?:followers(?:_\d+)?|following(?:_\d+)?|pending_follow_requests(?:_sent)?|recent_follow_requests|recently_unfollowed_(?:profiles|accounts))\.json$/i;
function fail(code, name) {
  const error = new Error(code); error.code = code; if (name) error.name = name; throw error;
}
function isTargetJson(name) { return ARCHIVE_ENTRY_PATTERN.test(String(name).replace(/\\/g, "/")); }
function inspectZip(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length > LIMITS.archiveBytes) fail("zipTooLarge");
  if (bytes.length < 22) fail("zipInvalid");
  const view = new DataView(buffer);
  const searchStart = Math.max(0, bytes.length - 22 - 65535);
  let eocd = -1;
  for (let offset = bytes.length - 22; offset >= searchStart; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50 && offset + 22 + view.getUint16(offset + 20, true) === bytes.length) { eocd = offset; break; }
  }
  if (eocd < 0) fail("zipInvalid");
  const disk = view.getUint16(eocd + 4, true), centralDisk = view.getUint16(eocd + 6, true);
  const entriesOnDisk = view.getUint16(eocd + 8, true), entryCount = view.getUint16(eocd + 10, true);
  const centralSize = view.getUint32(eocd + 12, true), centralOffset = view.getUint32(eocd + 16, true);
  if (disk !== 0 || centralDisk !== 0 || entriesOnDisk !== entryCount || entryCount === 0xffff
    || centralSize === 0xffffffff || centralOffset === 0xffffffff) fail("zipInvalid");
  if (entryCount > LIMITS.archiveEntries) fail("tooManyEntries");
  if (centralOffset + centralSize > eocd) fail("zipInvalid");
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let cursor = centralOffset, totalExpanded = 0, totalJson = 0, fileCount = 0;
  const targets = [];
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > centralOffset + centralSize || view.getUint32(cursor, true) !== 0x02014b50) fail("zipInvalid");
    const flags = view.getUint16(cursor + 8, true), method = view.getUint16(cursor + 10, true);
    const compressed = view.getUint32(cursor + 20, true), expanded = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true), extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true), localOffset = view.getUint32(cursor + 42, true);
    const recordLength = 46 + nameLength + extraLength + commentLength;
    if (cursor + recordLength > centralOffset + centralSize || localOffset >= centralOffset
      || compressed === 0xffffffff || expanded === 0xffffffff || localOffset === 0xffffffff) fail("zipInvalid");
    const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength)).replace(/\\/g, "/");
    if (!name.endsWith("/")) fileCount += 1;
    totalExpanded += expanded;
    if (totalExpanded > LIMITS.totalExpandedBytes) fail("zipExpandedTooLarge");
    if (name.toLowerCase().endsWith(".json")) {
      if (expanded > LIMITS.jsonFileBytes) fail("jsonTooLarge");
      totalJson += expanded;
      if (totalJson > LIMITS.totalJsonBytes) fail("totalJsonTooLarge");
    }
    if (isTargetJson(name)) {
      if (flags & 1 || (method !== 0 && method !== 8)) fail("zipInvalid");
      targets.push(name);
    }
    cursor += recordLength;
  }
  if (cursor !== centralOffset + centralSize) fail("zipInvalid");
  if (fileCount > LIMITS.archiveFiles) fail("tooManyArchiveFiles");
  if (!targets.length) fail("zipNoFiles");
  return { bytes, targets: new Set(targets) };
}
function parseJsonText(text, name) {
  try { return JSON.parse(text); } catch { fail("invalidJson", name); }
}
function handleMessage(message) {
  if (message.type === "json") {
    const entries = message.files || [];
    if (!entries.length || entries.length > LIMITS.manualJsonFiles) fail("tooManyFiles");
    let total = 0;
    const files = entries.map((entry) => {
      const bytes = new Uint8Array(entry.buffer);
      total += bytes.byteLength;
      if (bytes.byteLength > LIMITS.jsonFileBytes) fail("jsonTooLarge");
      if (total > LIMITS.totalJsonBytes) fail("totalJsonTooLarge");
      let text;
      try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
      catch { fail("invalidJson", entry.name); }
      return { name: entry.name, data: parseJsonText(text, entry.name) };
    });
    return { files };
  }
  if (message.type === "zip") {
    const { bytes, targets } = inspectZip(message.buffer);
    if (!self.fflate) fail("workerUnavailable");
    let entries;
    try { entries = self.fflate.unzipSync(bytes, { filter: (entry) => targets.has(String(entry.name).replace(/\\/g, "/")) }); }
    catch { fail("zipInvalid"); }
    const files = [];
    Object.keys(entries).forEach((path) => {
      const normalized = path.replace(/\\/g, "/");
      if (!isTargetJson(normalized)) return;
      const name = normalized.split("/").pop();
      files.push({ name, data: parseJsonText(self.fflate.strFromU8(entries[path]), name) });
    });
    if (!files.length) fail("zipNoFiles");
    return { files };
  }
  fail("zipInvalid");
}
if (typeof module !== "undefined" && module.exports) module.exports = { LIMITS, inspectZip, parseJsonText, handleMessage };
if (typeof self !== "undefined" && typeof importScripts === "function") {
  try { importScripts("./vendor/fflate.js"); } catch { self.postMessage({ ok: false, code: "workerUnavailable" }); }
  self.onmessage = (event) => {
    try { self.postMessage({ ok: true, ...handleMessage(event.data) }); }
    catch (error) { self.postMessage({ ok: false, code: error?.code || "zipInvalid", name: error?.name || "" }); }
  };
}
