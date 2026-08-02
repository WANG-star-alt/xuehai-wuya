# -*- coding: utf-8 -*-
"""全站合规自检 —— 对照 SKILL.md 最新规范逐条检查。
检查项：
 A. 结构完整性（§6 必备元素）
 B. 字数（§6 下限 3000 / 章总览 600）
 C. 大白话与生活类比（§6.2 第一准则）
 D. 资源引用（float-pager.js / interactive.css+js）
 E. HTML 标签平衡与代码块转义
"""
import re, io, os, glob
from collections import defaultdict

ROOT = r'd:\TRAE 工作空间\xuehai-wuya'
CH   = os.path.join(ROOT, 'chapters')

# ---------- 大白话句式（§6.2 硬规则一） ----------
PLAIN = ['说白了', '听着玄', '换成大白话', '其实就是', '干的活儿', '打个比方',
         '相当于', '好比', '就像', '想象一下', '不妨这样想', '通俗地说',
         '简单说', '本质上就是', '翻译成人话']

# ---------- 生活类比场景词（§6.2 硬规则二） ----------
LIFE = ['厨房', '菜市场', '快递', '餐厅', '公交', '地铁', '医院', '学校', '办公室',
        '装修', '洗衣', '停车', '流水线', '图书馆', '相亲', '招聘', '点菜', '开会',
        '分诊', '分拣', '翻译', '外卖', '超市', '银行', '邮局', 'food', '厨师',
        '冰箱', '案板', '调料', '水管', '打电话', '门牌', '通讯录', '收音机',
        '乐高', '下山', '前台', '包裹', '绣花', '雕刻', '照片', '作业', '考试',
        '小区', '电梯', '钥匙', '安检', '印章', '便签', '传送带', '会议', '车间',
        '仓库', '货架', '排队', '窗口', '挂号', '科室', '教室', '黑板', '笔记']

def clean(raw):
    s = re.sub(r'<script.*?</script>|<style.*?</style>', '', raw, flags=re.S)
    s = re.sub(r'<div class="lab"[^>]*></div>', '', s, flags=re.S)
    return s

def cn(text):
    return len(re.findall(r'[\u4e00-\u9fff]', text))

