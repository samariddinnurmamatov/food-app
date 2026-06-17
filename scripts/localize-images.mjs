import fs from "node:fs";

const data = "src/mock/data.ts";
let src = fs.readFileSync(data, "utf8");
const re = /https:\/\/images\.unsplash\.com\/(photo-[a-z0-9-]+)\?w=(\d+)&q=\d+/g;
fs.mkdirSync("public/img", { recursive: true });

const map = new Map();
for (const m of src.matchAll(re)) {
  if (!map.has(m[0])) map.set(m[0], { file: `/img/${m[1]}-${m[2]}.jpg` });
}

let ok = 0,
  fail = 0;
for (const [url, info] of map) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    fs.writeFileSync("public" + info.file, Buffer.from(await res.arrayBuffer()));
    ok++;
  } catch (e) {
    console.log("FAIL", info.file, e.message);
    fail++;
  }
}

for (const [url, info] of map) src = src.split(url).join(info.file);
fs.writeFileSync(data, src);
console.log("unique images:", map.size, "| downloaded:", ok, "| failed:", fail);
console.log("remaining unsplash refs:", (src.match(/unsplash/g) || []).length);
