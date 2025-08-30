// SFM 专用 template.js
// 用于 Sub-Store -> Sing-box 配置生成
// 特点：去掉 filter，兼容 SFM

function main(config, proxyGroups) {
  let outbounds = [];

  // 固定分组（SFM 兼容版）
  let groups = [
    { tag: "🇰🇷 韩国节点", keywords: ["kr", "korea", "首尔", "韩国"] },
    { tag: "🇯🇵 日本节点", keywords: ["jp", "japan", "日本", "东京"] },
    { tag: "🇸🇬 新加坡节点", keywords: ["sg", "singapore", "新加坡"] },
    { tag: "🇺🇸 美国节点", keywords: ["us", "usa", "united states", "美国"] }
  ];

  // 创建 selector 分组
  groups.forEach(group => {
    outbounds.push({
      tag: group.tag,
      type: "selector",
      outbounds: []
    });
  });

  // 默认代理，聚合所有区域分组
  outbounds.push({
    tag: "🚀 默认代理",
    type: "selector",
    outbounds: groups.map(g => g.tag)
  });

  // 固定直连 / 阻断
  outbounds.push({ tag: "直连", type: "direct" });
  outbounds.push({ tag: "阻断", type: "block" });

  // 将订阅节点注入到对应分组
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
    // 如果没匹配到，塞进默认代理
    if (!matched) {
      let def = outbounds.find(o => o.tag === "🚀 默认代理");
      if (def) def.outbounds.push(node.name);
    }
  });

  // 替换原始配置的 outbounds
  config.outbounds = outbounds;

  return config;
}
