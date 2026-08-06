# -*- coding: utf-8 -*-
"""
学海无涯 HTML -> Obsidian 库 转换器
- 保留结构语义：scene/callout/analogy/table/quiz/recap -> Markdown + callout 语法
- 自动抽取 [[双向链接]]：正文里的 § X.Y 引用、pager 上下节、章节归属
- 生成 YAML frontmatter（篇/章/节/字数/标签）
- 生成 MOC 索引页（篇级 + 章级）
"""
import io, os, re, html, json, collections

SRC = r'd:\TRAE 工作空间\xuehai-wuya\chapters'
OUT = r'd:\TRAE 工作空间\xuehai-wuya-obsidian'

BRANCH = {
    'ai':      ('智能篇', '#4a6d8c'),
    'network': ('网络篇', '#556b3d'),
    'gui':     ('界面篇', '#8a5a7a'),
    'elec':    ('电学篇', '#a0662c'),
}

# ---------------- 工具 ----------------
def rd(p):
    return io.open(p, encoding='utf-8').read()

def unesc(s):
    return html.unescape(s)

def strip_tags(s):
    """保留 strong/mark/code 的语义，转成 Markdown"""
    # keylist 的 k/v 结构（可能出现在 callout 内部）
    s = re.sub(r'<li[^>]*>\s*<span class="k">(.*?)</span>\s*<span class="v">(.*?)</span>\s*</li>',
               r'<li>__K__\1__KV__\2</li>', s, flags=re.S)
    s = re.sub(r'<li[^>]*>(.*?)</li>', r'\n- \1', s, flags=re.S)
    s = re.sub(r'<h4[^>]*>(.*?)</h4>', r'\n**\1**\n', s, flags=re.S)
    s = re.sub(r'<br\s*/?>', '\n', s)
    # 嵌套 <strong> 会导致外层配对错乱，先把内层拆掉
    for _ in range(3):
        s2 = re.sub(r'<strong>([^<]*)<strong>(.*?)</strong>', r'<strong>\1\2', s, flags=re.S)
        if s2 == s:
            break
        s = s2
    s = re.sub(r'<strong>(.*?)</strong>', r'**\1**', s, flags=re.S)
    s = re.sub(r'<b>(.*?)</b>', r'**\1**', s, flags=re.S)
    s = re.sub(r'<em>(.*?)</em>', r'*\1*', s, flags=re.S)
    # mark.key 是全站的「重点句」标记 -> Obsidian 高亮
    s = re.sub(r'<mark[^>]*>(.*?)</mark>', r'==\1==', s, flags=re.S)
    s = re.sub(r'<code>(.*?)</code>', r'`\1`', s, flags=re.S)
    s = re.sub(r'<a[^>]*>(.*?)</a>', r'\1', s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    s = unesc(s)
    # 还原 keylist 占位符
    s = re.sub(r'__K__(.*?)__KV__', r'**\1** — ', s, flags=re.S)
    s = re.sub(r'[ \t]+', ' ', s)
    return s.strip()

def cn_count(s):
    return len(re.findall(r'[\u4e00-\u9fff]', s))

def q(s):
    """把多段文本转成 Obsidian callout 内部行：空行也要带 '>'，否则引用块会断开"""
    lines = [ln.strip() for ln in s.split('\n')]
    out = []
    for ln in lines:
        out.append('> ' + ln if ln else '>')
    # 去掉首尾空引用行
    while out and out[0] == '>':
        out.pop(0)
    while out and out[-1] == '>':
        out.pop()
    return '\n'.join(out)

def qz_text(s):
    """quiz 的 data-* 属性值里可能含 <code>/<strong> 等标签，转成 Markdown"""
    s = unesc(s)
    s = re.sub(r'<code>(.*?)</code>', r'`\1`', s, flags=re.S)
    s = re.sub(r'<strong>(.*?)</strong>', r'**\1**', s, flags=re.S)
    s = re.sub(r'<em>(.*?)</em>', r'*\1*', s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    return s.strip()

def esc_wiki(s):
    """代码块里的 [[...]] 会被 Obsidian 当成内链，转义掉"""
    return s.replace('[[', '[\u200b[').replace(']]', ']\u200b]')

# ---------------- 表格转换 ----------------
def conv_table(tbl_html):
    rows = []
    for tr in re.findall(r'<tr>(.*?)</tr>', tbl_html, flags=re.S):
        cells = re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', tr, flags=re.S)
        if cells:
            rows.append([strip_tags(c).replace('\n', ' ').replace('|', r'\|') for c in cells])
    if not rows:
        return ''
    w = max(len(r) for r in rows)
    rows = [r + [''] * (w - len(r)) for r in rows]
    out = ['| ' + ' | '.join(rows[0]) + ' |',
           '|' + '|'.join(['---'] * w) + '|']
    for r in rows[1:]:
        out.append('| ' + ' | '.join(r) + ' |')
    return '\n'.join(out)

# ---------------- 嵌套 div 配平提取 ----------------
def extract_divs(body):
    """按出现顺序提取顶层块，正确处理嵌套 div。
    返回 [(start, end, cls, inner)]"""
    out = []
    for m in re.finditer(r'<div class="([^"]+)"([^>]*)>', body):
        cls = m.group(1)
        # 只关心这几类顶层块（journey/cards 是容器，step/card 是其子项）
        if cls.split()[0] not in ('scene', 'callout', 'table-wrap', 'lab',
                                  'journey', 'cards', 'step', 'card', 'link'):
            continue
        # 跳过已被前一个块包含的
        if out and m.start() < out[-1][1]:
            continue
        depth = 1
        i = m.end()
        while depth > 0:
            nxt = re.search(r'<div\b|</div>', body[i:])
            if not nxt:
                break
            if nxt.group(0) == '</div>':
                depth -= 1
            else:
                depth += 1
            i += nxt.end()
        out.append((m.start(), i, cls, body[m.end():i - len('</div>')]))
    return out

# ---------------- 正文块解析 ----------------
def parse_body(body):
    """按出现顺序把 body 拆成 Markdown 块（先摘出配平的 div 块，再扫剩余文本）"""
    divs = extract_divs(body)
    # 用占位符替换 div 区域，保证顺序
    marks = {}
    newbody = []
    pos = 0
    for idx, (s, e, cls, inner) in enumerate(divs):
        newbody.append(body[pos:s])
        ph = '@@DIV%d@@' % idx
        newbody.append(ph)
        marks[ph] = (cls, inner, body[s:e])
        pos = e
    newbody.append(body[pos:])
    body = ''.join(newbody)

    blocks = []
    pat = re.compile(
        r'<h3[^>]*>(?P<h3>.*?)</h3>'
        r'|<h4[^>]*>(?P<h4>.*?)</h4>'
        r'|<p class="lead">(?P<lead>.*?)</p>'
        r'|(?P<ph>@@DIV\d+@@)'
        r'|<pre><code[^>]*>(?P<code>.*?)</code></pre>'
        r'|<ul[^>]*>(?P<ul>.*?)</ul>'
        r'|<ol[^>]*>(?P<ol>.*?)</ol>'
        r'|<p[^>]*>(?P<p>.*?)</p>',
        flags=re.S)

    for m in pat.finditer(body):
        g = m.lastgroup
        v = m.group(g)
        if g == 'h3':
            blocks.append(('h3', strip_tags(v)))
        elif g == 'h4':
            blocks.append(('h4', strip_tags(v)))
        elif g == 'lead':
            blocks.append(('lead', strip_tags(v)))
        elif g == 'ph':
            cls, inner, full = marks[v]
            base = cls.split()[0]
            if base == 'scene':
                tag = re.search(r'class="scene-tag">(.*?)<', inner, flags=re.S)
                ttl = re.search(r'class="scene-title">(.*?)</div>', inner, flags=re.S)
                txt = re.sub(r'<span class="scene-tag">.*?</span>', '', inner, flags=re.S)
                txt = re.sub(r'<div class="scene-title">.*?</div>', '', txt, flags=re.S)
                blocks.append(('scene', (
                    strip_tags(tag.group(1)) if tag else '生活场景',
                    strip_tags(ttl.group(1)) if ttl else '',
                    strip_tags(txt))))
            elif base == 'callout':
                tag = re.search(r'class="tag">(.*?)<', inner, flags=re.S)
                txt = re.sub(r'<span class="tag">.*?</span>', '', inner, flags=re.S)
                kind2 = 'analogy' if 'analogy' in cls else 'callout'
                blocks.append((kind2, (strip_tags(tag.group(1)) if tag else '',
                                       strip_tags(txt))))
            elif base == 'table-wrap':
                t = re.search(r'<table>.*?</table>', inner, flags=re.S)
                if t:
                    blocks.append(('table', conv_table(t.group(0))))
            elif base == 'lab':
                attrs = dict(re.findall(r'data-([a-z]+)="([^"]*)"', full))
                blocks.append(('lab', attrs))
            elif base in ('journey', 'cards'):
                # 容器：展开内部的 step / card 子项（card 可能是 <a class="card" href>）
                items = []
                parts = re.split(r'(?=<(?:div|a) class="(?:step|card)")', inner)
                for seg in parts:
                    if not re.match(r'<(?:div|a) class="(?:step|card)"', seg or ''):
                        continue
                    href = re.search(r'href="\./([^"]+\.html)"', seg)
                    num = re.search(r'class="card-num">(.*?)</div>', seg, flags=re.S)
                    h4 = re.search(r'<h4>(.*?)</h4>', seg, flags=re.S)
                    txt = re.sub(r'<div class="card-num">.*?</div>', '', seg, flags=re.S)
                    txt = re.sub(r'<h4>.*?</h4>', '', txt, flags=re.S)
                    items.append((strip_tags(num.group(1)) if num else '',
                                  strip_tags(h4.group(1)) if h4 else '',
                                  strip_tags(txt),
                                  href.group(1) if href else None))
                blocks.append(('steps', items))
            elif base == 'step' or base == 'card':
                num = re.search(r'class="card-num">(.*?)</div>', inner, flags=re.S)
                h4 = re.search(r'<h4>(.*?)</h4>', inner, flags=re.S)
                txt = re.sub(r'<div class="card-num">.*?</div>', '', inner, flags=re.S)
                txt = re.sub(r'<h4>.*?</h4>', '', txt, flags=re.S)
                blocks.append(('steps', [(strip_tags(num.group(1)) if num else '',
                                          strip_tags(h4.group(1)) if h4 else '',
                                          strip_tags(txt), None)]))
            elif base == 'link':
                blocks.append(('link', strip_tags(inner)))
        elif g == 'code':
            blocks.append(('code', unesc(re.sub(r'<[^>]+>', '', v))))
        elif g in ('ul', 'ol'):
            items = []
            for li in re.findall(r'<li[^>]*>(.*?)</li>', v, flags=re.S):
                # keylist 结构：<span class="k">键</span><span class="v">值</span>
                k = re.search(r'<span class="k">(.*?)</span>', li, flags=re.S)
                val = re.search(r'<span class="v">(.*?)</span>', li, flags=re.S)
                if k and val:
                    items.append('**%s** — %s' % (strip_tags(k.group(1)),
                                                  strip_tags(val.group(1))))
                else:
                    items.append(strip_tags(li))
            blocks.append((g, items))
        elif g == 'p':
            t = strip_tags(v)
            if t:
                blocks.append(('p', t))
    return blocks

# ---------------- 主转换 ----------------
def title_of(h):
    m = re.search(r'<header class="chapter-head">(.*?)</header>', h, flags=re.S)
    if not m:
        return '', '', ''
    blk = m.group(1)
    num = re.search(r'class="num">(.*?)</div>', blk, flags=re.S)
    h1 = re.search(r'<h1>(.*?)</h1>', blk, flags=re.S)
    cn = re.search(r'class="cn">(.*?)</div>', blk, flags=re.S)
    return (strip_tags(num.group(1)) if num else '',
            strip_tags(h1.group(1)) if h1 else '',
            strip_tags(cn.group(1)) if cn else '')

pages = {}   # fname -> meta
for br in BRANCH:
    d = os.path.join(SRC, br)
    if not os.path.isdir(d):
        continue
    for fn in sorted(os.listdir(d)):
        if not fn.endswith('.html'):
            continue
        raw = rd(os.path.join(d, fn))
        num, h1, cn = title_of(raw)
        # 节号：01-1-xx -> 1.1 ；章：01-xx -> 1
        mm = re.match(r'(\d+)-(\d+)-', fn)
        if mm:
            kind, ch, sec = 'section', int(mm.group(1)), int(mm.group(2))
        else:
            kind, ch, sec = 'chapter', int(re.match(r'(\d+)', fn).group(1)), 0
        pages[(br, fn)] = dict(branch=br, fn=fn, kind=kind, ch=ch, sec=sec,
                               num=num, h1=h1, cn=cn, raw=raw)

print('pages loaded:', len(pages))

# 建立 §X.Y -> 笔记名 的索引（用于抽双向链接）
sec_index = {}    # (br, ch, sec) -> note title
note_name = {}    # (br, fn) -> note title

def safe(nm):
    """文件名安全化：Windows 非法字符 + Obsidian 链接里会出问题的字符。
    注意必须幂等——safe(safe(x)) == safe(x)，否则链接名和文件名会对不上。"""
    nm = re.sub(r'[\\/:*?"<>|#^\[\]]', ' ', nm)
    nm = nm.replace('\u00a0', ' ')
    return re.sub(r'\s+', ' ', nm).strip()

def norm_cn(s):
    """只保留汉字，用于判断标题里有多少中文"""
    return ''.join(re.findall(r'[\u4e00-\u9fff]', s))

for k, p in pages.items():
    br = p['branch']
    bn = BRANCH[br][0]
    if p['kind'] == 'section':
        t = p['h1']
        # 标题过短（如「TCP」）时补上中文副标题，便于在图谱里辨识
        if len(norm_cn(t)) < 2 and p['cn']:
            t = '%s · %s' % (t, p['cn'])
        nm = safe(u'%s §%d.%d %s' % (bn, p['ch'], p['sec'], t))
        sec_index[(br, p['ch'], p['sec'])] = nm
    else:
        # 章总览页的 h1 通常已含「第 N 章 · 」前缀，避免重复
        t = re.sub(r'^第\s*\d+\s*章\s*[·・:：]?\s*', '', p['h1']).strip()
        nm = safe(u'%s 第%d章 %s' % (bn, p['ch'], t or p['h1']))
        sec_index[(br, p['ch'], 0)] = nm
    note_name[k] = nm

os.makedirs(OUT, exist_ok=True)

link_pairs = []   # (from, to, type)

def render(p, key):
    br = p['branch']
    bn, color = BRANCH[br]
    body = re.search(r'<header class="chapter-head">.*?</header>(.*?)<div class="pager">',
                     p['raw'], flags=re.S)
    body = body.group(1) if body else ''
    blocks = parse_body(body)

    lines = []
    plain = []          # 用于字数统计
    quiz = []
    nav_links = []      # 章总览页导航卡片指向的节

    for kind, v in blocks:
        if kind == 'h3':
            lines.append('\n## ' + v + '\n'); plain.append(v)
        elif kind == 'h4':
            lines.append('\n### ' + v + '\n'); plain.append(v)
        elif kind == 'lead':
            lines.append('> [!abstract] 导读\n' + q(v) + '\n'); plain.append(v)
        elif kind == 'scene':
            tag, ttl, txt = v
            lines.append('> [!example] %s%s\n%s\n' % (
                tag, (' · ' + ttl) if ttl else '', q(txt)))
            plain.append(txt)
        elif kind == 'analogy':
            tag, txt = v
            lines.append('> [!tip] %s\n%s\n' % (tag or 'Analogy · 譬喻', q(txt)))
            plain.append(txt)
        elif kind == 'callout':
            tag, txt = v
            ct = 'summary' if 'Recap' in tag else 'warning'
            lines.append('> [!%s] %s\n%s\n' % (ct, tag or '提示', q(txt)))
            plain.append(txt)
        elif kind == 'table':
            lines.append(v + '\n'); plain.append(v)
        elif kind == 'steps':
            for it in v:
                num, h4, txt, href = it
                head2 = ' · '.join([x for x in (num, h4) if x])
                if href:
                    k2 = (br, href)
                    tgt = note_name.get(k2)
                    if tgt:
                        # 卡片标题（num + h4）作为链接显示名，描述原样保留
                        lines.append('- [[%s|%s]]' % (tgt, head2 or tgt))
                        nav_links.append(tgt)
                        if head2:
                            plain.append(head2)
                        if txt:
                            lines.append('  %s' % txt.replace('\n', ' '))
                            plain.append(txt)
                        continue
                if head2:
                    lines.append('**%s**' % head2)
                    plain.append(head2)
                if txt:
                    lines.append(txt)
                    plain.append(txt)
                lines.append('')
        elif kind == 'link':
            lines.append('> %s\n' % v); plain.append(v)
        elif kind == 'code':
            lines.append('```\n' + esc_wiki(v.strip()) + '\n```\n')
        elif kind == 'ul':
            for it in v:
                lines.append('- ' + it.replace('\n', ' '))
                plain.append(it)
            lines.append('')
        elif kind == 'ol':
            for i, it in enumerate(v, 1):
                lines.append('%d. %s' % (i, it.replace('\n', ' ')))
                plain.append(it)
            lines.append('')
        elif kind == 'lab':
            if v.get('lab') == 'quiz':
                quiz.append(v)
            else:
                lines.append('> [!note] 互动组件 · `%s`\n> 网页版有一个可操作的小工具，'
                             'Obsidian 里不便交互，请到网页版体验。\n' % v.get('lab', ''))
        elif kind == 'p':
            lines.append(v + '\n'); plain.append(v)

    # quiz -> 折叠式自测
    for qz in quiz:
        opts = qz.get('opts', '').split('|')
        ans = int(qz.get('answer', '0') or 0)
        qtxt = qz_text(qz.get('q', ''))
        lines.append('\n> [!question]- 自测：%s' % qtxt)
        plain.append(qtxt)
        for i, o in enumerate(opts):
            lines.append('> %s. %s' % (chr(65 + i), qz_text(o)))
        lines.append('>')
        lines.append('> **答案：%s**' % (chr(65 + ans) if ans < len(opts) else '?'))
        ex = qz_text(qz.get('explain', ''))
        if ex:
            lines.append(q(ex))
            plain.append(ex)
        lines.append('')

    text = '\n'.join(lines)
    words = cn_count(' '.join(plain))

    # ---- 抽取双向链接 ----
    links = collections.OrderedDict()
    me = note_name[key]

    # 1) 正文里的 § X.Y 交叉引用（同篇内）——必须紧跟 § 符号，避免误抓数组字面量
    for mm in re.finditer(r'§\s*(\d{1,2})\.(\d{1,2})(?!\d)', text):
        tgt = sec_index.get((br, int(mm.group(1)), int(mm.group(2))))
        if tgt and tgt != me:
            links[tgt] = '正文引用'

    # 2) 归属章
    if p['kind'] == 'section':
        ch = sec_index.get((br, p['ch'], 0))
        if ch:
            links[ch] = '所属章'

    # 2.5) 章总览页 -> 各节（导航卡片）
    for t in nav_links:
        if t != me:
            links.setdefault(t, '本章小节')

    # 3) pager 上下节
    pg = re.search(r'<div class="pager">(.*?)</div>\s*<div class="page-foot"',
                   p['raw'], flags=re.S)
    if pg:
        for href in re.findall(r'href="\./([^"]+\.html)"', pg.group(1)):
            k2 = (br, href)
            if k2 in note_name and note_name[k2] != me:
                links.setdefault(note_name[k2], '相邻节')

    for t, ty in links.items():
        link_pairs.append((me, t, ty))

    # ---- frontmatter ----
    tags = ['学海无涯', bn.replace('篇', '')]
    if p['kind'] == 'section':
        tags.append('第%d章' % p['ch'])
    fm = []
    fm.append('---')
    fm.append('title: "%s"' % me)
    fm.append('branch: %s' % bn)
    fm.append('chapter: %d' % p['ch'])
    if p['kind'] == 'section':
        fm.append('section: "%d.%d"' % (p['ch'], p['sec']))
    fm.append('kind: %s' % p['kind'])
    fm.append('words: %d' % words)
    fm.append('color: "%s"' % color)
    fm.append('tags:')
    for t in tags:
        fm.append('  - %s' % t)
    fm.append('source: "chapters/%s/%s"' % (br, p['fn']))
    fm.append('---')

    head = ['', '# %s' % (p['h1'] or me)]
    if p['num']:
        head.append('*%s*' % p['num'])
    if p['cn']:
        head.append('*%s*' % p['cn'])
    head.append('')

    tail = ['', '---', '', '## 相关笔记', '']
    if links:
        for t, ty in links.items():
            tail.append('- [[%s]] — %s' % (t, ty))
    else:
        tail.append('- （暂无）')
    tail.append('')

    return '\n'.join(fm) + '\n'.join(head) + text + '\n'.join(tail), words

# 写笔记
os.makedirs(OUT, exist_ok=True)
total_words = 0
per_branch = collections.defaultdict(list)
for key, p in sorted(pages.items(), key=lambda x: (x[1]['branch'], x[1]['ch'], x[1]['sec'])):
    br = p['branch']
    bn = BRANCH[br][0]
    d = os.path.join(OUT, bn)
    os.makedirs(d, exist_ok=True)
    md, w = render(p, key)
    total_words += w
    fp = os.path.join(d, note_name[key] + '.md')
    io.open(fp, 'w', encoding='utf-8', newline='\n').write(md)
    per_branch[bn].append((p, note_name[key], w))

print('notes written:', len(pages), 'words:', total_words)
print('links:', len(link_pairs))

# ---- MOC 索引 ----
for bn, items in per_branch.items():
    lines = ['---', 'title: "%s · 索引"' % bn, 'kind: moc',
             'tags:\n  - 学海无涯\n  - MOC', '---', '',
             '# %s · 索引' % bn, '']
    cur = None
    for p, nm, w in items:
        if p['kind'] == 'chapter':
            cur = p['ch']
            lines.append('\n## [[%s|第 %d 章 · %s]]\n' % (nm, p['ch'], p['h1']))
        else:
            lines.append('- [[%s|§ %d.%d · %s]] — %d 字' % (nm, p['ch'], p['sec'], p['h1'], w))
    io.open(os.path.join(OUT, bn, '_%s 索引.md' % bn), 'w',
            encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')

# 总索引
lines = ['---', 'title: "学海无涯 · 总索引"', 'kind: moc',
         'tags:\n  - 学海无涯\n  - MOC', '---', '',
         '# 学海无涯 · 总索引', '',
         '共 **%d** 篇笔记，约 **%.1f 万字**。' % (len(pages), total_words / 10000.0), '',
         '## 四个分支', '']
for br, (bn, color) in BRANCH.items():
    n = len(per_branch.get(bn, []))
    if n:
        lines.append('- [[_%s 索引|%s]] — %d 篇' % (bn, bn, n))
io.open(os.path.join(OUT, '000 总索引.md'), 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')

# 链接统计
io.open(os.path.join(OUT, '_links.json'), 'w', encoding='utf-8').write(
    json.dumps([{'from': a, 'to': b, 'type': c} for a, b, c in link_pairs],
               ensure_ascii=False, indent=1))
print('MOC + links.json done')

# ---------------- Obsidian 配置：图谱按篇着色 ----------------
cfg = os.path.join(OUT, '.obsidian')
os.makedirs(cfg, exist_ok=True)

graph = {
    "collapse-filter": False, "search": "", "showTags": True,
    "showAttachments": False, "hideUnresolved": True, "showOrphans": True,
    "collapse-color-groups": False,
    "colorGroups": [
        {"query": "path:智能篇", "color": {"a": 1, "rgb": 4877708}},
        {"query": "path:网络篇", "color": {"a": 1, "rgb": 5597501}},
        {"query": "path:界面篇", "color": {"a": 1, "rgb": 9067130}},
        {"query": "path:电学篇", "color": {"a": 1, "rgb": 10511916}},
        {"query": "kind:moc", "color": {"a": 1, "rgb": 16744192}}
    ],
    "collapse-display": False, "showArrow": True, "textFadeMultiplier": -0.8,
    "nodeSizeMultiplier": 1.15, "lineSizeMultiplier": 1,
    "collapse-forces": False, "centerStrength": 0.42,
    "repelStrength": 12, "linkStrength": 0.55, "linkDistance": 190,
    "scale": 0.62, "close": False
}
io.open(os.path.join(cfg, 'graph.json'), 'w', encoding='utf-8').write(
    json.dumps(graph, ensure_ascii=False, indent=2))

appcfg = {
    "attachmentFolderPath": "_attachments",
    "newLinkFormat": "shortest",
    "useMarkdownLinks": False,
    "showLineNumber": False,
    "readableLineLength": True,
    "strictLineBreaks": False
}
io.open(os.path.join(cfg, 'app.json'), 'w', encoding='utf-8').write(
    json.dumps(appcfg, ensure_ascii=False, indent=2))

# README
readme = u"""# 学海无涯 · Obsidian 库

从 [学海无涯](https://github.com/WANG-star-alt/xuehai-wuya) 网页版自动转换而来。

## 怎么打开

1. 下载并安装 [Obsidian](https://obsidian.md/)（免费）
2. 打开 Obsidian → 左下角「打开另一个库」→「打开本地文件夹作为库」
3. 选中本文件夹（`xuehai-wuya-obsidian`）即可

## 库里有什么

| 内容 | 数量 |
|---|---|
| 笔记总数 | %d 篇 |
| 总字数 | 约 %.1f 万字 |
| 双向链接 | %d 条 |

四个分支各一个文件夹：**智能篇**（AI）、**网络篇**、**界面篇**（GUI）、**电学篇**（家庭用电）。

## 关系网怎么看

按 `Ctrl+G` 打开**图谱视图**，这就是你要的关系网。已经预设好按篇着色：

- 蓝色 = 智能篇
- 绿色 = 网络篇
- 紫色 = 界面篇
- 铜橙 = 电学篇
- 橙色 = 索引页（MOC）

关系分三类：**所属章**（节 → 它所在的章）、**本章小节**（章 → 它包含的节）、**正文引用**（一节在正文里提到了另一节）、**相邻节**（上一节 / 下一节）。

## 格式说明

网页版的特色板块都转成了 Obsidian 的 callout：

| 网页 | Obsidian |
|---|---|
| 导读 | `> [!abstract]` |
| 生活场景 | `> [!example]` |
| 譬喻框 | `> [!tip]` |
| 安全提示 | `> [!warning]` |
| Recap 收束 | `> [!summary]` |
| 小测验 | `> [!question]-`（折叠，点开看答案） |

正文里的重点句用 `==高亮==` 标出。每篇开头的 YAML 里有 `branch` / `chapter` / `words` 等字段，可以用 Dataview 做统计。

## 注意

网页版的互动小工具（子网计算器、三次握手动画等）无法在 Markdown 里交互，相应位置留了提示，请到网页版体验。
""" % (len(pages), total_words / 10000.0, len(link_pairs))
io.open(os.path.join(OUT, 'README.md'), 'w', encoding='utf-8', newline='\n').write(readme)
print('graph.json + app.json + README done')
