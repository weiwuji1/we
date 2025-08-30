// SFM 专用 template.js
// 基于 xream 脚本裁剪，支持自动分流节点
// 去掉不兼容的字段（如 filter），适配 SFM

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
  const outbounds = [];

  // 固定分组（SFM 兼容版）
  let groups = [
    { tag: "🇰🇷 韩国节点", keywords: ["kr", "korea", "首尔", "韩国"] },
    { tag: "🇯🇵 日本节点", keywords: ["jp", "japan", "日本", "东京"] },
    { tag: "🇸🇬 新加坡节点", keywords: ["sg", "singapore", "新加坡"] },
    { tag: "🇺🇸 美国节点", keywords: ["us", "usa", "united states", "美国"] }
  ];

  // 如果用户通过参数定义了 outbound 分组，覆盖默认
  if (query.outbound) {
    groups = query.outbound.split("ℹ️").filter(Boolean).map(item => {
      const [tag, ...keys] = item.split("|");
      return { tag: tag.trim(), keywords: keys.map(k => k.trim().toLowerCase()) };
    });
  }

  // 创建 selector 分组
  groups.forEach(group => {
    outbounds.push({
      tag: group.tag,
      type: "selector",
      outbounds: []
    });
  });

  // 默认代理
  outbounds.push({
    tag: "🚀 默认代理",
    type: "selector",
    outbounds: groups.map(g => g.tag)
  });

  // 固定直连 / 阻断
  outbounds.push({ tag: "直连", type: "direct" });
  outbounds.push({ tag: "阻断", type: "block" });

  // 节点分配到对应分组
  proxyGroups.forEach(node => {
    let name = node.name.toLowerCase();
    let matched = false;
    for (let group of groups) {
      if (group.keywords.some(k => name.includes(k))) {
        let target = outbounds.find(o => o.tag === group.tag);
        if (target) target.outbounds.push(node.name);
        matched = true;
        break;
      }
    }
    if (!matched) {
      let def = outbounds.find(o => o.tag === "🚀 默认代理");
      if (def) def.outbounds.push(node.name);
    }
  });

  // 加入 MetaCubeX 精细化规则
  config.route = {
    rule_set: [
      {
        tag: "🎵 TikTok",
        type: "remote",
        format: "binary",
        url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/tiktok.srs"
      },
      {
        tag: "🎬 Netflix",
        type: "remote",
        format: "binary",
        url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/netflix.srs"
      },
      {
        tag: "📺 YouTube",
        type: "remote",
        format: "binary",
        url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/youtube.srs"
      },
      {
        tag: "🤖 AI",
        type: "remote",
        format: "binary",
        url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/ai.srs"
      },
      {
        tag: "💬 Telegram",
        type: "remote",
        format: "binary",
        url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/telegram.srs"
      },
      {
        tag: "🎮 Steam",
        type: "remote",
        format: "binary",
        url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/steam.srs"
      }
    ],
    rules: [
      { "rule_set": "🎵 TikTok", "outbound": "🚀 默认代理" },
      { "rule_set": "🎬 Netflix", "outbound": "🚀 默认代理" },
      { "rule_set": "📺 YouTube", "outbound": "🚀 默认代理" },
      { "rule_set": "🤖 AI", "outbound": "🚀 默认代理" },
      { "rule_set": "💬 Telegram", "outbound": "🚀 默认代理" },
      { "rule_set": "🎮 Steam", "outbound": "🚀 默认代理" },
      { "domain_suffix": ["cn"], "outbound": "直连" },
      { "geoip": ["cn"], "outbound": "直连" },
      { "ip_is_private": true, "outbound": "直连" },
      { "outbound": "🚀 默认代理" }
    ]
  };

  // 替换原始配置的 outbounds
  config.outbounds = outbounds;
  return config;
}
