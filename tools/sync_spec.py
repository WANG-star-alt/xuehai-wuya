# -*- coding: utf-8 -*-
"""
规范状态同步工具 —— 把合规检查结果写进 tree-data.js 的 spec 字段。

用法：
  python sync_spec.py           # 按当前规范检查，自动标记 pass / todo
  python sync_spec.py --reset   # 全部重置为 todo（设定新标准时用）
  python sync_spec.py --report  # 只看报告，不改文件

spec 字段含义：
  'pass' —— 已按当前规范改造完成
  'todo' —— 待改造
  无字段 —— 尚未撰写的节点（不显示徽标）
"""
import re, io, os, sys

ROOT = r'd:\TRAE 工作空间\xuehai-wuya'
TREE = os.path.join(ROOT, 'assets', 'tree-data.js')

# ============ 当前规范阈值（改标准时改这里） ============
MIN_WORDS      = 3000   # 节正文页字数下限
MIN_H3         = 8      # h3 数量下限
PLAIN_PER_KILO = 1.5    # 每千字应有的大白话句式数
PLAIN_FLOOR    = 5      # 大白话句式绝对下限
MIN_LIFE       = 5      # 生活类比场景种类下限

PLAIN = ['说白了', '听着玄', '换成大白话', '其实就是', '干的活儿', '打个比方',
         '相当于', '好比', '就像', '想象一下', '不妨这样想', '通俗地说',
         '简单说', '本质上就是', '翻译成人话']

LIFE = ['厨房', '菜市场', '快递', '餐厅', '公交', '地铁', '医院', '学校', '办公室',
        '装修', '洗衣', '停车', '流水线', '图书馆', '相亲', '招聘', '点菜', '开会',
        '分诊', '分拣', '翻译', '外卖', '超市', '银行', '邮局', '厨师',
        '冰箱', '案板', '调料', '水管', '打电话', '门牌', '通讯录', '收音机',
        '乐高', '下山', '前台', '包裹', '绣花', '雕刻', '照片', '作业', '考试',
        '小区', '电梯', '钥匙', '安检', '印章', '便签', '传送带', '会议', '车间',
        '仓库', '货架', '排队', '窗口', '挂号', '科室', '教室', '黑板', '笔记']


def check(href):
    """返回 (状态, 说明)。状态: pass / todo / none(未撰写)"""
    p = os.path.join(ROOT, href.replace('/', os.sep).split('#')[0])
    if not os.path.exists(p):
        return 'none', '文件不存在'
    raw = io.open(p, encoding='utf-8').read()
    s = re.sub(r'<script.*?</script>|<style.*?</style>', '', raw, flags=re.S)
    s = re.sub(r'<div class="lab"[^>]*></div>', '', s, flags=re.S)
    body = re.sub(r'<[^>]+>', '', s)
    w = len(re.findall(r'[\u4e00-\u9fff]', body))
    if w < 300:
        return 'none', '未撰写'

    fails = []
    if w < MIN_WORDS:
        fails.append('字数 %d<%d' % (w, MIN_WORDS))
    h3 = len(re.findall(r'<h3', raw))
    if h3 < MIN_H3:
        fails.append('h3 %d<%d' % (h3, MIN_H3))
    need = max(PLAIN_FLOOR, int(w / 1000 * PLAIN_PER_KILO))
    ph = sum(body.count(k) for k in PLAIN)
    if ph < need:
        fails.append('大白话 %d<%d' % (ph, need))
    lh = sum(1 for k in LIFE if k in body)
    if lh < MIN_LIFE:
        fails.append('类比 %d<%d' % (lh, MIN_LIFE))
    if 'analogy' not in raw:
        fails.append('缺譬喻框')
    if 'data-lab="quiz"' not in raw:
        fails.append('缺测验')

    return ('pass', 'OK · %d字 %dh3 %d白话 %d类比' % (w, h3, ph, lh)) if not fails \
        else ('todo', ' / '.join(fails))


def main():
    reset      = '--reset'  in sys.argv
    report_only= '--report' in sys.argv

    src = io.open(TREE, encoding='utf-8').read()

    # 匹配带 href 的叶子节点（单行写法）
    pat = re.compile(
        r"(createNode\('([a-z0-9\-]+)',\s*'(?:[^'\\]|\\.)*',\s*'(?:[^'\\]|\\.)*',\s*"
        r"'[^']*',\s*\[\]\s*,\s*\{)([^}]*?)(\}\s*\))")

    stats = {'pass': 0, 'todo': 0, 'none': 0}
    details = []

    def repl(m):
        head, nid, opts, tail = m.group(1), m.group(2), m.group(3), m.group(4)
        hm = re.search(r"href:\s*'([^']+)'", opts)
        if not hm:
            return m.group(0)
        st, why = check(hm.group(1))
        if reset and st == 'pass':
            st, why = 'todo', '手动重置（新标准）'
        stats[st] += 1
        details.append((nid, st, why))
        # 清掉旧的 spec 再写新的
        opts_clean = re.sub(r",?\s*spec:\s*'[^']*'", '', opts).rstrip().rstrip(',')
        if st == 'none':
            return head + opts_clean + tail
        return head + opts_clean + ", spec: '%s'" % st + tail

    new = pat.sub(repl, src)

    if not report_only:
        io.open(TREE, 'w', encoding='utf-8').write(new)

    # ---------- 输出 ----------
    print('=' * 68)
    print('规范状态同步  %s' % ('[重置模式]' if reset else '[报告模式]' if report_only else '[写入模式]'))
    print('阈值：字数≥%d  h3≥%d  大白话≥每千字%.1f(底线%d)  类比≥%d种'
          % (MIN_WORDS, MIN_H3, PLAIN_PER_KILO, PLAIN_FLOOR, MIN_LIFE))
    print('=' * 68)
    print('已达标 %d 篇 · 待改造 %d 篇 · 未撰写 %d 篇\n'
          % (stats['pass'], stats['todo'], stats['none']))

    todo = [d for d in details if d[1] == 'todo']
    if todo:
        print('--- 待改造清单 ---')
        for nid, st, why in todo:
            print('  %-14s %s' % (nid, why))
    print()
    ok = [d for d in details if d[1] == 'pass']
    if ok:
        print('--- 已达标 %d 篇 ---' % len(ok))
        for nid, st, why in ok:
            print('  %-14s %s' % (nid, why))


if __name__ == '__main__':
    main()
