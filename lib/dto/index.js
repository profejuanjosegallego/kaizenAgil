/**
 * DTOs / mappers: convierten documentos de Mongoose en objetos planos
 * y seguros para enviar al cliente (sin passwordHash, con id en string).
 */
function id(doc) {
  if (!doc) return null;
  if (doc._id) return String(doc._id);
  return String(doc);
}

export function toUserDTO(u) {
  if (!u) return null;
  return {
    id: id(u),
    name: u.name,
    email: u.email,
    role: u.role,
    avatarColor: u.avatarColor,
    approved: u.approved,
    superAdmin: u.superAdmin || false,
  };
}

export function toProjectDTO(p) {
  if (!p) return null;
  return {
    id: id(p),
    name: p.name,
    slug: p.slug,
    description: p.description,
    objectives: p.objectives || [],
    color: p.color,
    owner: p.owner && p.owner.name ? toUserDTO(p.owner) : id(p.owner),
    archived: p.archived,
    createdAt: p.createdAt,
  };
}

export function toTeamDTO(t) {
  if (!t) return null;
  return {
    id: id(t),
    project: id(t.project),
    name: t.name,
    moduleName: t.moduleName,
    description: t.description,
    color: t.color,
  };
}

export function toMembershipDTO(m) {
  if (!m) return null;
  return {
    id: id(m),
    project: id(m.project),
    user: m.user && m.user.name ? toUserDTO(m.user) : id(m.user),
    team: m.team ? id(m.team) : null,
    scrumMaster: m.scrumMaster || false,
  };
}

export function toStoryDTO(s) {
  if (!s) return null;
  return {
    id: id(s),
    project: id(s.project),
    team: s.team ? id(s.team) : null,
    assignee: s.assignee && s.assignee.name ? toUserDTO(s.assignee) : (s.assignee ? id(s.assignee) : null),
    code: s.code,
    title: s.title,
    description: s.description,
    acceptanceCriteria: s.acceptanceCriteria || [],
    type: s.type,
    status: s.status,
    priority: s.priority,
    points: s.points,
    order: s.order,
    blockedReason: s.blockedReason,
    dueDate: s.dueDate,
    completedAt: s.completedAt,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export const toList = (mapper) => (arr) => (arr || []).map(mapper);