def audit(path):
    raw = io.open(path, encoding='utf-8').read()
    s = clean(raw)
    body = re.sub(r'<[^>]+>', '', s)
    n = os.path.basename(path)
    # 03-history.html 是单文件承载 5 个节（锚点区分），按节正文页对待
    SINGLE_FILE_SECTIONS = {'03-history.html'}
    is_sec = bool(re.match(r'^\d+-\d+-', n)) or n in SINGLE_FILE_SECTIONS
    is_ch  = bool(re.match(r'^\d+-[a-z]', n)) and n not in SINGLE_FILE_SECTIONS

    r = {'file': n, 'kind': 'sec' if is_sec else ('ch' if is_ch else '?'),
         'cn': cn(body), 'issues': []}
    if not is_sec and not is_ch:
        r['kind'] = 'skip'; return r

    # ---------- 未撰写的页面单独标记 ----------
    if r['cn'] < 300:
        r['issues'].append('未撰写（正文 %d 字）' % r['cn'])
        r['kind'] = 'todo'
        return r

    # ---------- A. 结构 ----------
    if is_sec:
        if 'class="lead"' not in raw and "class='lead'" not in raw:
            r['issues'].append('缺 p.lead')
        if 'class="scene"' not in raw:
            r['issues'].append('缺 div.scene')
        h3 = len(re.findall(r'<h3', raw))
        r['h3'] = h3
        if h3 < 8:
            r['issues'].append('h3 只有 %d 个（规范 8–20）' % h3)
        if 'callout analogy' not in raw and 'analogy' not in raw:
            r['issues'].append('缺 div.callout.analogy 譬喻框')
        if 'keylist' not in raw and 'table-wrap' not in raw:
            r['issues'].append('缺 ul.keylist / table-wrap')
        if 'data-lab="quiz"' not in raw:
            r['issues'].append('缺 quiz 互动组件')
        if raw.count('class="callout') < 2:
            r['issues'].append('callout 少于 2 个（譬喻 + Recap）')
        if r['cn'] < 3000:
            r['issues'].append('字数 %d < 3000' % r['cn'])
    else:
        for need, label in [('class="lead"', 'p.lead'), ('cards', 'div.cards'),
                            ('keylist', 'ul.keylist'), ('analogy', 'callout.analogy')]:
            if need not in raw:
                r['issues'].append('章总览缺 %s' % label)
        if r['cn'] < 600:
            r['issues'].append('章总览字数 %d < 600' % r['cn'])
        if 'data-lab' in raw:
            r['issues'].append('章总览页不应放互动组件')

    if 'class="pager"' not in raw:
        r['issues'].append('缺 div.pager')

    # ---------- C. 大白话与类比（只查节正文页） ----------
    if is_sec:
        p_hits = sum(body.count(k) for k in PLAIN)
        l_hits = sum(1 for k in LIFE if k in body)
        r['plain'] = p_hits
        r['life']  = l_hits
        # 密度标准：每 1000 中文字至少 1.5 处大白话句式
        need = max(5, int(r['cn'] / 1000 * 1.5))
        if p_hits < need:
            r['issues'].append('大白话句式仅 %d 处（按篇幅应 ≥%d）' % (p_hits, need))
        if l_hits < 5:
            r['issues'].append('生活类比场景仅 %d 种（应 ≥5）' % l_hits)

    # ---------- D. 资源引用 ----------
    if 'float-pager.js' not in raw:
        r['issues'].append('未引 float-pager.js')
    has_lab = 'data-lab' in raw
    if has_lab:
        if 'interactive.css' not in raw: r['issues'].append('用了组件但未引 interactive.css')
        if 'interactive.js'  not in raw: r['issues'].append('用了组件但未引 interactive.js')
    else:
        if 'interactive.js' in raw: r['issues'].append('没用组件却引了 interactive.js')

    # ---------- E. 标签与转义 ----------
    for tag in ('div', 'article', 'table', 'pre', 'code', 'ul', 'section'):
        o = len(re.findall(r'<%s[\s>]' % tag, raw))
        c = len(re.findall(r'</%s>' % tag, raw))
        if o != c:
            r['issues'].append('<%s> 开 %d 闭 %d 不平衡' % (tag, o, c))
    for m in re.finditer(r'<pre[^>]*>(.*?)</pre>', raw, re.S):
        inner = re.sub(r'</?code[^>]*>', '', m.group(1))
        bad = len(re.findall(r'<(?![/!])', inner))
        if bad:
            r['issues'].append('代码块有 %d 处未转义的 <' % bad); break
    return r


rows = []
for d in ('ai', 'network', 'gui'):
    for p in sorted(glob.glob(os.path.join(CH, d, '*.html'))):
        r = audit(p)
        if r['kind'] == 'skip': continue
        r['branch'] = d
        rows.append(r)

secs  = [r for r in rows if r['kind'] == 'sec']
chs   = [r for r in rows if r['kind'] == 'ch']
todos = [r for r in rows if r['kind'] == 'todo']
bad   = [r for r in rows if r['issues'] and r['kind'] != 'todo']

print('=' * 78)
print('全站合规自检（对照 SKILL.md 最新规范）')
print('=' * 78)
print('已撰写节正文页 %d 篇 · 章总览页 %d 篇 · 尚未撰写 %d 篇' % (len(secs), len(chs), len(todos)))
print()

if secs:
    print('--- 节正文页指标 ---')
    print('%-30s %6s %4s %6s %5s' % ('文件', '字数', 'h3', '大白话', '类比'))
    for r in sorted(secs, key=lambda x: x['plain'] / max(1, x['cn'] / 1000)):
        flag = '  <<<' if r['issues'] else ''
        print('%-30s %6d %4d %6d %5d%s' % (
            r['file'][:28], r['cn'], r.get('h3', 0), r.get('plain', 0), r.get('life', 0), flag))
    print()

print('=' * 78)
if bad:
    print('!! 不符合规范：%d 篇' % len(bad))
    print('=' * 78)
    for r in bad:
        print('\n[%s] %s  (%d 字)' % (r['branch'], r['file'], r['cn']))
        for i in r['issues']:
            print('    - ' + i)
else:
    print('已撰写页面全部符合最新规范')
print()
print('尚未撰写：%d 篇' % len(todos))
