import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusBlock } from "@/components/ui/status-block";
import { homeRoute } from "@/lib/routes";

export default function GlobalNotFound() {
  return (
    <StatusBlock
      title="Page not found"
      description="This route does not exist in the Stock-Yard frontend. V1 is intentionally constrained to discovery, ticker research, and compare."
      action={
        <Link href={homeRoute}>
          <Button>Back home</Button>
        </Link>
      }
    />
  );
}
