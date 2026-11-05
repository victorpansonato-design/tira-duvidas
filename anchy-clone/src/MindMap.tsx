import { useContext, useEffect, useRef, useState } from "react";
import {
  Background,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import type { Node, NodeProps, Edge } from "@xyflow/react";
import { toPng } from "html-to-image";
import {
  Download,
  FileText,
  Maximize,
  Minimize,
  Minus,
  Plus,
  Scan,
  Share2,
  X,
  MoreHorizontal,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { mapTopics } from "./demo";
import { sources } from "./Notebook";
import { Ask, discipline, focus, Owl, Primary, ThemeContext } from "./ui";
import type { Tool } from "./ui";
import { StudyLoading, ToolPanel } from "./StudyTools";

type Props = {
  active: Tool | null;
  onBack: () => void;
  chatOpen: boolean;
  onChat: () => void;
  onAsk: (text: string) => void;
};
type MapNode = Node<
  {
    title: string;
    color: string;
    root?: boolean;
    expanded?: boolean;
    height?: number;
    selected?: boolean;
    expand?: () => void;
    select: () => void;
  },
  "topic"
>;
function TopicNode({ data }: NodeProps<MapNode>) {
  if (data.root)
    return (
      <>
        <button
          type="button"
          onClick={data.select}
          style={{ minHeight: 96 }}
          className={
            "nodrag w-full flex flex-col justify-center rounded-2xl bg-anchy-blue px-4 py-3 text-left text-on-blue select-none cursor-pointer " +
            focus
          }
        >
          <span className="text-sm font-bold leading-tight">{discipline}</span>
          <span className="mt-1 text-xs leading-tight opacity-85">
            Mapa mental · UniAnchieta
          </span>
        </button>
        <Handle
          type="source"
          position={Position.Right}
          style={{ opacity: 0 }}
        />
      </>
    );
  return (
    <div
      className="relative"
      style={{ width: 180, minHeight: data.height || 62 }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <button
        type="button"
        aria-pressed={data.selected}
        onClick={data.select}
        className={
          "nodrag relative w-full overflow-hidden flex items-center rounded-[14px] bg-surface pl-[18px] pr-[26px] py-1.5 text-left cursor-pointer transition-colors " +
          (data.selected
            ? "border-2 border-link"
            : "border border-line hover:border-link") +
          " " +
          focus
        }
        style={{ minHeight: data.height || 62 }}
      >
        <span
          className="absolute left-0 inset-y-0 w-1.5"
          style={{ background: data.color }}
        />
        <span className="text-sm leading-snug text-ink font-semibold">
          {data.title}
        </span>
      </button>
      {data.expand ? (
        <button
          type="button"
          aria-label={(data.expanded ? "Recolher " : "Expandir ") + data.title}
          aria-expanded={data.expanded}
          onClick={data.expand}
          className={
            "nodrag absolute -right-[22px] top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center cursor-pointer rounded-full " +
            focus
          }
        >
          <span
            className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-ink"
            style={{ border: "2px solid " + data.color }}
          >
            {data.expanded ? <Minus size={14} /> : <Plus size={14} />}
          </span>
        </button>
      ) : null}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}
const nodeTypes = { topic: TopicNode };
export function MindMap(props: Props) {
  return (
    <ReactFlowProvider>
      <MapContent {...props} />
    </ReactFlowProvider>
  );
}
function MapContent(props: Props) {
  const [stage, setStage] = useState<"config" | "loading" | "ready">("config");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [menu, setMenu] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { dark } = useContext(ThemeContext);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullscreen(false);
        setMenu(false);
        setSelected(null);
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  useEffect(() => {
    if (stage !== "ready" || props.active !== "mindmap" || !mapRef.current)
      return;
    let timer: ReturnType<typeof setTimeout>;
    const refit = () => {
      clearTimeout(timer);
      timer = setTimeout(
        () => void fitView({ padding: 0.08, duration: 300, maxZoom: 1.2 }),
        70,
      );
    };
    const observer = new ResizeObserver(refit);
    observer.observe(mapRef.current);
    refit();
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [stage, props.active, expanded, fullscreen, fitView]);
  const generate = () => {
    setStage("loading");
    setTimeout(() => setStage("ready"), 1600);
  };
  const exportMap = async () => {
    if (!mapRef.current) return;
    const data = await toPng(mapRef.current, {
      pixelRatio: 2,
      backgroundColor: getComputedStyle(mapRef.current)
        .getPropertyValue("--surface")
        .trim(),
    });
    const anchor = document.createElement("a");
    anchor.download = "mapa-mental.png";
    anchor.href = data;
    anchor.click();
    setMenu(false);
  };
  const toggle = (id: string) =>
    setExpanded((v) =>
      v.includes(id) ? v.filter((value) => value !== id) : [...v, id],
    );
  const nodes: MapNode[] = [
    {
      id: "root",
      type: "topic",
      position: { x: 12, y: 43 },
      style: { width: 168 },
      data: {
        root: true,
        title: discipline,
        color: "var(--anchy-blue)",
        select: () => setSelected("root"),
      },
    },
  ];
  const edges: Edge[] = [];
  let nextY = 12;
  mapTopics.forEach((topic, i) => {
    const color = `var(--ramo-${(i % 5) + 1})`;
    const y = nextY;
    const height = i === 2 || i === 8 ? 62 : 81;
    nextY += expanded.includes(topic.id)
      ? Math.max(height + 10, topic.children.length * 81 + 10)
      : height + 10;
    nodes.push({
      id: topic.id,
      type: "topic",
      position: { x: 270, y },
      data: {
        title: topic.title,
        color,
        height,
        selected: selected === topic.id,
        expanded: expanded.includes(topic.id),
        expand: () => toggle(topic.id),
        select: () => setSelected(topic.id),
      },
    });
    edges.push({
      id: "root-" + topic.id,
      source: "root",
      target: topic.id,
      type: "default",
      style: { stroke: color, strokeWidth: 2, opacity: 0.55 },
    });
    if (expanded.includes(topic.id))
      topic.children.forEach((child, j) => {
        const id = topic.id + "-" + j;
        nodes.push({
          id,
          type: "topic",
          position: { x: 535, y: y + j * 81 },
          data: { title: child, color, select: () => setSelected(topic.id) },
        });
        edges.push({
          id: "edge-" + id,
          source: topic.id,
          target: id,
          style: { stroke: color, strokeWidth: 2, opacity: 0.55 },
        });
      });
  });
  const detail = mapTopics.find((topic) => topic.id === selected);
  const actions =
    stage === "ready" ? (
      <>
        <button
          type="button"
          onClick={() => void exportMap()}
          className={
            "h-11 px-5 rounded-full inline-flex items-center justify-center gap-2 bg-surface border border-line text-ink text-[15px] font-semibold hover:bg-surface-2 " +
            focus
          }
        >
          <Download size={18} />
          Exportar imagem
        </button>
        <button
          type="button"
          aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
          onClick={() => setFullscreen((v) => !v)}
          className={
            "w-11 h-11 rounded-full flex items-center justify-center text-ink hover:bg-surface-2 " +
            focus
          }
        >
          {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </>
    ) : null;
  return (
    <div className={fullscreen ? "map-fullscreen" : "h-full"}>
      <ToolPanel
        {...props}
        title="Mapa mental"
        subtitle={
          stage === "config"
            ? "Base de conhecimento"
            : stage === "ready"
              ? "Visualizador"
              : undefined
        }
        extra={actions}
        fullHeader={
          fullscreen ? (
            <div className="h-14 shrink-0 flex items-center gap-3 px-6 bg-surface border-b border-line">
              <Owl alt="" style={{ width: 32, height: 32 }} />
              <h2 className="flex-1 min-w-0 truncate text-[17px] font-bold text-ink">
                {discipline}
                <span className="text-[15px] font-medium text-ink-muted">
                  {" "}
                  · Mapa mental
                </span>
              </h2>
              <button
                type="button"
                onClick={() => void exportMap()}
                className="h-11 px-5 rounded-full inline-flex items-center gap-2 bg-surface border border-line text-ink"
              >
                <Download size={18} />
                Exportar imagem
              </button>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="h-11 px-5 rounded-full inline-flex items-center gap-2 bg-surface border border-line text-ink"
              >
                <Minimize size={18} />
                Sair da tela cheia
              </button>
            </div>
          ) : undefined
        }
      >
        {stage === "config" ? (
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-5 py-6 lg:px-[78px] lg:py-8">
            <div className="flex items-start gap-4 rounded-card bg-soft p-6">
              <span className="w-12 h-12 shrink-0 rounded-2xl bg-surface flex items-center justify-center text-link">
                <Share2 />
              </span>
              <div>
                <h3 className="text-[22px] font-bold text-ink">
                  Mapa mental completo
                </h3>
                <p className="mt-1 text-base text-ink">
                  A Anchy vai analisar 4 documentos e extrair o conteúdo
                  didático para criar um mapa visual detalhado.
                </p>
              </div>
            </div>
            <h4 className="mt-7 mb-3 text-base font-semibold text-ink-muted">
              Fontes de conhecimento
            </h4>
            <ul className="flex flex-col gap-2">
              {sources.map((source) => (
                <li
                  key={source}
                  className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 min-h-12 py-2"
                >
                  <FileText className="w-5 h-5 shrink-0 text-link" />
                  <span className="flex-1 min-w-0 truncate text-base font-semibold text-ink">
                    {source}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-2 text-sm text-ink-muted shrink-0">
                    <span className="w-2 h-2 rounded-full bg-ok" />
                    Documento oficial
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex-1 min-h-8" />
            <Primary
              onClick={generate}
              className="w-full lg:w-auto lg:self-start"
            >
              <Share2 size={20} />
              Gerar mapa mental
            </Primary>
            <p className="mt-3 text-sm text-ink-muted">
              Gerado com IA a partir do material da disciplina
            </p>
          </div>
        ) : null}
        {stage === "loading" ? (
          <StudyLoading
            title="Criando conexões…"
            text="A Anchy está analisando os conceitos para organizar as interligações ideais."
          />
        ) : null}
        {stage === "ready" ? (
          <div className="relative flex-1 min-h-0 flex">
            <div className="relative flex-1 min-w-0 bg-surface-2" ref={mapRef}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.12, maxZoom: 1.2 }}
                minZoom={0.2}
                maxZoom={2.5}
                nodesConnectable={false}
                nodesDraggable={false}
                elementsSelectable={false}
                proOptions={{ hideAttribution: true }}
                colorMode={dark ? "dark" : "light"}
                style={{ background: "transparent" }}
              >
                <Background gap={20} size={1} color="var(--line)" />
              </ReactFlow>
              <div className="map-controls bg-surface border border-line rounded-full shadow-float">
                <button
                  type="button"
                  aria-label="Aumentar zoom"
                  onClick={() => void zoomIn()}
                >
                  <Plus size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Diminuir zoom"
                  onClick={() => void zoomOut()}
                >
                  <Minus size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Centralizar"
                  onClick={() => void fitView({ padding: 0.12, duration: 300 })}
                >
                  <Scan size={20} />
                </button>
              </div>
              <div className="lg:hidden map-mobile-actions">
                <button
                  type="button"
                  aria-label="Mais ações"
                  aria-expanded={menu}
                  onClick={() => setMenu((v) => !v)}
                  className="w-11 h-11 rounded-full bg-surface flex items-center justify-center"
                >
                  <MoreHorizontal />
                </button>
                {menu ? (
                  <div className="map-menu bg-surface border border-line rounded-2xl shadow-float">
                    {actions}
                  </div>
                ) : null}
              </div>
            </div>
            <AnimatePresence>
              {selected ? (
                <motion.aside
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  aria-label={"Detalhe: " + (detail?.title || discipline)}
                  className="map-detail bg-surface border border-line shadow-float rounded-card"
                >
                  <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-5 lg:pl-7">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-ink-muted truncate">
                        Ramo do mapa
                      </p>
                      <button
                        type="button"
                        aria-label="Fechar detalhe"
                        onClick={() => setSelected(null)}
                        className={
                          "w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink hover:bg-surface-2 " +
                          focus
                        }
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <h3 className="pr-3 text-xl font-bold leading-snug text-ink">
                      {detail?.title || discipline}
                    </h3>
                    <p className="mt-3 pr-3 text-base leading-[1.55] text-ink">
                      {detail?.description || "Mapa mental · UniAnchieta"}
                    </p>
                  </div>
                  <div className="shrink-0 px-5 pb-5 lg:pl-7">
                    <Ask
                      onClick={() =>
                        props.onAsk("Explique " + (detail?.title || discipline))
                      }
                      className="w-full"
                    />
                  </div>
                </motion.aside>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </ToolPanel>
    </div>
  );
}
