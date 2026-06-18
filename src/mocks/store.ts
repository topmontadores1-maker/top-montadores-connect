import { create } from "zustand";
import {
  professionals as seedProfessionals,
  publicLinks as seedLinks,
  auditLog as seedAudit,
  type Professional,
  type PublicLink,
  type AuditEvent,
} from "./data";

type State = {
  professionals: Professional[];
  links: PublicLink[];
  audit: AuditEvent[];
  addProfessional: (p: Omit<Professional, "id" | "linksCount">) => Professional;
  updateProfessional: (id: string, patch: Partial<Professional>) => void;
  togglePause: (id: string) => void;
  applyGlobalUpdate: (
    id: string,
    patch: { photoUrl?: string; whatsapp?: string },
  ) => { affected: number; excluded: number };
  replaceProfessional: (
    fromId: string,
    toId: string,
    filter?: { city?: string; serviceSlug?: string },
  ) => { transferred: number };
  removeLinkOverride: (
    linkId: string,
    field: "photoOverride" | "whatsappOverride",
  ) => void;
  setLinkOverride: (
    linkId: string,
    patch: Partial<Pick<PublicLink, "photoOverride" | "whatsappOverride">>,
  ) => void;
  pushAudit: (what: string, target: string) => void;
};

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function recountLinks(profs: Professional[], links: PublicLink[]) {
  return profs.map((p) => ({
    ...p,
    linksCount: links.filter((l) => l.professionalId === p.id).length,
  }));
}

export const useStore = create<State>((set, get) => ({
  professionals: recountLinks(seedProfessionals, seedLinks),
  links: seedLinks,
  audit: seedAudit,

  pushAudit: (what, target) =>
    set((s) => ({
      audit: [
        { id: `a${Date.now()}`, at: nowStamp(), who: "admin@top", what, target },
        ...s.audit,
      ],
    })),

  addProfessional: (p) => {
    const id = `p${Date.now()}`;
    const created: Professional = { ...p, id, linksCount: 0 };
    set((s) => ({ professionals: [created, ...s.professionals] }));
    get().pushAudit("Cadastrou montador", created.name);
    return created;
  },

  updateProfessional: (id, patch) =>
    set((s) => ({
      professionals: s.professionals.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  togglePause: (id) => {
    const p = get().professionals.find((x) => x.id === id);
    if (!p) return;
    const next: Professional["status"] = p.status === "pausado" ? "ativo" : "pausado";
    get().updateProfessional(id, { status: next });
    get().pushAudit(next === "pausado" ? "Pausou montador" : "Reativou montador", p.name);
  },

  applyGlobalUpdate: (id, patch) => {
    const links = get().links.filter((l) => l.professionalId === id);
    let affected = 0;
    let excluded = 0;
    for (const l of links) {
      const photoExcepted = patch.photoUrl !== undefined && l.photoOverride;
      const phoneExcepted = patch.whatsapp !== undefined && l.whatsappOverride;
      if ((patch.photoUrl !== undefined && !photoExcepted) || (patch.whatsapp !== undefined && !phoneExcepted)) {
        affected++;
      } else {
        excluded++;
      }
    }
    get().updateProfessional(id, {
      ...(patch.photoUrl !== undefined ? { photoUrl: patch.photoUrl } : {}),
      ...(patch.whatsapp !== undefined ? { whatsapp: patch.whatsapp } : {}),
    });
    const p = get().professionals.find((x) => x.id === id);
    const fields = [patch.photoUrl !== undefined ? "foto" : null, patch.whatsapp !== undefined ? "WhatsApp" : null]
      .filter(Boolean)
      .join(" e ");
    get().pushAudit(`Atualização global de ${fields} (${affected} links)`, p?.name ?? id);
    return { affected, excluded };
  },

  replaceProfessional: (fromId, toId, filter) => {
    let transferred = 0;
    set((s) => {
      const links = s.links.map((l) => {
        if (l.professionalId !== fromId) return l;
        if (filter?.city && l.citySlug !== filter.city) return l;
        if (filter?.serviceSlug && l.serviceSlug !== filter.serviceSlug) return l;
        transferred++;
        return { ...l, professionalId: toId };
      });
      return { links, professionals: recountLinks(s.professionals, links) };
    });
    const from = get().professionals.find((x) => x.id === fromId);
    const to = get().professionals.find((x) => x.id === toId);
    get().pushAudit(
      `Substituiu profissional em ${transferred} links`,
      `${from?.name ?? fromId} → ${to?.name ?? toId}`,
    );
    return { transferred };
  },

  setLinkOverride: (linkId, patch) =>
    set((s) => ({ links: s.links.map((l) => (l.id === linkId ? { ...l, ...patch } : l)) })),

  removeLinkOverride: (linkId, field) =>
    set((s) => ({ links: s.links.map((l) => (l.id === linkId ? { ...l, [field]: null } : l)) })),
}));
