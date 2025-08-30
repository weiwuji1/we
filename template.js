// SFM 专用魔改版 template.js
// 在 xream 原版基础上裁剪，去掉 filter，兼容 SFM
// 用法示例：
// https://你的域名/template.js#type=组合订阅&name=机场订阅&outbound=🇰🇷韩国|kr|korea🇯🇵日本|jp|japan🇸🇬新加坡|sg|singapore🇺🇸美国|us|usa

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

  // 默认内置分组
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

  // 输出配置
  config.outbounds = outbounds;
  return config;
}
