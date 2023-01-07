export const parseArgs = (requireKeys?: string[]) => {
  const args: { [name: string]: string } = {};
  for (const arg of Deno.args) {
    const split = arg.split("=");
    args[split[0]] = split[1];
  }

  if (requireKeys) {
    const missingKey = requireKeys
      .find((key) => !Object.keys(args).includes(key));
    if (missingKey) throw new Error(`no arg: ${missingKey}`);
  }
  return args as { [name: string]: string | undefined };
};

const getFileInfo = (path: string) => {
  try {
    return Deno.statSync(path);
  } catch {
    return undefined;
  }
};

export const readFile = (path: string) => {
  const status = getFileInfo(path);
  if (!status) throw new Error("wrong path");
  if (!status.isFile) throw new Error(`"${path}" is not file`);
  return Deno.readFileSync(path);
};

export const checkHaveKeys = <T extends readonly string[]>(
  obj: { [key: string]: string | undefined },
  keys: T,
) => {
  for (const key of keys) {
    if (!obj[key]) throw new Error(`no value: ${key}`);
  }

  return obj as { [key in T[number]]: string };
};
