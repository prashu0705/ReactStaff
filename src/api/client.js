const BASE = 'http://localhost:8000'

async function request(path, options = {}) {
  const url = `${BASE}${path}`
  let res
  try {
    res = await fetch(url, options)
  } catch (err) {
    const e = new Error('Network error')
    e.cause = err
    throw e
  }

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch (e) {
    data = text
  }

  if (!res.ok) {
    const err = new Error(data && data.message ? data.message : res.statusText || 'HTTP error')
    err.status = res.status
    err.body = data
    throw err
  }

  return data
}

function jsonOptions(body) {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}

export async function getCandidates() {
  return request('/candidates')
}

export async function addCandidate(profile) {
  return request('/candidates', { method: 'POST', ...jsonOptions(profile) })
}

export async function deleteCandidate(id) {
  if (!id) throw new Error('deleteCandidate requires an id')
  return request(`/candidates/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getProjects() {
  return request('/projects')
}

export async function addProject(profile) {
  return request('/projects', { method: 'POST', ...jsonOptions(profile) })
}

export async function composeTeam(project_id) {
  if (!project_id) throw new Error('composeTeam requires project_id')
  return request('/compose', { method: 'POST', ...jsonOptions({ project_id }) })
}

export async function auditTeam(project_id, team_ids) {
  if (!project_id) throw new Error('auditTeam requires project_id')
  if (!Array.isArray(team_ids)) throw new Error('auditTeam requires team_ids array')
  return request('/audit', { method: 'POST', ...jsonOptions({ project_id, team_ids }) })
}
