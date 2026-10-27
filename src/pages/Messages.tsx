import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, CheckCheck, Send } from "lucide-react";
import { Avatar, DemoNote } from "../components/ui";
import { useStore } from "../store";
import { useI18n } from "../lib/i18n";
import { cn } from "../lib/utils";

export default function Messages() {
  const st = useStore();
  const { t } = useI18n();
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const th = st.threads.find((x) => x.id === active);
  const emp = (id: string) => st.employees.find((e) => e.id === id)!;
  const unread = (id: string) => st.threads.find((x) => x.id === id)!.msgs.filter((m) => m.from !== "me" && !m.read).length;
  useEffect(() => { if (active) st.markRead(active); end.current?.scrollIntoView(); }, [active, th?.msgs.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const send = () => { if (!text.trim() || !active) return; st.sendMessage(active, text.trim()); setText(""); };

  return (
    <>
      <div><div className="mb-1.5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><span className="h-1 w-6 rounded-full bg-teal" /> {t("People")}</div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-[28px]">{t("Messages")}</h1></div>
      <div className="grid h-[calc(100vh-250px)] min-h-[440px] overflow-hidden rounded-xl border bg-card shadow-soft grid-cols-[minmax(0,1fr)] md:grid-cols-[320px_1fr]">
        <aside className={cn("flex min-h-0 flex-col border-r", active && "max-md:hidden")}>
          <div className="border-b p-3 text-sm font-bold text-navy">Chats</div>
          <ul className="scroll-thin flex-1 overflow-y-auto">
            {st.threads.map((x) => { const e = emp(x.with); const last = x.msgs[x.msgs.length - 1]; const n = unread(x.id); return (
              <li key={x.id}><button onClick={() => setActive(x.id)} className={cn("flex w-full items-center gap-3 border-b px-3 py-3 text-left transition hover:bg-muted/50", active === x.id && "bg-primary-soft/50")}>
                <Avatar name={e.name} size={42} tone="teal" />
                <div className="min-w-0 flex-1"><div className="flex items-baseline justify-between gap-2"><b className="truncate text-sm font-semibold text-navy">{e.name}</b><span className="shrink-0 text-[11px] text-muted-foreground">{last.at}</span></div>
                  <div className="flex items-center justify-between gap-2"><span className={cn("truncate text-[13px]", n ? "font-semibold text-foreground" : "text-muted-foreground")}>{last.from === "me" && "You: "}{last.text}</span>
                    {n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal px-1.5 text-[11px] font-bold text-white">{n}</span>}</div></div>
              </button></li>); })}
          </ul>
        </aside>
        <section className={cn("flex min-h-0 flex-col bg-muted/70", !active && "max-md:hidden")}>
          {th ? (<>
            <header className="flex items-center gap-3 border-b bg-card px-4 py-2.5">
              <button className="md:hidden" onClick={() => setActive(null)} aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
              <Avatar name={emp(th.with).name} tone="teal" /><div><div className="text-sm font-bold text-navy">{emp(th.with).name}</div><div className="text-xs text-muted-foreground">{emp(th.with).role}</div></div>
            </header>
            <div className="scroll-thin flex-1 space-y-2 overflow-y-auto p-4">
              {th.msgs.map((m) => { const me = m.from === "me"; return (
                <div key={m.id} className={cn("flex", me ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-soft", me ? "rounded-br-sm bg-primary text-white" : "rounded-bl-sm bg-card")}>
                    {m.text}
                    <div className={cn("mt-0.5 flex items-center justify-end gap-1 text-[10.5px]", me ? "text-white/75" : "text-muted-foreground")}>{m.at}{me && (m.read ? <CheckCheck className="h-3.5 w-3.5 text-sky-200" /> : <Check className="h-3.5 w-3.5" />)}</div>
                  </div></div>); })}
              <div ref={end} />
            </div>
            <footer className="border-t bg-card p-3">
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Type a message")} className="h-11 flex-1 rounded-full bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                <button type="submit" disabled={!text.trim()} aria-label={t("Send message")} className="grid h-11 w-11 place-items-center rounded-full bg-teal text-white transition hover:opacity-90 disabled:opacity-40"><Send className="h-[18px] w-[18px]" /></button>
              </form>
              <div className="mt-2"><DemoNote>Messages stay in this browser. Delivery between real employees (and one-tick / two-tick read receipts) needs the backend.</DemoNote></div>
            </footer>
          </>) : <div className="grid flex-1 place-items-center p-8 text-center text-sm text-muted-foreground">Select a chat to start messaging.</div>}
        </section>
      </div>
    </>
  );
}
