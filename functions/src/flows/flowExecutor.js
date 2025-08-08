const { getFirestore, FieldValue } = require('firebase-admin/firestore');

async function executeFlow({ flowMap, event, context, onYield }) {
  const graph = indexGraph(flowMap);
  const starts = findStartNodes(graph, event);
  let exec = { contact: context.contact || {}, vars: context.vars || {}, meta: context.meta || {} };

  for (const start of starts) {
    await runFromNode(graph, start.id, exec, onYield);
  }
  return exec;
}

async function runFromNode(graph, nodeId, exec, onYield) {
  let current = nodeId;
  while (current) {
    const node = graph.nodesById[current];
    if (!node) break;
    const outcome = await evaluateNode(graph, node, exec, onYield);
    if (!outcome) break;
    const nextEdge = (graph.outEdges[current] || []).find(e => (outcome.handle ? e.sourceHandle === outcome.handle : true));
    current = nextEdge ? nextEdge.target : null;
  }
}

async function evaluateNode(graph, node, exec, onYield) {
  const cfg = node.data?.config || {};
  switch (node.type) {
    case 'action:apiRequest':
      return await doApiRequest(cfg, exec);
    case 'logic:branch':
      return doBranch(cfg, exec);
    case 'logic:delay':
      return await doDelay(cfg, node.id, exec, onYield);
    case 'action:setVariable':
      return doSetVariable(cfg, exec);
    case 'action:sendMessage':
      return await doSendMessage(cfg, exec);
    case 'logic:humanTakeover':
      return await doHumanTakeover(cfg, exec);
    default:
      return { handle: 'out' };
  }
}

async function doApiRequest(cfg, exec) {
  const method = (cfg.method || 'GET').toUpperCase();
  const url = applyVars(cfg.url, exec);
  const headers = kvToObject(cfg.headers, exec);
  const query = kvToObject(cfg.query, exec);
  const u = new URL(url);
  Object.entries(query).forEach(([k, v]) => u.searchParams.set(k, String(v)));
  let body;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && cfg.body) {
    body = applyVars(cfg.body, exec);
    headers['content-type'] = headers['content-type'] || 'application/json';
  }
  const resp = await fetch(u.toString(), { method, headers, body, signal: AbortSignal.timeout(Number(cfg.timeoutMs || 15000)) });
  const ct = resp.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await resp.json() : await resp.text();
  (cfg.mapResponse || []).forEach(({ from, to }) => setPath(exec, to, getPath({ data, response: data }, from)));
  return { handle: 'out' };
}

function doBranch(cfg, exec) {
  const modeAny = (cfg.mode || 'ALL') === 'ANY';
  const conditions = Array.isArray(cfg.conditions) ? cfg.conditions : [];
  const evalOne = (c) => {
    const left = getPath(exec, c.left);
    const right = tryParse(applyVars(String(c.right ?? ''), exec));
    switch (c.op) {
      case 'EQUALS': return String(left) === String(right);
      case 'CONTAINS': return String(left || '').includes(String(right || ''));
      case 'STARTS_WITH': return String(left || '').startsWith(String(right || ''));
      case 'GT': return Number(left) > Number(right);
      case 'EXISTS': return left !== undefined && left !== null && left !== '';
      default: return false;
    }
  };
  const results = conditions.map(evalOne);
  const ok = modeAny ? results.some(Boolean) : results.every(Boolean);
  return { handle: ok ? 'true' : 'false' };
}

async function doDelay(cfg, nodeId, exec, onYield) {
  const ms = Number(cfg.ms || 0) * unitToMs(cfg.unit || 'seconds');
  const resumeAt = Date.now() + ms;
  if (onYield) await onYield({ type: 'DELAY', nodeId, resumeAt, context: exec });
  return null;
}

function unitToMs(unit) {
  return unit === 'minutes' ? 60000 : unit === 'hours' ? 3600000 : unit === 'days' ? 86400000 : 1000;
}

function doSetVariable(cfg, exec) {
  if (cfg.scope === 'contact') setPath(exec, `contact.${cfg.name}`, applyVars(String(cfg.value || ''), exec));
  else setPath(exec, `vars.${cfg.name}`, applyVars(String(cfg.value || ''), exec));
  return { handle: 'out' };
}

async function doSendMessage(cfg, exec) {
  const db = getFirestore();
  const waId = exec.contact.wa_id;
  if (!waId) return { handle: 'out' };
  const msg = {
    direction: 'outgoing', type: (cfg.type || 'text'),
    text: applyVars(cfg.text || '', exec),
    timestamp: FieldValue.serverTimestamp(),
  };
  await db.collection('conversations').doc(waId).collection('messages').add(msg);
  await db.collection('conversations').doc(waId).set({ updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { handle: 'out' };
}

async function doHumanTakeover(cfg, exec) {
  const db = getFirestore();
  const waId = exec.contact.wa_id;
  if (!waId) return { handle: 'out' };
  await db.collection('conversations').doc(waId).set({ status: 'human_takeover', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { handle: 'out' };
}

function indexGraph(flowMap) {
  const nodesById = {}; const outEdges = {}; const inEdges = {};
  (flowMap.nodes || []).forEach(n => { nodesById[n.id] = n; outEdges[n.id] = []; inEdges[n.id] = []; });
  (flowMap.edges || []).forEach(e => { (outEdges[e.source] || []).push(e); (inEdges[e.target] || []).push(e); });
  return { nodesById, outEdges, inEdges };
}
function findStartNodes(graph, event) {
  return Object.values(graph.nodesById).filter(n => (graph.inEdges[n.id] || []).length === 0);
}
function kvToObject(kv = [], exec) {
  const obj = {};
  (Array.isArray(kv) ? kv : []).forEach(({ key, value }) => { if (key) obj[String(key).toLowerCase()] = applyVars(String(value || ''), exec); });
  return obj;
}
function applyVars(template, exec) {
  if (!template || typeof template !== 'string') return template;
  return template.replace(/\{\{([^}]+)}}/g, (_, g) => {
    const path = g.trim();
    const v = getPath(exec, path);
    return v == null ? '' : String(v);
  });
}
function getPath(root, path) {
  try { return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), root); }
  catch { return undefined; }
}
function setPath(root, path, value) {
  if (!path) return;
  const parts = path.split('.');
  let obj = root;
  for (let i = 0; i < parts.length - 1; i++) { obj[parts[i]] = obj[parts[i]] ?? {}; obj = obj[parts[i]]; }
  obj[parts[parts.length - 1]] = value;
}
function tryParse(s) { try { return JSON.parse(s); } catch { return s; } }

module.exports = { executeFlow };





