import { basename } from "https://deno.land/std@0.171.0/path/mod.ts";
import { checkHaveKeys, parseArgs, readFile } from "./utils.ts";
import { SynologyAPI } from "./synology_api.ts";

try {
  const { name, ...args } = parseArgs();
  const { url, account, passwd, file, path } = checkHaveKeys(
    args,
    ["url", "account", "passwd", "file", "path"] as const,
  );

  const api = new SynologyAPI(url);
  await api.login(account, passwd);

  const result = await api.uploadFile(
    new Blob([readFile(file)]),
    path,
    name ?? basename(file),
  );
  if (!result) {
    console.log("upload failed");
    Deno.exit(1);
  }
  Deno.exit(0);
} catch (err) {
  console.error(err.toString());
  Deno.exit(1);
}
