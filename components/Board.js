"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  STATUS_META,
  STATUS_VALUES,
  STORY_TYPE_META,
  STORY_GROUP_META,
  PRIORITY_META,
  storyGroup,
} from "@/lib/constants";
import { Avatar, Badge } from "@/components/ui";
import { Ban, CalendarClock } from "@/components/icons";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function formatDue(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return `${d} ${MONTHS[Number(m) - 1]}`;
}

export default function Board({ stories, teams = [], onMove, onOpen }) {
  const teamsById = {};
  teams.forEach((t) => (teamsById[t.id] = t));

  // Agrupa las historias por estado y las ordena por "order".
  const columns = {};
  STATUS_VALUES.forEach((s) => (columns[s] = []));
  stories.forEach((s) => {
    if (!columns[s.status]) columns[s.status] = [];
    columns[s.status].push(s);
  });
  Object.values(columns).forEach((list) =>
    list.sort((a, b) => a.order - b.order)
  );

  function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    onMove(draggableId, destination.droppableId, destination.index);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="thin-scroll flex snap-x gap-4 overflow-x-auto pb-3">
        {STATUS_VALUES.map((status) => {
          const meta = STATUS_META[status];
          const list = columns[status] || [];
          return (
            <div
              key={status}
              className="flex min-w-[80vw] flex-1 snap-start flex-col sm:min-w-[19rem] xl:min-w-0"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: meta.color }}
                  />
                  <span className="text-sm font-bold text-ink">{meta.label}</span>
                </div>
                <span className="rounded-full bg-paper-2 px-2 py-0.5 text-xs font-semibold text-ink/55">
                  {list.length}
                </span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`thin-scroll min-h-32 flex-1 space-y-2 rounded-xl2 border border-line p-2 transition ${
                      snapshot.isDraggingOver ? "bg-paper-2" : "bg-paper-2/40"
                    }`}
                  >
                    {list.map((story, index) => (
                      <Draggable key={story.id} draggableId={story.id} index={index}>
                        {(p, snap) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            onClick={() => onOpen(story)}
                            style={{
                              // Conserva el style de la librería (transform de arrastre)
                              // y le suma nuestra franja de color de equipo.
                              ...p.draggableProps.style,
                              borderLeftWidth: 4,
                              borderLeftColor:
                                (story.team && teamsById[story.team]?.color) || "#CBD5E1",
                            }}
                            className={`cursor-grab rounded-xl border border-line bg-white p-3 shadow-sm transition active:cursor-grabbing ${
                              snap.isDragging ? "shadow-lift ring-2 ring-pine/30" : "hover:shadow-card"
                            }`}
                          >
                            <StoryCardBody story={story} team={teamsById[story.team]} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {list.length === 0 && !snapshot.isDraggingOver && (
                      <p className="px-1 py-3 text-center text-xs text-ink/35">
                        Arrastra tarjetas aquí
                      </p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

function StoryCardBody({ story, team }) {
  const type = STORY_TYPE_META[story.type] || STORY_TYPE_META.otro;
  const group = STORY_GROUP_META[storyGroup(story.type)];
  const prio = PRIORITY_META[story.priority];
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {story.code && (
            <span className="font-mono text-[11px] font-bold text-ink/45">
              {story.code}
            </span>
          )}
          <Badge color={group.color} soft={false}>
            {group.label}
          </Badge>
          <Badge color={type.color}>{type.label}</Badge>
        </div>
        {story.points > 0 && (
          <span className="rounded-md bg-paper-2 px-1.5 py-0.5 text-[11px] font-bold text-ink/60">
            {story.points}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-sm font-semibold leading-snug text-ink">
        {story.title}
      </p>

      {story.status === "blocked" && story.blockedReason && (
        <p className="mt-1 flex items-center gap-1 rounded bg-clay/10 px-2 py-1 text-[11px] font-medium text-clay">
          <Ban size={12} /> {story.blockedReason}
        </p>
      )}

      {story.dueDate && (
        (() => {
          const due = String(story.dueDate).slice(0, 10);
          const overdue =
            story.status !== "done" && due < new Date().toLocaleDateString("en-CA");
          return (
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                overdue ? "bg-[#DC2626]/10 text-[#DC2626]" : "bg-paper-2 text-ink/60"
              }`}
              title={overdue ? "Vencida" : "Fecha de vencimiento"}
            >
              <CalendarClock size={12} /> {formatDue(story.dueDate)}
            </span>
          );
        })()
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-8 rounded-full"
            style={{ background: prio?.color || "#ccc" }}
            title={`Prioridad ${prio?.label}`}
          />
          {team && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-ink/45"
              title={team.name}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: team.color }}
              />
              {team.name}
            </span>
          )}
        </div>
        {story.assignee ? (
          <Avatar
            name={story.assignee.name}
            color={story.assignee.avatarColor}
            size={24}
          />
        ) : (
          <span className="text-[11px] text-ink/35">Sin asignar</span>
        )}
      </div>
    </>
  );
}
