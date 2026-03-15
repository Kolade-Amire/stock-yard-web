import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusBlock } from "@/components/ui/status-block";
import { homeRoute } from "@/lib/routes";

export default function TickerNotFound() {
  return (
    <StatusBlock
      title="Ticker not found"
      description="The overview endpoint is the authoritative symbol check, and this symbol did not validate against the Stock-Yard API."
      action={
        <Link href={homeRoute}>
          <Button>Back to discover</Button>
        </Link>
      }
    />
  );
}
