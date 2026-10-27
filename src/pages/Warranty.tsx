import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Button, Card, Field, Input, Kv, PageHeader } from "../components/ui";
import { useStore } from "../store";
import { fmtDate, TODAY } from "../lib/utils";
import { cn } from "../lib/utils";

const urlFor = (code: string) => `${location.origin}${location.pathname}#/warranty?code=${code}`;

export default function Warranty() {
  const st = useStore();
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get("code") ?? "");
  const [checked, setChecked] = useState(params.get("code") ?? "");
  useEffect(() => { const c = params.get("code"); if (c) { setCode(c); setChecked(c); } }, [params]);
  const found = st.customers.find((c) => c.warrantyCode?.toLowerCase() === checked.trim().toLowerCase());
  const days = found?.warrantyUntil ? Math.ceil((new Date(found.warrantyUntil).getTime() - TODAY.getTime()) / 864e5) : 0;
  const state = !checked ? "idle" : !found ? "invalid" : days < 0 ? "expired" : "valid";
  const samples = st.customers.filter((c) => c.warrantyCode).slice(0, 3);

  return (
    <>
      <PageHeader eyebrow="CRM" title="Warranty Check" description="Scan the QR sticker on a machine, or type the warranty code, to confirm warranty status." />
      <div className="grid gap-5 lg:grid-cols-5">
        <Card title="Verify warranty" className="lg:col-span-3">
          <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); setChecked(code); setParams(code ? { code } : {}); }}>
            <Field label="Warranty code" className="min-w-[220px] flex-1" hint="Printed under the QR code, e.g. DX-MT-25-0112"><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="DX-XX-YY-NNNN" autoFocus /></Field>
            <Button type="submit" icon={ShieldCheck} className="mb-[22px]">Verify warranty</Button>
          </form>
          <div className="mt-4">
            {state === "idle" && <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground"><ShieldQuestion className="h-5 w-5" /> Enter a code to see the result.</div>}
            {state === "invalid" && <div className="flex items-center gap-3 rounded-xl bg-danger-soft p-4 text-sm font-medium text-danger"><ShieldAlert className="h-5 w-5" /> No machine found for “{checked}”. Check the code and try again.</div>}
            {found && (
              <div className={cn("rounded-xl border p-5", state === "valid" ? "border-success/30 bg-success-soft/50" : "border-danger/30 bg-danger-soft/50")}>
                <div className="flex items-center gap-3">
                  {state === "valid" ? <CheckCircle2 className="h-8 w-8 text-success" /> : <ShieldAlert className="h-8 w-8 text-danger" />}
                  <div><div className="text-lg font-extrabold text-navy">{state === "valid" ? "Under warranty" : "Warranty expired"}</div>
                    <div className="text-sm text-muted-foreground">{state === "valid" ? `${days} days remaining` : `Expired ${-days} days ago — service is chargeable`}</div></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Kv k="Product" v={found.product} /><Kv k="Customer" v={found.name} /><Kv k="Location" v={`${found.city}, ${found.state}`} />
                  <Kv k="Installed" v={found.installedOn && fmtDate(found.installedOn)} /><Kv k="Valid until" v={found.warrantyUntil && fmtDate(found.warrantyUntil)} /><Kv k="Code" v={found.warrantyCode} />
                </div>
              </div>
            )}
          </div>
        </Card>
        <Card title="Sample QR stickers" subtitle="Scan with a phone to open the check page" className="lg:col-span-2">
          <ul className="space-y-4">
            {samples.map((c) => (
              <li key={c.id} className="flex items-center gap-4">
                <button onClick={() => { setCode(c.warrantyCode!); setChecked(c.warrantyCode!); }} className="rounded-lg border bg-white p-2 hover:shadow-card" aria-label={`Check ${c.warrantyCode}`}><QRCodeSVG value={urlFor(c.warrantyCode!)} size={76} fgColor="#1f2937" /></button>
                <div className="text-sm"><b className="font-semibold">{c.warrantyCode}</b><div className="text-xs text-muted-foreground">{c.product}<br />{c.name}</div></div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Phones can only open the link if this site is hosted online; on a laptop, click a QR to test it.</p>
        </Card>
      </div>
    </>
  );
}
