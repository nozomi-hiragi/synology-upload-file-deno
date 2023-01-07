export const defaultParams = {
  "SYNO.API.Auth": {
    version: 6,
  },
  "SYNO.FileStation.Upload": {
    version: 2,
  },
};

export class SynologyAPI {
  baseUrl: string;
  id?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  createUrl(
    api: string,
    version: number | string,
    method: string,
    ops?: { [name: string]: string },
  ) {
    const url = new URL("/webapi/entry.cgi", this.baseUrl);
    url.searchParams.append("api", api);
    url.searchParams.append("version", String(version));
    url.searchParams.append("method", method);
    if (ops) {
      const names = Object.keys(ops);
      for (const name of names) url.searchParams.append(name, ops[name]);
    }
    return url;
  }

  async login(account: string, passwd: string) {
    const url = this.createUrl(
      "SYNO.API.Auth",
      defaultParams["SYNO.API.Auth"].version,
      "login",
      { account, passwd, session: "FileStation", format: "sid" },
    );

    const ret = await fetch(url);
    if (!ret.ok) throw new Error(await ret.text());
    const json = await ret.json();
    if (!json.success) throw new Error(JSON.stringify(json));
    this.id = json.data.sid;
  }

  async uploadFile(file: Blob, path: string, filename?: string) {
    if (!this.id) throw new Error("no login");

    const url = this.createUrl(
      "SYNO.FileStation.Upload",
      defaultParams["SYNO.FileStation.Upload"].version,
      "upload",
    );

    const form = new FormData();
    form.append("path", path);
    form.append("create_parents", "true");
    form.append("filename", file, filename);

    const res = await fetch(url, {
      headers: { cookie: `id=${this.id}` },
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    if (!json.success) console.log(JSON.stringify(json));
    return json.success as boolean;
  }
}
