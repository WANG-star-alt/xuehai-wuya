# -*- coding: utf-8 -*-
"""把 tree-data.js 里 createNode 的第 4 个参数（原「建议时间」）替换为真实字数。
规则：
  - 节节点（有 href 指向 XX-Y-xxx.html）-> 该文件实际中文字数
  - 节节点（无 href）-> '待撰写'
  - 章节点 -> 其下所有节 + 章总览页字数合计
  - 篇节点 / 根节点 -> 下属合计
"""
import re, io, os

ROOT = r'd:\TRAE 工作空间\xuehai-wuya'
TREE = os.path.join(ROOT, 'assets', 'tree-data.js')

def cn_count(rel):
    p = os.path.join(ROOT, rel.replace('/', os.sep).split('#')[0])
    if not os.path.exists(p):
        return 0
    with io.open(p, encoding='utf-8') as f:
        s = f.read()
    s = re.sub(r'<script.*?</script>|<style.*?</style>', '', s, flags=re.S)
    s = re.sub(r'<div class="lab"[^>]*></div>', '', s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    return len(re.findall(r'[\u4e00-\u9fff]', s))

with io.open(TREE, encoding='utf-8') as f:
    src = f.read()

# 逐个 createNode 调用定位：id, label, desc, time
# 结构：createNode('id', 'label', 'desc', 'time',
pat = re.compile(
    r"createNode\(\s*'([^']+)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'([^']*)'",
    re.S)

# 第一遍：收集每个节点的 id / 是否有 href / href 值
nodes = {}
for m in pat.finditer(src):
    nid = m.group(1)
    # 在该 createNode 之后 1200 字符内找 href（同一节点的 options）
    # 只在同一行内找 href，防止串到下一个节点或父节点的 href
    line_end = src.find('\n', m.end())
    seg = src[m.end():line_end if line_end != -1 else len(src)]
    hm = re.search(r"href:\s*'([^']+)'", seg)
    # 章/篇节点的 href 出现在 children 数组之后，需要额外向后找
    nodes[nid] = {'href': hm.group(1) if hm else None, 'span': m.span(4), 'raw': m.group(0)}

# 计算每个节点的字数
# 先算所有「节」节点（id 形如 xx-NN-N 或 ai-03-xxx 锚点型）
seen_files = {}
def words_for_href(h):
    if not h:
        return 0
    base = h.split('#')[0]
    if base not in seen_files:
        seen_files[base] = cn_count(base)
    return seen_files[base]

# 逐层：用缩进层级判断父子关系
lines = src.split('\n')
# 建立 (行号, 缩进, id, 是否 createNode 起始) 索引
entries = []
for i, ln in enumerate(lines):
    m = re.search(r"createNode\(\s*'([^']+)'", ln)
    if m:
        entries.append((i, len(ln) - len(ln.lstrip()), m.group(1)))

# 父子：缩进更小且行号更小的最近一个即父
parent = {}
for idx, (ln_i, ind, nid) in enumerate(entries):
    p = None
    for j in range(idx - 1, -1, -1):
        if entries[j][1] < ind:
            p = entries[j][2]
            break
    parent[nid] = p

children = {}
for nid, p in parent.items():
    if p:
        children.setdefault(p, []).append(nid)

def is_section(nid):
    return nid not in children

def total_words(nid):
    if is_section(nid):
        return words_for_href(nodes.get(nid, {}).get('href'))
    s = words_for_href(nodes.get(nid, {}).get('href'))  # 章总览页本身
    for c in children[nid]:
        s += total_words(c)
    return s

def fmt(n, kind):
    if n == 0:
        return '待撰写'
    if kind == 'section':
        return '%d 字' % n
    if n >= 10000:
        return '约 %.1f 万字' % (n / 10000.0)
    return '约 %d 字' % n

# 生成替换：从后往前替换，避免位置偏移
repls = []
for nid, info in nodes.items():
    n = total_words(nid)
    kind = 'section' if is_section(nid) else 'group'
    repls.append((info['span'], fmt(n, kind), nid))

repls.sort(key=lambda x: -x[0][0])
out = src
for (a, b), val, nid in repls:
    out = out[:a] + val + out[b:]

with io.open(TREE, 'w', encoding='utf-8') as f:
    f.write(out)

# 报告
print('nodes updated:', len(repls))
sec = [(nid, total_words(nid)) for nid in nodes if is_section(nid)]
haswords = [x for x in sec if x[1] > 0]
print('sections with content: %d' % len(haswords))
under = sorted([x for x in haswords if x[1] < 3000], key=lambda x: x[1])
print('under 3000: %d' % len(under))
for nid, c in under:
    print('   %-14s %5d' % (nid, c))
