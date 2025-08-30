// SFM 专用 Sub-Store 魔改 template.js
// 自动注入订阅节点到指定分组，兼容 Sing-box 1.12.x
// 保留精细化 MetaCubeX 分流规则

function parseQuery(url) {
  const query = {};
  if (url.indexOf("#") > -1) {
    url
      .split("#")[1]
      .split("&")
      .forEach(p => {
        const [k, v] = p.split("=");
        query[k] = decodeURIComponent(v);
      });
  }
  return query;
}

function main(config, proxyGroups, url) {
  const query = parseQuery(url);

  // 定义节点分组
  let groups = [
    { tag: "🇰🇷 韩国节点", keywords: ["kr", "korea", "首尔", "韩国"] },
    { tag: "🇯🇵 日本节点", keywords: ["jp", "japan", "日本", "东京"] },
    { tag: "🇸🇬 新加坡节点", keywords: ["sg", "singapore", "新加坡"] },
    { tag: "🇺🇸 美国节点", keywords: ["us", "usa", "united states", "美国"] }
  ];

  if (query.outbound) {
    groups = query.outbound.split("ℹ️").filter(Boolean).map(item => {
      const [tag, ...keys] = item.split("|");
      return { tag: tag.trim(), keywords: keys.map(k => k.trim().toLowerCase()) };
    });
  }

  // 配置 inbounds（Socks 和 HTTP）
  config.inbounds = [
    { type: "socks", listen: "0.0.0.0", port: 1080, settings: {} },
    { type: "http", listen: "0.0.0.0", port: 1081, settings: {} }
  ];

  // 配置 outbounds
  config.outbounds = groups.map(g => ({ tag: g.tag, type: "selector", outbounds: [] }));
  config.outbounds.push({
    tag: "🚀 默认代理",
    type: "selector",
    outbounds: groups.map(g => g.tag)
  });
  config.outbounds.push({ tag: "直连", type: "direct" });
  config.outbounds.push({ tag: "阻断", type: "block" });

  // 将订阅节点注入分组
  proxyGroups.forEach(node => {
    const name = node.name.toLowerCase();
    let matched = false;
    for (let group of groups) {
      if (group.keywords.some(k => name.includes(k))) {
        const target = config.outbounds.find(o => o.tag === group.tag);
        if (target) target.outbounds.push(node.name);
        matched = true;
        break;
      }
    }
    if (!matched) {
      const def = config.outbounds.find(o => o.tag === "🚀 默认代理");
      if (def) def.outbounds.push(node.name);
    }
  });

  // 配置精细化 MetaCubeX 分流和 geosite-cn / geosite-!cn
  config.route = {
    rule_set: [
      { tag: "geosite-tiktok", type: "remote", format: "binary", url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/tiktok.srs", download_detour: "🚀 默认代理" },
      { tag: "geosite-netflix", type: "remote", format: "binary", url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/netflix.srs", download_detour: "🚀 默认代理" },
      { tag: "geosite-disney", type: "remote", format: "binary", url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/disney.srs", download_detour: "🚀 默认代理" },
      { tag: "geosite-openai", type: "remote", format: "binary", url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/openai.srs", download_detour: "🚀 默认代理" },
      { tag: "geosite-steam", type: "remote", format: "binary", url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/steam.srs", download_detour: "🚀 默认代理" },
      { tag: "geosite-playstation", type: "remote", format: "binary", url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/playstation.srs", download_detour: "🚀 默认代理" },
      { tag: "geosite-nintendo", type: "remote", format: "binary", url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/nintendo.srs", download_detour: "🚀 默认代理" },
      { tag: "geosite-gfw", type: "remote", format: "binary", url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/gfw.srs", download_detour: "🚀 默认代理" },
      { tag: "geosite-!cn", type: "remote", format: "binary", url: "https://gh-proxy.com/https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/geolocation-!cn.srs", download_detour: "🚀 默认代理" },
      { tag: "geosite-cn", type: "remote", format: "binary", url: "https://gh-proxy.com/https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/cn.srs", download_detour: "直连" }
    ],
    rules: [
      { rule_set: "geosite-tiktok", outbound: "🇸🇬 新加坡节点" },
      { rule_set: "geosite-netflix", outbound: "🇰🇷 韩国节点" },
      { rule_set: "geosite-disney", outbound: "🇰🇷 韩国节点" },
      { rule_set: "geosite-openai", outbound: "🇺🇸 美国节点" },
      { rule_set: "geosite-steam", outbound: "🇯🇵 日本节点" },
      { rule_set: "geosite-playstation", outbound: "🇯🇵 日本节点" },
      { rule_set: "geosite-nintendo", outbound: "🇯🇵 日本节点" },
      { rule_set: "geosite-gfw", outbound: "🚀 默认代理" },
      { rule_set: "geosite-!cn", outbound: "🚀 默认代理" },
      { rule_set: "geosite-cn", outbound: "直连" },
      { outbound: "🚀 默认代理" }
    ]
  };

  // 返回完整配置
  return config;
}
