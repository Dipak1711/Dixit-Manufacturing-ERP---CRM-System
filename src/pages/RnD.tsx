import { FlaskConical } from "lucide-react";
import { Card, Empty, PageHeader } from "../components/ui";

export default function RnD() {
  return (
    <>
      <PageHeader eyebrow="More" title="R&D" description="Research & Development module." />
      <Card pad={false}>
        <Empty icon={FlaskConical} title="Waiting for Dixit to confirm the R&D workflow"
          hint="This module is reserved in the navigation. We will design it — for example product experiments, prototypes and test results — only after the client confirms what the R&D team needs." />
      </Card>
    </>
  );
}
